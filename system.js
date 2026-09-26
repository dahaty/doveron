// Interactive architecture and guided tutorial. All examples stay in the browser.
(() => {
 const system=document.querySelector('[data-system]');
 if(!system)return;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const cases={
  good:{intent:'«Договор подписан»',evidence:'Диадок: подписан, подпись есть',policy:'Каждому утверждению — подтверждение в источнике',verdict:'Разрешить ответ со ссылкой на источник',outcome:'allow',status:'Ответ подтверждён источником и разрешён политикой.',steps:[['Агент предлагает ответ','Агент хочет сообщить, что договор подписан. Его уверенность пока ничего не доказывает.'],['Получаем данные независимо','Шлюз обращается к Диадоку: статус «подписан», подпись присутствует. Проверяем источник, а не повторный ответ модели.'],['Применяем правило','Правило требует подтверждать статус договора в системе. Данные источника поддерживают утверждение.'],['Разрешаем отправку','Проверка пройдена. Ответ можно передать пользователю вместе с основанием; решение сохраняется в общей трассе.']]},
  fact:{intent:'«Договор подписан. Начинаем работу»',evidence:'Диадок: на согласовании, подписи нет',policy:'Нельзя сообщать о подписи без подтверждения',verdict:'Удержать ответ и вернуть агенту реальный статус',outcome:'block',status:'Ответ остановлен: источник не подтверждает подпись. Агент получает фактический статус для доработки.',steps:[['Находим проверяемое утверждение','В ответе агент утверждает, что договор уже подписан. Именно это утверждение должно быть проверено до отправки.'],['Проверяем первичный источник','Диадок возвращает статус «на согласовании». Подписи нет: ответ агента расходится с данными.'],['Выявляем нарушение правила','Политика запрещает сообщать о подписании без подтверждения. Просьба модели перепроверить себя не заменяет этот контроль.'],['Удерживаем исходный ответ','Ответ не отправляется. Агент получает текущий статус и готовит исправление, которое тоже должно пройти проверку.']]},
  permission:{intent:'crm.delete_records — удалить контакты',evidence:'CRM: инструмент удаления доступен',policy:'Права агента: только crm.read',verdict:'Заблокировать удаление до вызова CRM',outcome:'block',status:'Действие остановлено до выполнения. Доступ к API не даёт права удалять данные.',steps:[['Агент запрашивает действие','Агент пытается вызвать удаление контактов. Шлюз получает намерение до того, как операция попадёт в CRM.'],['Определяем инструмент','Коннектор предоставляет технический доступ к CRM. Наличие инструмента ещё не означает разрешение на любую операцию.'],['Сверяем права','Этому агенту выдано только чтение: crm.read. Удаление не входит в его разрешения.'],['Блокируем до выполнения','Вызов удаления не передаётся в CRM. Шлюз возвращает причину запрета и фиксирует её в трассе.']]},
  offline:{intent:'«Отправлю клиенту выгрузку всех заказов»',evidence:'В выгрузке — телефоны и адреса 1 240 клиентов',policy:'Персональные данные нельзя передавать за пределы компании',verdict:'Заблокировать отправку, событие — в SIEM',outcome:'human',status:'Отправка заблокирована. Агент получил причину и отправил клиенту только его собственные заказы.',steps:[['Агент готовит ответ','Клиент просит «историю заказов». Агент собирается приложить полную выгрузку из системы.'],['Контролёр проверяет данные','В файле — персональные данные 1 240 других клиентов: телефоны, адреса, суммы заказов.'],['Правило безопасности','Передавать чужие персональные данные запрещено. Это не ошибка формулировки, а утечка.'],['Блокируем и исправляем','Отправка остановлена, событие ушло в SIEM. Агент получил причину и отправил только заказы этого клиента.']]}
 };
 const descriptions={
  agent:['Ваш ИИ-агент','Шлюз получает ответ, вызов инструмента и контекст пользователя. Модель и логика приложения остаются вашим выбором.'],
  data:['Ваши системы','Согласованные коннекторы дают доступ к данным и инструментам. Для проверки ответа шлюз запрашивает основания в источнике, отдельно от рассуждений агента.'],
  rules:['Ваши правила','Команда задаёт права на операции, допустимые источники, лимиты и проверки. Любое изменение правил фиксируется в истории.'],
  engine:['Агент-контролёр Doveron','Сопоставляет утверждения с источниками, действия — с правами и сам принимает решение: разрешить, вернуть на исправление или заблокировать угрозу.'],
  allow:['Разрешить автоматически','Основной маршрут. Когда проверки пройдены, контролёр разрешает сам: ответ отправляется или действие выполняется без участия человека.'],
  block:['Вернуть на исправление','Запрос нарушает правило. Контролёр удерживает его до выполнения и возвращает агенту причину и верные данные — агент исправляется сам, и исправление снова проходит проверку.'],
  human:['Заблокировать угрозу','Утечка данных, вредоносная инструкция в сообщении или обход прав. Действие не выполняется, событие уходит в журнал безопасности и SIEM.']
 };
 const tabs=[...system.querySelectorAll('[data-system-case]')];
 const nodes=[...system.querySelectorAll('[data-system-node]')];
 const run=system.querySelector('[data-system-run]');
 const panel=system.querySelector('[data-tour-panel]');
 const inspector=system.querySelector('#system-inspector');
 const field=name=>system.querySelector('[data-system-'+name+']');
 let selected='good',generation=0,tourStep=0,interacted=false,busy=false;
 system.querySelectorAll('.system-signal,.system-loop-signal').forEach(p=>p.setAttribute('pathLength','100'));
 function setPhase(phase){
  system.dataset.phase=phase;const c=cases[selected];
  nodes.forEach(n=>n.classList.toggle('is-active',n.dataset.systemNode===phase||(phase==='engine'&&n.dataset.systemNode==='engine')||(phase==='done'&&n.dataset.systemNode===c.outcome)));
  field('live').textContent=phase==='done'?c.status:({ready:'Запустите пример и проследите путь запроса.',agent:'Получаем ответ или намерение агента.',data:'Запрашиваем подтверждение в подключённой системе.',rules:'Проверяем основания ответа и права на действие.',engine:'Шлюз выбирает маршрут по результатам проверки.'}[phase]);
  system.querySelector('[data-engine-status]').textContent=phase==='done'?'РЕШЕНИЕ ЗАПИСАНО':phase==='ready'?'НЕЗАВИСИМЫЙ КОНТУР':'ПРОВЕРКА ЗАПРОСА';
 }
 function selectCase(key){
  generation++;busy=false;selected=key;const c=cases[key];
  system.dataset.scenario=key;system.dataset.outcome=c.outcome;run.disabled=false;field('run-label').textContent='Показать поток';
  tabs.forEach(t=>{const active=t.dataset.systemCase===key;t.setAttribute('aria-selected',active);t.tabIndex=active?0:-1;});
  system.querySelector('[role=tabpanel]').setAttribute('aria-labelledby','system-case-'+key);
  ['intent','evidence','policy','verdict'].forEach(k=>field(k).textContent=c[k]);
  setPhase('ready');if(!panel.hidden)showStep(0,false);
 }
 function showStep(index,scroll){
  generation++;busy=false;run.disabled=false;field('run-label').textContent='Показать поток';
  tourStep=Math.max(0,Math.min(3,index));panel.hidden=false;system.classList.add('is-touring');
  const c=cases[selected],step=c.steps[tourStep];
  system.querySelector('[data-tour-counter]').textContent=`ШАГ ${tourStep+1} ИЗ 4`;
  system.querySelector('[data-tour-title]').textContent=step[0];
  system.querySelector('[data-tour-copy]').textContent=step[1];
  system.querySelectorAll('[data-tour-step]').forEach((b,i)=>{if(i===tourStep)b.setAttribute('aria-current','step');else b.removeAttribute('aria-current');});
  system.querySelector('[data-tour-prev]').disabled=tourStep===0;
  system.querySelector('[data-tour-next]').textContent=tourStep===3?'Готово ✓':'Далее →';
  const phase=['agent','data','rules','done'][tourStep];setPhase(phase);
  if(tourStep===2)system.querySelector('[data-system-node=engine]').classList.add('is-active');
  if(scroll&&matchMedia('(max-width:760px)').matches){const node=system.querySelector(`[data-system-node="${phase==='done'?c.outcome:phase}"]`);node.scrollIntoView({behavior:reduced.matches?'instant':'smooth',block:'center'});}
 }
 function closeTour(){panel.hidden=true;system.classList.remove('is-touring');system.querySelector('[data-tour-start]').focus();}
 async function play(auto=false){
  if(busy)return;if(!auto)interacted=true;panel.hidden=true;system.classList.remove('is-touring');
  const token=++generation;busy=true;run.disabled=true;field('run-label').textContent='Проверяем…';
  const fast=reduced.matches||system.classList.contains('is-paused')||document.body.classList.contains('motion-paused');
  for(const phase of ['agent','data','rules','engine']){
   if(token!==generation)return;setPhase(phase);await new Promise(resolve=>setTimeout(resolve,fast?0:850));
  }
  if(token!==generation)return;setPhase('done');busy=false;run.disabled=false;field('run-label').textContent='Повторить поток';
 }
 tabs.forEach((t,i)=>{t.addEventListener('click',()=>{interacted=true;selectCase(t.dataset.systemCase);});t.addEventListener('keydown',e=>{let next;if(e.key==='ArrowRight')next=(i+1)%tabs.length;if(e.key==='ArrowLeft')next=(i+tabs.length-1)%tabs.length;if(e.key==='Home')next=0;if(e.key==='End')next=tabs.length-1;if(next!==undefined){e.preventDefault();interacted=true;selectCase(tabs[next].dataset.systemCase);tabs[next].focus();}});});
 run.addEventListener('click',()=>play());
 nodes.forEach(n=>n.addEventListener('click',()=>{interacted=true;const key=n.dataset.systemNode;const open=n.getAttribute('aria-expanded')==='true';nodes.forEach(node=>node.setAttribute('aria-expanded','false'));inspector.hidden=open;if(open)return;n.setAttribute('aria-expanded','true');const d=descriptions[key];system.querySelector('[data-system-inspector-title]').textContent=d[0];system.querySelector('[data-system-inspector-copy]').textContent=d[1];}));
 system.querySelector('[data-system-inspector-close]').addEventListener('click',()=>{const active=nodes.find(n=>n.getAttribute('aria-expanded')==='true');nodes.forEach(n=>n.setAttribute('aria-expanded','false'));inspector.hidden=true;active?.focus();});
 system.querySelector('[data-tour-start]').addEventListener('click',()=>{interacted=true;showStep(0,false);});
 system.querySelector('[data-tour-prev]').addEventListener('click',()=>showStep(tourStep-1,true));
 system.querySelector('[data-tour-next]').addEventListener('click',()=>{if(tourStep===3)closeTour();else showStep(tourStep+1,true);});
 system.querySelector('[data-tour-close]').addEventListener('click',closeTour);
 system.querySelectorAll('[data-tour-step]').forEach(b=>b.addEventListener('click',()=>showStep(Number(b.dataset.tourStep),true)));
 panel.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();closeTour();}if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();showStep(tourStep+(e.key==='ArrowRight'?1:-1),true);}});
 system.querySelector('[data-system-motion]').addEventListener('click',e=>{const paused=system.classList.toggle('is-paused');const button=e.currentTarget;button.setAttribute('aria-pressed',paused);button.innerHTML=paused?'▷ <span>Включить анимацию</span>':'Ⅱ <span>Остановить анимацию</span>';if(paused&&busy){generation++;busy=false;run.disabled=false;field('run-label').textContent='Повторить поток';}});
 document.querySelector('[data-open-page-tour]')?.addEventListener('click',()=>{interacted=true;showStep(0,false);});
 selectCase('good');
 if(new URLSearchParams(location.search).get('tour')==='1'){interacted=true;showStep(0,false);}
 else if('IntersectionObserver' in window&&!reduced.matches){const observer=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){observer.disconnect();if(!interacted)play(true);}},{threshold:.2});observer.observe(system.querySelector('.system-board'));}
})();
