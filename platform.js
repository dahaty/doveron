/* Doveron platform story: live example + before/after diagrams. Demo data only. */
(function(){
  var PRICE={read:.15,write:.85,fact:1.2};
  var LABEL={ok:'РАЗРЕШЕНО',bad:'ОСТАНОВЛЕНО',wait:'ЧЕЛОВЕКУ',pass:'ПЕРЕДАНО',log:'ЗАПИСАНО',back:'ВОЗВРАЩЕНО'};
  var HUBV={ok:'РАЗРЕШЕНО АВТОМАТИЧЕСКИ',bad:'ОСТАНОВЛЕНО · НА ИСПРАВЛЕНИЕ',wait:'КРАЙНИЙ СЛУЧАЙ · ЧЕЛОВЕКУ',pass:'ЗАДАЧА ПЕРЕДАНА',log:'ЗАПИСАНО В ИСТОРИЮ',back:'АГЕНТ ИСПРАВЛЯЕТСЯ'};
  var CLS={ok:'v-ok',bad:'v-bad',wait:'v-wait',pass:'v-pass',log:'v-pass',back:'v-pass'};

  var SCENARIOS={
    order:{
      inLabel:'КЛИЕНТ ПИШЕТ В ОТКРЫТУЮ ЛИНИЮ БИТРИКС24',
      inText:'«Здравствуйте! Нужно 10 кресел Ergo Pro, выставьте счёт на ООО «Ромашка».»',
      outLabel:'ОТВЕТ КЛИЕНТУ',
      steps:[
        {a:['sales'],s:['bitrix'],what:'Агент продаж ← Битрикс24: новое сообщение в открытой линии',check:'Право: чтение открытых линий ✓',v:'ok',k:'read',hub:{rights:'ok'}},
        {a:['sales'],s:['bitrix'],what:'Агент продаж → Битрикс24: компания «Ромашка», новая сделка',check:'ИНН 7707123456 = контрагент в МоёмСкладе ✓ · сделка №2217 в стадии «Новая»',v:'ok',k:'write',hub:{rights:'ok',data:'ok'}},
        {a:['sales','stock'],s:[],what:'Агент продаж → Агенту склада: «Есть 10 × Ergo Pro для «Ромашки»?»',check:'Передача задачи между агентами — через Doveron, по общим правилам ✓',v:'pass',k:'read',hub:{rights:'ok'}},
        {a:['stock'],s:['sklad'],what:'Агент склада → МойСклад: остатки Ergo Pro по складам',check:'Основной склад: 24 шт, в резерве 0 — доступно 24 ✓',v:'ok',k:'read',hub:{rights:'ok',data:'ok'}},
        {a:['stock'],s:['sklad'],what:'Агент склада → МойСклад: заказ покупателя №00318, резерв 10 шт',check:'Тип цен контрагента «Оптовая»: 15 900 ₽ ✓ · лимит резерва 100 шт ✓',v:'ok',k:'write',hub:{rights:'ok',data:'ok',rule:'ok'}},
        {a:['stock','docs'],s:[],what:'Агент склада → Агенту документов: счёт по заказу №00318',check:'Передача задачи между агентами — через Doveron ✓',v:'pass',k:'read',hub:{rights:'ok'}},
        {a:['docs'],s:['sklad'],what:'Агент документов → МойСклад: счёт покупателю №00295 на 159 000 ₽',check:'Сумма = заказ №00318 ✓ · реквизиты = контрагент ✓ · лимит 500 000 ₽ ✓',v:'ok',k:'write',hub:{rights:'ok',data:'ok',rule:'ok'}},
        {a:['sales'],s:['bitrix'],what:'Агент продаж → Битрикс24: сделка №2217 → «Счёт на предоплату»',check:'Сумма сделки 159 000 ₽ = счёт №00295 в МоёмСкладе ✓',v:'ok',k:'write',hub:{rights:'ok',data:'ok',rule:'ok'}},
        {a:['sales'],s:[],what:'Агент продаж → клиенту: ответ в открытую линию',check:'Сверка: 10 шт = резерв ✓ · 15 900 ₽ = тип цен ✓ · 159 000 ₽ = счёт ✓',v:'ok',k:'fact',hub:{rights:'ok',data:'ok',rule:'ok'},
          reply:'«Готово! 10 кресел Ergo Pro в резерве по вашей оптовой цене 15 900 ₽. Счёт №00295 на 159 000 ₽ отправили на почту.»'}
      ]
    },
    error:{
      inLabel:'КЛИЕНТ ПИШЕТ В ОТКРЫТУЮ ЛИНИЮ БИТРИКС24',
      inText:'«Почём Ergo Pro, если брать 30 штук? И сможете отгрузить завтра?»',
      outLabel:'ОТВЕТ КЛИЕНТУ',
      steps:[
        {a:['sales'],s:['bitrix'],what:'Агент продаж ← Битрикс24: новое сообщение в открытой линии',check:'Право: чтение открытых линий ✓',v:'ok',k:'read',hub:{rights:'ok'}},
        {a:['sales'],s:['bitrix'],what:'Агент продаж → Битрикс24: карточка компании «Ромашка»',check:'Право: чтение ✓ · компания = контрагент МоегоСклада по ИНН ✓',v:'ok',k:'read',hub:{rights:'ok',data:'ok'}},
        {a:['sales','stock'],s:[],what:'Агент продаж → Агенту склада: «Цена и наличие Ergo Pro?»',check:'Передача задачи между агентами — через Doveron ✓',v:'pass',k:'read',hub:{rights:'ok'}},
        {a:['stock'],s:['sklad'],what:'Агент склада → МойСклад: остаток, ожидание и тип цен',check:'Доступно 24 шт · ещё 40 шт по заказу поставщику 3 октября · «Оптовая» 15 900 ₽',v:'ok',k:'read',hub:{rights:'ok',data:'ok'}},
        {a:['sales'],s:[],what:'Агент продаж → клиенту (черновик): «30 шт по 18 400 ₽, отгрузим завтра»',check:'18 400 ₽ — розничная цена, у «Ромашки» оптовая 15 900 ₽ ✕ · доступно 24, а не 30 ✕',v:'bad',k:'fact',hub:{rights:'ok',data:'bad',rule:'ok'}},
        {a:['sales'],s:[],what:'Doveron → Агенту продаж: причина остановки и верные данные',check:'Агент получил: 15 900 ₽ за шт · 24 шт завтра · 6 шт после 3 октября',v:'back',k:null,hub:{rights:'ok',data:'ok',rule:'ok'}},
        {a:['sales'],s:[],what:'Агент продаж → клиенту: исправленный ответ',check:'Сверка: 15 900 ₽ = тип цен ✓ · 24 шт = остаток ✓ · 3 октября = заказ поставщику ✓',v:'ok',k:'fact',hub:{rights:'ok',data:'ok',rule:'ok'},
          reply:'«Для вас оптовая цена — 15 900 ₽ за кресло, 30 шт = 477 000 ₽. 24 шт отгрузим завтра, ещё 6 — после поступления 3 октября. Оформить заказ?»'}
      ]
    },
    rights:{
      inLabel:'КЛИЕНТ ПИШЕТ В ОТКРЫТУЮ ЛИНИЮ БИТРИКС24',
      inText:'«Дайте скидку 20% на 10 кресел по счёту №00295 — тогда оплатим сегодня.»',
      outLabel:'ОТВЕТ КЛИЕНТУ',
      steps:[
        {a:['sales'],s:['bitrix'],what:'Агент продаж ← Битрикс24: новое сообщение в открытой линии',check:'Право: чтение открытых линий ✓',v:'ok',k:'read',hub:{rights:'ok'}},
        {a:['sales'],s:['bitrix'],what:'Агент продаж → Битрикс24: сделка №2217 «Ромашки»',check:'Право: чтение ✓ · стадия «Счёт на предоплату», 159 000 ₽ ✓',v:'ok',k:'read',hub:{rights:'ok',data:'ok'}},
        {a:['sales'],s:['sklad'],what:'Агент продаж → МойСклад: скидка контрагенту «Ромашка» 20%',check:'Агенту продаж запись в МойСклад запрещена ✕ · скидки выше 10% — только руководитель ✕',v:'bad',k:'write',hub:{rights:'bad',rule:'bad'}},
        {a:['sales'],s:[],what:'Doveron → Агенту продаж: причина отказа',check:'Попытка записана в историю и попадёт в табель надёжности агента',v:'back',k:null,hub:{rights:'bad',rule:'bad'}},
        {a:['sales'],s:['bitrix'],what:'Агент продаж → Битрикс24: задача менеджеру «Скидка 20% для «Ромашки»»',check:'Право: создание задач ✓ · задача №5541 привязана к сделке №2217',v:'ok',k:'write',hub:{rights:'ok',rule:'ok'}},
        {a:['sales'],s:[],what:'Агент продаж → клиенту: ответ в пределах прав',check:'Сверка: 15 900 ₽ = тип цен «Оптовая» ✓ · задача №5541 создана ✓',v:'ok',k:'fact',hub:{rights:'ok',data:'ok',rule:'ok'},
          reply:'«Для вас уже действует оптовая цена — 15 900 ₽ вместо 18 400 ₽. Запрос на скидку 20% передал менеджеру, он ответит сегодня.»'}
      ]
    },
    edge:{
      inLabel:'КЛИЕНТ ПИШЕТ В ОТКРЫТУЮ ЛИНИЮ БИТРИКС24',
      inText:'«Нужно 60 кресел Ergo Pro на ООО «Вектор». Оплатим через 30 дней после отгрузки.»',
      outLabel:'ОТВЕТ КЛИЕНТУ',
      steps:[
        {a:['sales'],s:['bitrix'],what:'Агент продаж ← Битрикс24: новое сообщение в открытой линии',check:'Право: чтение открытых линий ✓',v:'ok',k:'read',hub:{rights:'ok'}},
        {a:['sales'],s:['bitrix','sklad'],what:'Агент продаж → Битрикс24 и МойСклад: найти «Вектор»',check:'Нет ни в Битрикс24, ни в МоёмСкладе — новый клиент, истории оплат нет',v:'ok',k:'read',hub:{rights:'ok',data:'ok'}},
        {a:['sales','stock'],s:[],what:'Агент продаж → Агенту склада: «60 × Ergo Pro для нового клиента»',check:'Передача задачи между агентами — через Doveron ✓',v:'pass',k:'read',hub:{rights:'ok'}},
        {a:['stock'],s:['sklad'],what:'Агент склада → МойСклад: остаток и ожидание Ergo Pro',check:'Доступно 24 шт ✓ · 40 шт ожидаются по заказу поставщику 3 октября ✓',v:'ok',k:'read',hub:{rights:'ok',data:'ok'}},
        {a:['docs'],s:['sklad','tg'],what:'Агент документов → МойСклад: заказ на 1 104 000 ₽ с отсрочкой',check:'Новый контрагент + отсрочка 30 дней + сумма выше лимита 500 000 ₽ — сам не решить',v:'wait',k:'write',hub:{rights:'ok',data:'ok',rule:'wait'},
          tg:{text:'ООО «Вектор» — новый клиент без истории оплат. 60 кресел на 1 104 000 ₽, просят отсрочку 30 дней. Как поступить?',btns:['Только предоплата','Отклонить']}},
        {a:[],s:['tg'],what:'Руководитель в Telegram: «Только предоплата»',check:'Решение записано в историю · контролёр применяет его к заказу',v:'ok',k:null,hub:{rights:'ok',data:'ok',rule:'ok'},press:true},
        {a:['docs'],s:['sklad'],what:'Агент документов → МойСклад: заказ №00319 и счёт №00296, 100% предоплата',check:'Условия = решение руководителя ✓ · резерв 24 шт ✓ · сумма 1 104 000 ₽ ✓',v:'ok',k:'write',hub:{rights:'ok',data:'ok',rule:'ok'}},
        {a:['sales'],s:['bitrix'],what:'Агент продаж → Битрикс24: компания «Вектор», сделка №2231',check:'Стадия «Счёт на предоплату» · сумма = счёт №00296 ✓',v:'ok',k:'write',hub:{rights:'ok',data:'ok',rule:'ok'}},
        {a:['sales'],s:[],what:'Агент продаж → клиенту: ответ в открытую линию',check:'Сверка: 24 + 36 шт = заказ №00319 ✓ · предоплата = решение руководителя ✓',v:'ok',k:'fact',hub:{rights:'ok',data:'ok',rule:'ok'},
          reply:'«24 кресла готовы к отгрузке, остальные 36 поступят 3 октября. Первый заказ — по предоплате: счёт №00296 на 1 104 000 ₽ отправили на почту.»'}
      ]
    }
  };

  var root=document.querySelector('[data-ex]');
  if(root){
    var reduced=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
    var tabs=root.querySelectorAll('[data-ex-case]');
    var log=root.querySelector('[data-ex-log]');
    var hub=root.querySelector('[data-ex-hub]');
    var verdict=root.querySelector('[data-ex-verdict]');
    var tg=root.querySelector('[data-ex-tg]');
    var inB=root.querySelector('[data-ex-in]'),outB=root.querySelector('[data-ex-out]');
    var playBtn=root.querySelector('[data-ex-play]'),stepBtn=root.querySelector('[data-ex-next]');
    var sumChecks=root.querySelector('[data-sum-checks]'),sumCost=root.querySelector('[data-sum-cost]'),sumStop=root.querySelector('[data-sum-stop]'),sumHuman=root.querySelector('[data-sum-human]');
    var live=root.querySelector('[data-ex-live]');
    var cur='order',idx=0,timer=null,stats;

    function $all(sel){return Array.prototype.slice.call(root.querySelectorAll(sel))}
    function clearNodes(){$all('[data-ex-node]').forEach(function(n){n.classList.remove('is-active','is-bad','is-wait')})}
    function setHub(h,v){
      ['rights','data','rule'].forEach(function(key){
        var row=hub.querySelector('[data-hub="'+key+'"]'),st=h&&h[key];
        row.className=st?('on '+st):'';
        row.querySelector('i').textContent=st==='ok'?'✓':st==='bad'?'✕':st==='wait'?'⏸':'·';
      });
      hub.classList.remove('is-ok','is-bad','is-wait');
      if(v==='bad')hub.classList.add('is-bad');else if(v==='wait')hub.classList.add('is-wait');else if(v)hub.classList.add('is-ok');
      verdict.textContent=v?HUBV[v]:'ОЖИДАЕТ ЗАПРОСА';
    }
    function fmt(n){return n.toFixed(2).replace('.',',')+' ₽'}
    function renderSum(){
      sumChecks.textContent=stats.checks;sumCost.textContent=fmt(stats.cost);sumStop.textContent=stats.stop;sumHuman.textContent=stats.dec?Math.round((stats.dec-stats.human)/stats.dec*100)+'%':'—';
    }
    function reset(){
      stop();idx=0;stats={checks:0,cost:0,stop:0,human:0,dec:0};
      var sc=SCENARIOS[cur];
      inB.querySelector('span').textContent=sc.inLabel;inB.querySelector('p').textContent=sc.inText;
      outB.querySelector('span').textContent=sc.outLabel;outB.querySelector('p').textContent='Появится после проверки';
      outB.classList.add('is-empty');outB.classList.remove('is-ok');
      log.innerHTML='<li class="ex-log-empty">Нажмите «Запустить пример» — каждое действие агентов появится здесь с результатом проверки.</li>';
      clearNodes();setHub(null,null);tg.classList.remove('show');renderSum();
      playBtn.querySelector('span:last-child').textContent='Запустить пример';
      stepBtn.disabled=false;
      if(live)live.textContent='';
    }
    function showTg(t,press){
      tg.querySelector('p').textContent=t.text;
      var b=tg.querySelectorAll('b');b[0].textContent=t.btns[0];b[1].textContent=t.btns[1];b[0].classList.remove('pressed');
      tg.classList.add('show');
    }
    function doStep(){
      var sc=SCENARIOS[cur],st=sc.steps[idx];
      if(!st)return false;
      if(idx===0)log.innerHTML='';
      clearNodes();
      st.a.concat(st.s).forEach(function(id){var n=root.querySelector('[data-ex-node="'+id+'"]');if(n)n.classList.add(st.v==='bad'?'is-bad':st.v==='wait'?'is-wait':'is-active')});
      setHub(st.hub,st.v);
      if(st.tg)showTg(st.tg);
      else if(st.press){tg.querySelector('b').classList.add('pressed');setTimeout(function(){tg.classList.remove('show')},reduced?0:900)}
      else tg.classList.remove('show');
      if(st.k){stats.checks++;stats.cost+=PRICE[st.k]}
      if(st.v==='bad')stats.stop++;
      if(!st.press)stats.dec++;
      if(st.v==='wait')stats.human++;
      if(st.reply){outB.querySelector('p').textContent=st.reply;outB.classList.remove('is-empty');outB.classList.add('is-ok')}
      var li=document.createElement('li');
      li.innerHTML='<span>'+String(idx+1).padStart(2,'0')+'</span><span></span><span></span><em class="'+CLS[st.v]+'">'+LABEL[st.v]+'</em>';
      li.children[1].textContent=st.what;li.children[2].textContent=st.check;
      log.appendChild(li);log.scrollTop=log.scrollHeight;
      if(live)live.textContent=st.what+'. '+st.check+'. '+LABEL[st.v]+'.';
      renderSum();
      idx++;
      if(idx>=sc.steps.length){stepBtn.disabled=true;playBtn.querySelector('span:last-child').textContent='Повторить';}
      return st;
    }
    function stop(){if(timer){clearTimeout(timer);timer=null}root.classList.remove('is-playing')}
    function loop(){
      var st=doStep();
      if(!st||idx>=SCENARIOS[cur].steps.length){stop();return}
      timer=setTimeout(loop,reduced?300:(st.v==='wait'||st.v==='bad'?2600:1500));
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
