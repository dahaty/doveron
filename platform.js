/* Doveron platform story: live example + before/after diagrams. Demo data only. */
(function(){
  var LABEL={ok:'РАЗРЕШЕНО',bad:'НА ДОРАБОТКУ',pass:'ПЕРЕДАНО',log:'ЗАПИСАНО',back:'ВОЗВРАЩЕНО'};
  var HUBV={ok:'РАЗРЕШЕНО АВТОМАТИЧЕСКИ',bad:'ВОЗВРАЩЕНО АГЕНТУ С ВЕРНЫМИ ДАННЫМИ',pass:'ЗАДАЧА ПЕРЕДАНА',log:'ЗАПИСАНО В ИСТОРИЮ',back:'АГЕНТ ИСПРАВЛЯЕТСЯ'};
  var CLS={ok:'v-ok',bad:'v-bad',pass:'v-pass',log:'v-pass',back:'v-pass'};
  var HUBKEYS=['rights','data','rule','sec'];

  /* Each scenario: its own agents, systems, story and niche rates (₽ per check).
     Agent/system: icon = logo file in assets/integrations/, otherwise g = glyph (собственный агент).
     Step: a = agent ids, s = system ids, v = verdict, k = price kind, fix = corrected action after a return. */
  var SCENARIOS={
    small:{
      tier:'малого бизнеса',
      rates:{read:.10,write:.50,fact:.90},
      inLabel:'ПОКУПАТЕЛЬ ПИШЕТ В ЧАТ МАГАЗИНА',
      inText:'«Есть 2 комплекта «Лён 2.0» евро? Если оформлю сейчас — до пятницы привезёте?»',
      outLabel:'ОТВЕТ ПОКУПАТЕЛЮ В ЧАТЕ',
      costLabel:'СТОИМОСТЬ ЗАКАЗА',
      leak:'ДОШЛО ДО ПОКУПАТЕЛЯ',
      agents:[
        {id:'jivo',icon:'jivo.svg',name:'ИИ-консультант',sub:'Jivo · чат на сайте и в Telegram'},
        {id:'wh',g:'▣',name:'Агент склада',sub:'Собственный · сборка и отгрузка'},
        {id:'mp',icon:'yandexgpt.svg',name:'Агент маркетплейсов',sub:'YandexGPT · остатки Ozon и WB'}
      ],
      systems:[
        {id:'sklad',icon:'moysklad.png',name:'МойСклад',sub:'Остатки, резервы, заказы'},
        {id:'ozon',icon:'ozon.jpg',name:'Ozon',sub:'FBS-остатки и заказы'},
        {id:'wb',icon:'wildberries.svg',name:'Wildberries',sub:'Остатки и карточки'},
        {id:'tg',icon:'telegram.png',name:'Telegram и сайт',sub:'Чат магазина'}
      ],
      steps:[
        {a:['jivo'],s:['tg'],what:'ИИ-консультант ← чат: вопрос покупателя',check:'Право: чтение чата магазина ✓',v:'ok',k:'read',hub:{rights:'ok'}},
        {a:['jivo'],s:['sklad'],what:'ИИ-консультант ← МойСклад: остаток «Лён 2.0» евро',check:'На складе 14, в резерве 6 — доступно 8 ✓',v:'ok',k:'read',hub:{rights:'ok',data:'ok'}},
        {a:['jivo'],s:['sklad'],what:'ИИ-консультант → МойСклад: заказ №0412, 2 × 3 490 ₽, резерв 2 шт',check:'Тип цен «Розничная» ✓ · резерв 2 из 8 доступных ✓ · сумма 6 980 ₽ ✓',v:'ok',k:'write',hub:{rights:'ok',data:'ok',rule:'ok'}},
        {a:['jivo','wh'],s:[],what:'ИИ-консультант → Агенту склада: «Собрать №0412 к отгрузке в четверг»',check:'Передача задачи между агентами — через Doveron, по общим правилам ✓',v:'pass',k:'read',hub:{rights:'ok'}},
        {a:['wh'],s:['sklad'],what:'Агент склада → МойСклад: заказ №0412 собран, отгрузка в СДЭК',check:'2 шт = резерв заказа ✓ · после отгрузки доступно 6 ✓',v:'ok',k:'write',hub:{rights:'ok',data:'ok'}},
        {a:['wh','mp'],s:[],what:'Агент склада → Агенту маркетплейсов: «Доступно 6 шт, обнови площадки»',check:'Передача задачи между агентами — через Doveron ✓',v:'pass',k:'read',hub:{rights:'ok'}},
        {a:['mp'],s:['ozon'],what:'Агент маркетплейсов → Ozon: остаток FBS «Лён 2.0» = 14 шт',check:'14 — весь склад с резервами · в МоёмСкладе доступно 6 — вернули агенту верную цифру',v:'bad',k:'write',hub:{rights:'ok',data:'bad'}},
        {a:['mp'],s:['ozon','wb'],what:'Агент маркетплейсов → Ozon и Wildberries: остаток 6 шт',check:'6 = доступно в МоёмСкладе ✓ · остатки на обеих площадках совпадают ✓',v:'ok',k:'write',fix:true,hub:{rights:'ok',data:'ok'}},
        {a:['jivo'],s:['tg'],what:'ИИ-консультант → чат: ответ покупателю',check:'Сверка: 3 490 ₽ = «Розничная» ✓ · 6 980 ₽ = заказ №0412 ✓ · отгрузка в четверг ✓',v:'ok',k:'fact',hub:{rights:'ok',data:'ok',rule:'ok',sec:'ok'},
          reply:'«Оформили заказ №0412: 2 комплекта «Лён 2.0» евро по 3 490 ₽, итого 6 980 ₽. Отгрузим в СДЭК в четверг — в пятницу будет у вас.»'}
      ]
    },
    mid:{
      tier:'среднего бизнеса',
      rates:{read:.08,write:.45,fact:.80},
      inLabel:'КЛИЕНТ ЗВОНИТ НА ЛИНИЮ ПРОДАЖ',
      inText:'«Это ООО «Ромашка», ИНН 7707123456. Нужно 30 кресел Ergo Pro, счёт и УПД — через Диадок.»',
      outLabel:'ПОДТВЕРЖДЕНИЕ КЛИЕНТУ',
      costLabel:'СТОИМОСТЬ ЗАКАЗА',
      leak:'ДОШЛО ДО КЛИЕНТА',
      agents:[
        {id:'voice',icon:'voximplant.ico',name:'Голосовой робот',sub:'Voximplant · входящие звонки'},
        {id:'copilot',icon:'bitrix24.svg',name:'Менеджер сделок',sub:'CoPilot в Битрикс24'},
        {id:'docs',icon:'gigachat.svg',name:'Агент документов',sub:'GigaChat · счета и УПД'}
      ],
      systems:[
        {id:'bitrix',icon:'bitrix24.svg',name:'Битрикс24',sub:'Компании, сделки, звонки'},
        {id:'sklad',icon:'moysklad.png',name:'МойСклад',sub:'Остатки, цены, заказы'},
        {id:'diadoc',icon:'diadoc.svg',name:'Диадок',sub:'ЭДО: счета и УПД'}
      ],
      steps:[
        {a:['voice'],s:['bitrix'],what:'Голосовой робот → Битрикс24: звонок и расшифровка в компанию №318',check:'ИНН 7707123456 = компания №318 ✓ · новой карточки не создано ✓',v:'ok',k:'write',hub:{rights:'ok',data:'ok'}},
        {a:['voice','copilot'],s:[],what:'Голосовой робот → Менеджеру сделок: «30 × Ergo Pro для «Ромашки»»',check:'Передача задачи между агентами — через Doveron, по общим правилам ✓',v:'pass',k:'read',hub:{rights:'ok'}},
        {a:['copilot'],s:['sklad'],what:'Менеджер сделок ← МойСклад: остаток и цена Ergo Pro',check:'Доступно 42 шт ✓ · у «Ромашки» тип цен «Оптовая» 15 900 ₽ ✓',v:'ok',k:'read',hub:{rights:'ok',data:'ok'}},
        {a:['copilot'],s:['bitrix'],what:'Менеджер сделок → Битрикс24: сделка №2217, 30 × 15 900 ₽',check:'Цена = «Оптовая» ✓ · сумма 477 000 ₽ ✓ · стадия «Счёт» ✓',v:'ok',k:'write',hub:{rights:'ok',data:'ok',rule:'ok'}},
        {a:['copilot'],s:['sklad'],what:'Менеджер сделок → МойСклад: заказ №00318, резерв 30 шт',check:'30 из 42 доступных ✓ · заказ = сделка №2217 ✓',v:'ok',k:'write',hub:{rights:'ok',data:'ok'}},
        {a:['copilot','docs'],s:[],what:'Менеджер сделок → Агенту документов: «Счёт и УПД по №00318»',check:'Передача задачи между агентами — через Doveron ✓',v:'pass',k:'read',hub:{rights:'ok'}},
        {a:['docs'],s:['diadoc'],what:'Агент документов → Диадок: счёт №00295 и УПД, НДС 20%',check:'С 2026 года ставка НДС 22% — вернули агенту верную ставку и сумму НДС',v:'bad',k:'write',hub:{rights:'ok',data:'ok',rule:'bad'}},
        {a:['docs'],s:['diadoc'],what:'Агент документов → Диадок: счёт №00295 и УПД, НДС 22%',check:'Ставка 22% ✓ · реквизиты = ЕГРЮЛ ✓ · 477 000 ₽ = заказ №00318 ✓',v:'ok',k:'write',fix:true,hub:{rights:'ok',data:'ok',rule:'ok'}},
        {a:['voice'],s:['bitrix'],what:'Голосовой робот → клиенту: звонок-подтверждение',check:'Сверка: 30 шт = резерв ✓ · 477 000 ₽ = счёт ✓ · НДС 22% ✓',v:'ok',k:'fact',hub:{rights:'ok',data:'ok',rule:'ok',sec:'ok'},
          reply:'«Кресла Ergo Pro, 30 штук, зарезервированы. Счёт №00295 на 477 000 ₽ с НДС 22% и УПД уже в Диадоке.»'}
      ]
    },
    retail:{
      tier:'крупного ритейла',
      rates:{read:.04,write:.25,fact:.50},
      inLabel:'ПОКУПАТЕЛЬ ПИШЕТ В МЕССЕНДЖЕР СЕТИ',
      inText:'«Пылесос Vortex X9 из заказа №М-88120 перестал держать заряд. Можно обменять на новый?»',
      outLabel:'ОТВЕТ ПОКУПАТЕЛЮ',
      costLabel:'СТОИМОСТЬ ОБМЕНА',
      leak:'ДОШЛО ДО ПОКУПАТЕЛЕЙ',
      agents:[
        {id:'c2d',icon:'chat2desk.svg',name:'ИИ-оператор',sub:'Chat2Desk · мессенджеры'},
        {id:'supply',g:'⇄',name:'Агент закупок',sub:'Собственный · поставщики и ЭДО'},
        {id:'assort',icon:'yandexgpt.svg',name:'Агент ассортимента и цен',sub:'YandexGPT · цены и витрины'}
      ],
      systems:[
        {id:'rcrm',icon:'retailcrm.svg',name:'retailCRM',sub:'Заказы и клиенты'},
        {id:'ut',icon:'1c.svg',name:'1С:УТ',sub:'Цены, остатки сети'},
        {id:'ym',icon:'yandex-market.png',name:'Яндекс Маркет',sub:'Цены и FBS-остатки'},
        {id:'diadoc',icon:'diadoc.svg',name:'Диадок',sub:'ЭДО с поставщиками'}
      ],
      steps:[
        {a:['c2d'],s:['rcrm'],what:'ИИ-оператор ← retailCRM: заказ №М-88120',check:'Куплен 12 дней назад ✓ · срок обмена 15 дней ✓',v:'ok',k:'read',hub:{rights:'ok',data:'ok'}},
        {a:['c2d'],s:['rcrm'],what:'ИИ-оператор → внешней модели: переписка с ФИО, телефоном и адресом',check:'Персональные данные не должны покидать контур — вернули агенту обезличенную версию',v:'bad',k:'fact',hub:{rights:'ok',sec:'bad'}},
        {a:['c2d'],s:['rcrm'],what:'ИИ-оператор → модели: переписка без персональных данных',check:'ФИО, телефон и адрес заменены метками ✓ · ПДн остаются в retailCRM ✓',v:'ok',k:'fact',fix:true,hub:{rights:'ok',sec:'ok'}},
        {a:['c2d'],s:['rcrm','ut'],what:'ИИ-оператор → retailCRM: обмен №ВЗ-3317 в магазине на Тверской',check:'Гарантийный случай ✓ · Vortex X9 есть на Тверской по 1С:УТ ✓',v:'ok',k:'write',hub:{rights:'ok',data:'ok',rule:'ok'}},
        {a:['c2d','supply'],s:[],what:'ИИ-оператор → Агенту закупок: «Vortex X9 — третий обмен за неделю»',check:'Передача задачи между агентами — через Doveron, по общим правилам ✓',v:'pass',k:'read',hub:{rights:'ok'}},
        {a:['supply'],s:['diadoc'],what:'Агент закупок → Диадок: претензия и заказ №ЗП-5530, 600 шт у ООО «Техноимпорт»',check:'ИНН = договор №44/25 ✓ · 600 × 15 400 ₽ = 9 240 000 ₽ ✓ · лимит 10 млн ✓',v:'ok',k:'write',hub:{rights:'ok',data:'ok',rule:'ok'}},
        {a:['supply','assort'],s:[],what:'Агент закупок → Агенту ассортимента: «Поставка 3 октября, можно акцию»',check:'Передача задачи между агентами — через Doveron ✓',v:'pass',k:'read',hub:{rights:'ok'}},
        {a:['assort'],s:['ut'],what:'Агент ассортимента → 1С:УТ: цена Vortex X9 21 240 ₽ (−15%)',check:'Ниже МРЦ поставщика 21 990 ₽ — вернули агенту минимально допустимую цену',v:'bad',k:'write',hub:{rights:'ok',data:'ok',rule:'bad'}},
        {a:['assort'],s:['ut','ym'],what:'Агент ассортимента → 1С:УТ и Яндекс Маркет: цена 21 990 ₽ (−12%)',check:'21 990 ₽ = МРЦ ✓ · наценка выше порога 25% ✓ · остаток FBS 180 шт ✓',v:'ok',k:'write',fix:true,hub:{rights:'ok',data:'ok',rule:'ok'}},
        {a:['c2d'],s:['rcrm'],what:'ИИ-оператор → мессенджер: ответ покупателю',check:'Сверка: №ВЗ-3317 ✓ · магазин на Тверской ✓ · чужих данных нет ✓',v:'ok',k:'fact',hub:{rights:'ok',data:'ok',rule:'ok',sec:'ok'},
          reply:'«Оформили обмен №ВЗ-3317: новый Vortex X9 ждёт вас в магазине на Тверской. Возьмите старый пылесос — доплата не нужна.»'}
      ]
    },
    industry:{
      tier:'промышленности',
      rates:{read:.05,write:.35,fact:.70},
      inLabel:'ЗАЯВКА ОТ ОБОГАТИТЕЛЬНОЙ ФАБРИКИ',
      inText:'«Нужно 40 футеровочных плит для мельницы МШЦ-5500 к 15 октября — плановый ремонт, простой недопустим.»',
      outLabel:'ОТВЕТ ФАБРИКЕ',
      costLabel:'СТОИМОСТЬ ЗАЯВКИ',
      leak:'ДОШЛО ДО ПОСТАВЩИКОВ',
      agents:[
        {id:'wh',g:'▣',name:'Агент склада ТМЦ',sub:'Собственный · остатки и резервы'},
        {id:'proc',icon:'gigachat.svg',name:'Агент закупок',sub:'GigaChat в контуре холдинга'},
        {id:'contract',icon:'yandexgpt.svg',name:'Агент договоров',sub:'YandexGPT · договоры и ЭДО'}
      ],
      systems:[
        {id:'erp',icon:'1c.svg',name:'1С:ERP',sub:'Закупки, склад ТМЦ, бюджеты'},
        {id:'focus',icon:'kontur.svg',name:'Контур.Фокус',sub:'Проверка контрагентов'},
        {id:'sbis',icon:'sbis.svg',name:'СБИС',sub:'ЭДО с поставщиками'},
        {id:'siem',icon:'kuma.svg',name:'KUMA',sub:'SIEM · события безопасности'}
      ],
      steps:[
        {a:['wh'],s:['erp'],what:'Агент склада ТМЦ ← 1С:ERP: плиты для МШЦ-5500 по складам',check:'Центральный склад: 40 шт, 28 в резерве под ремонт МШЦ-4500 — свободно 12 ✓',v:'ok',k:'read',hub:{rights:'ok',data:'ok'}},
        {a:['wh'],s:['erp'],what:'Агент склада ТМЦ → 1С:ERP: перемещение 12 шт, заявка №ЗК-7714 на 28 шт',check:'12 = свободный остаток ✓ · чужой резерв не тронут ✓',v:'ok',k:'write',hub:{rights:'ok',data:'ok',rule:'ok'}},
        {a:['wh','proc'],s:[],what:'Агент склада ТМЦ → Агенту закупок: заявка №ЗК-7714, 28 плит',check:'Передача задачи между агентами — через Doveron, по общим правилам ✓',v:'pass',k:'read',hub:{rights:'ok'}},
        {a:['proc'],s:['erp','focus'],what:'Агент закупок → 1С:ERP: заказ у ООО «ТД Футерпром» (на 9% дешевле)',check:'Контур.Фокус: компании 4 месяца, адрес массовой регистрации — вернули агенту список проверенных поставщиков',v:'bad',k:'write',hub:{rights:'ok',data:'bad',rule:'bad'}},
        {a:['proc'],s:['erp','focus'],what:'Агент закупок → 1С:ERP: заказ у ООО «УралФутеровка», 28 плит',check:'Контур.Фокус: 12 лет, рисков нет ✓ · 28 × 214 000 ₽ = 5 992 000 ₽ ✓',v:'ok',k:'write',fix:true,hub:{rights:'ok',data:'ok',rule:'ok'}},
        {a:['proc','contract'],s:[],what:'Агент закупок → Агенту договоров: спецификация к договору',check:'Передача задачи между агентами — через Doveron ✓',v:'pass',k:'read',hub:{rights:'ok'}},
        {a:['contract'],s:['sbis','siem'],what:'Агент договоров → СБИС: спецификация с р/с из письма поставщика',check:'Р/с из письма ≠ р/с в договоре и 1С:ERP — вернули агенту реквизиты из договора, событие в KUMA',v:'bad',k:'write',hub:{rights:'ok',data:'bad',sec:'bad'}},
        {a:['contract'],s:['sbis'],what:'Агент договоров → СБИС: спецификация №СП-2291, реквизиты из договора',check:'Р/с = договор ✓ · 5 992 000 ₽ в бюджете ремонта ✓ · поставка 10 октября ✓',v:'ok',k:'write',fix:true,hub:{rights:'ok',data:'ok',rule:'ok',sec:'ok'}},
        {a:['proc'],s:['erp'],what:'Агент закупок → фабрике: ответ по заявке',check:'Сверка: 12 шт = перемещение ✓ · 28 шт = №СП-2291 ✓ · 10 октября < 15 октября ✓',v:'ok',k:'fact',hub:{rights:'ok',data:'ok',rule:'ok',sec:'ok'},
          reply:'«12 плит отгружаем с центрального склада завтра. 28 заказали у ООО «УралФутеровка» (спецификация №СП-2291), поставка 10 октября — к ремонту успеваем.»'}
      ]
    }
  };

  var root=document.querySelector('[data-ex]');
  if(root){
    var reduced=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
    var typeTimer=null;
    function typeReply(text){
      var p=outB.querySelector('p');
      if(typeTimer){clearInterval(typeTimer);typeTimer=null}
      if(reduced){p.textContent=text;return}
      var n=0;p.textContent='';
      typeTimer=setInterval(function(){n+=2;p.textContent=text.slice(0,n);if(n>=text.length){clearInterval(typeTimer);typeTimer=null}},22);
    }
    var tabs=root.querySelectorAll('[data-ex-case]');
    var log=root.querySelector('[data-ex-log]');
    var hub=root.querySelector('[data-ex-hub]');
    var verdict=root.querySelector('[data-ex-verdict]');
    var colA=root.querySelector('.ex-col-agents'),colS=root.querySelector('.ex-col-systems');
    var inB=root.querySelector('[data-ex-in]'),outB=root.querySelector('[data-ex-out]');
    var playBtn=root.querySelector('[data-ex-play]'),stepBtn=root.querySelector('[data-ex-next]');
    var sumChecks=root.querySelector('[data-sum-checks]'),sumCost=root.querySelector('[data-sum-cost]'),costLabel=root.querySelector('[data-sum-cost-label]'),note=root.parentNode.querySelector('[data-ex-note]'),sumFixed=root.querySelector('[data-sum-fixed]'),sumLeak=root.querySelector('[data-sum-leak]'),leakLabel=root.querySelector('[data-sum-leak-label]');
    var live=root.querySelector('[data-ex-live]');
    var first=root.querySelector('[data-ex-case][aria-selected="true"]')||tabs[0];
    var cur=first.getAttribute('data-ex-case'),idx=0,timer=null,stats;

    function $all(sel){return Array.prototype.slice.call(root.querySelectorAll(sel))}
    function node(n,sys){
      var d=document.createElement('div');d.className='ex-node';d.setAttribute('data-ex-node',n.id);
      var ico;
      if(sys||n.icon){ico=document.createElement('img');ico.src='assets/integrations/'+n.icon;ico.alt='';ico.width=32;ico.height=32}
      else{ico=document.createElement('span');ico.className='ex-av';ico.setAttribute('aria-hidden','true');ico.textContent=n.g}
      var t=document.createElement('div'),st=document.createElement('strong'),sm=document.createElement('small');
      st.textContent=n.name;sm.textContent=n.sub;t.appendChild(st);t.appendChild(sm);
      d.appendChild(ico);d.appendChild(t);return d;
    }
    function renderCol(col,title,list,sys){
      col.innerHTML='';var b=document.createElement('b');b.textContent=title;col.appendChild(b);
      list.forEach(function(n){col.appendChild(node(n,sys))});
    }
    function clearNodes(){$all('[data-ex-node]').forEach(function(n){n.classList.remove('is-active','is-bad')})}
    function setHub(h,v){
      HUBKEYS.forEach(function(key){
        var row=hub.querySelector('[data-hub="'+key+'"]');if(!row)return;
        var st=h&&h[key];
        row.className=st?('on '+st):'';
        row.querySelector('i').textContent=st==='ok'?'✓':st==='bad'?'✕':'·';
      });
      hub.classList.remove('is-ok','is-bad');
      if(v==='bad')hub.classList.add('is-bad');else if(v)hub.classList.add('is-ok');
      verdict.textContent=v?HUBV[v]:'ОЖИДАЕТ ЗАПРОСА';
    }
    function fmt(n){return n.toFixed(2).replace('.',',')+' ₽'}
    function renderSum(){
      sumChecks.textContent=stats.checks;sumCost.textContent=fmt(stats.cost);sumFixed.textContent=stats.fixed;sumLeak.textContent=idx?'0':'—';
    }
    function rate(n){return n.toFixed(2).replace('.',',')+' ₽'}
    function renderNote(sc){
      if(!note)return;var r=sc.rates;
      note.innerHTML='Тариф для '+sc.tier+': чтение '+rate(r.read)+' · действие '+rate(r.write)+' · проверка текста '+rate(r.fact)+'. Демонстрационные данные. <a href="#calc">Посчитать для своего бизнеса →</a>';
    }
    function reset(){
      stop();idx=0;stats={checks:0,cost:0,stop:0,fixed:0};
      var sc=SCENARIOS[cur];
      renderCol(colA,'ИИ-АГЕНТЫ',sc.agents,false);renderCol(colS,'ВАШИ СИСТЕМЫ',sc.systems,true);
      inB.querySelector('span').textContent=sc.inLabel;inB.querySelector('p').textContent=sc.inText;
      outB.querySelector('span').textContent=sc.outLabel;if(typeTimer){clearInterval(typeTimer);typeTimer=null}outB.querySelector('p').innerHTML='<span class="ex-typing">Печатает ответ<i></i><i></i><i></i></span>';
      outB.classList.add('is-empty');outB.classList.remove('is-ok');
      if(leakLabel)leakLabel.textContent=sc.leak;
      if(costLabel)costLabel.textContent=sc.costLabel||'СТОИМОСТЬ ЗАКАЗА';
      renderNote(sc);
      log.innerHTML='<li class="ex-log-empty">Нажмите «Запустить пример» — каждое действие агентов появится здесь с результатом проверки.</li>';
      clearNodes();setHub(null,null);renderSum();
      playBtn.querySelector('span:last-child').textContent='Запустить пример';
      stepBtn.disabled=false;
      if(live)live.textContent='';
    }
    function doStep(){
      var sc=SCENARIOS[cur],st=sc.steps[idx];
      if(!st)return false;
      if(idx===0)log.innerHTML='';
      clearNodes();
      st.a.concat(st.s).forEach(function(id){var n=root.querySelector('[data-ex-node="'+id+'"]');if(n)n.classList.add(st.v==='bad'?'is-bad':'is-active')});
      setHub(st.hub,st.v);
      if(st.k){stats.checks++;stats.cost+=sc.rates[st.k]}
      if(st.v==='bad')stats.stop++;
      if(st.fix)stats.fixed++;
      if(st.reply){typeReply(st.reply);outB.classList.remove('is-empty');outB.classList.add('is-ok')}
      var li=document.createElement('li');
      li.innerHTML='<span>'+String(idx+1).padStart(2,'0')+'</span><span></span><span></span><em class="'+CLS[st.v]+'">'+(st.fix?'ИСПРАВЛЕНО':LABEL[st.v])+'</em>';
      li.children[1].textContent=st.what;li.children[2].textContent=st.check;
      log.appendChild(li);log.scrollTop=log.scrollHeight;
      if(live)live.textContent=st.what+'. '+st.check+'. '+(st.fix?'ИСПРАВЛЕНО':LABEL[st.v])+'.';
      idx++;
      renderSum();
      if(idx>=sc.steps.length){stepBtn.disabled=true;playBtn.querySelector('span:last-child').textContent='Повторить';}
      return st;
    }
    function stop(){if(timer){clearTimeout(timer);timer=null}root.classList.remove('is-playing')}
    function loop(){
      var st=doStep();
      if(!st||idx>=SCENARIOS[cur].steps.length){stop();return}
      timer=setTimeout(loop,reduced?300:(st.v==='bad'?2600:1500));
    }
    playBtn.addEventListener('click',function(){
      if(timer){stop();playBtn.querySelector('span:last-child').textContent='Продолжить';return}
      if(idx>=SCENARIOS[cur].steps.length)reset();
      root.classList.add('is-playing');playBtn.querySelector('span:last-child').textContent='Пауза';loop();
    });
    stepBtn.addEventListener('click',function(){stop();doStep();if(idx<SCENARIOS[cur].steps.length)playBtn.querySelector('span:last-child').textContent='Продолжить'});
    Array.prototype.forEach.call(tabs,function(t){
      t.addEventListener('click',function(){
        Array.prototype.forEach.call(tabs,function(o){o.setAttribute('aria-selected',o===t?'true':'false');o.tabIndex=o===t?0:-1});
        cur=t.getAttribute('data-ex-case');reset();
      });
    });
    reset();
    if('IntersectionObserver' in window){
      new IntersectionObserver(function(e){root.classList.toggle('ex-visible',e[0].isIntersecting)},{threshold:.15}).observe(root);
    }else root.classList.add('ex-visible');
  }

  /* Before / after: 10 agents × 4 systems */
  var NS='http://www.w3.org/2000/svg';
  function el(n,a){var e=document.createElementNS(NS,n);for(var k in a)e.setAttribute(k,a[k]);return e}
  function draw(svg,hubbed){
    var W=420,H=260,ax=40,sx=380,ay=[],sy=[];
    for(var i=0;i<10;i++)ay.push(22+i*24);
    for(var j=0;j<4;j++)sy.push(52+j*52);
    svg.setAttribute('viewBox','0 0 '+W+' '+H);
    var g=el('g',{});svg.appendChild(g);
    if(!hubbed){
      ay.forEach(function(y){sy.forEach(function(y2){g.appendChild(el('path',{d:'M'+ax+' '+y+' C200 '+y+' 220 '+y2+' '+sx+' '+y2,fill:'none',stroke:'#ff7b7b','stroke-opacity':'.38','stroke-width':'1'}))})});
    }else{
      var hx=210,hy=130;
      ay.forEach(function(y){g.appendChild(el('path',{d:'M'+ax+' '+y+' C130 '+y+' 150 '+hy+' '+(hx-34)+' '+hy,fill:'none',stroke:'#4a98ff','stroke-opacity':'.6','stroke-width':'1.2'}))});
      sy.forEach(function(y){g.appendChild(el('path',{d:'M'+(hx+34)+' '+hy+' C270 '+hy+' 290 '+y+' '+sx+' '+y,fill:'none',stroke:'#66d5ff','stroke-opacity':'.75','stroke-width':'1.4'}))});
      g.appendChild(el('rect',{x:hx-34,y:hy-26,width:68,height:52,rx:12,fill:'#152949',stroke:'#4f8fe0'}));
      var t=el('text',{x:hx,y:hy+7,'text-anchor':'middle',fill:'#cfe3ff','font-size':'20','font-weight':'700'});t.textContent='d.';g.appendChild(t);
    }
    ay.forEach(function(y,i){g.appendChild(el('circle',{cx:ax,cy:y,r:7,fill:'#1c2c45',stroke:'#6f8fbb'}))});
    var lab=['Б24','Склад','1С','+1000'];
    sy.forEach(function(y,i){g.appendChild(el('rect',{x:sx-4,y:y-14,width:40,height:28,rx:7,fill:'#1a2436',stroke:'#6f8fbb'}));var t=el('text',{x:sx+16,y:y+4,'text-anchor':'middle',fill:'#c6d4e7','font-size':'10'});t.textContent=lab[i];g.appendChild(t)});
    var a=el('text',{x:ax,y:H-2,'text-anchor':'middle',fill:'#697d97','font-size':'10'});a.textContent='10 агентов';g.appendChild(a);
  }
  var b1=document.querySelector('[data-ba="mesh"]'),b2=document.querySelector('[data-ba="hub"]');
  if(b1)draw(b1,false);if(b2)draw(b2,true);
})();
