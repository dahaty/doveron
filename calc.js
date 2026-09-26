/* Doveron pricing calculator: niche-optimized price of checks. Estimates only. */
(function(){
  var root=document.querySelector('[data-calc]');
  if(!root)return;
  // Rates per check (₽) and typical checks per operation for each niche — same numbers as the demo.
  var N={
    small:{name:'Малый бизнес',unit:'заказов',rates:{read:.10,write:.50,fact:.90},per:{read:5,write:2,fact:1},def:{ops:800},hint:'Магазин, селлер на маркетплейсах, сервис'},
    mid:{name:'Средний бизнес',unit:'заказов',rates:{read:.08,write:.45,fact:.80},per:{read:7,write:3,fact:1},def:{ops:1200},hint:'Опт, дистрибуция, производство'},
    retail:{name:'Крупный ритейл',unit:'заказов',rates:{read:.04,write:.25,fact:.50},per:{read:6,write:2,fact:.5},def:{ops:150000},hint:'Сеть магазинов, e-commerce'},
    industry:{name:'Промышленность',unit:'операций',rates:{read:.05,write:.35,fact:.70},per:{read:9,write:3,fact:1},def:{ops:2500},hint:'Закупки, склад ТМЦ, договоры'}
  };
  var FREE=2000, FLAT=.85;
  var cur='small';
  var $=function(s){return root.querySelector(s)};
  var ops=$('[name=ops]');
  var nf=new Intl.NumberFormat('ru-RU',{maximumFractionDigits:0});
  var nf1=new Intl.NumberFormat('ru-RU',{maximumFractionDigits:1});
  var nf2=new Intl.NumberFormat('ru-RU',{minimumFractionDigits:2,maximumFractionDigits:2});
  function rub(v){return (v>=100?nf.format(Math.round(v)):nf2.format(v))+' ₽'}
  function num(el){var v=parseFloat(String(el.value).replace(/\s/g,'').replace(',','.'));return isFinite(v)&&v>0?v:0}
  function discount(checks){return checks>2e6?.30:checks>2e5?.15:0}
  function calc(){
    var n=N[cur],o=num(ops);
    var perOp=n.per.read*n.rates.read+n.per.write*n.rates.write+n.per.fact*n.rates.fact;
    var checksPerOp=n.per.read+n.per.write+n.per.fact;
    var checks=Math.round(o*checksPerOp);
    var disc=discount(checks);
    var gross=o*perOp*(1-disc);
    var month=checks>0?gross*Math.max(0,1-FREE/checks):0;
    var perOrder=o?month/o:0;
    var flat=Math.max(0,checks-FREE)*FLAT;
    var plan=checks<=FREE?'Старт — бесплатно':checks<=2e5?'Команда':'Бизнес';
    $('[data-out=checks]').textContent=nf.format(checks);
    $('[data-out=month]').textContent=rub(month);
    $('[data-out=order]').textContent=rub(perOrder);
    $('[data-out=plan]').textContent=plan;
    $('[data-out=flat]').textContent=rub(flat);
    $('[data-out=save]').textContent=flat>0?Math.max(0,Math.round((1-month/flat)*100))+'%':'—';
    $('[data-out=rates]').textContent='чтение '+nf2.format(n.rates.read)+' ₽ · действие '+nf2.format(n.rates.write)+' ₽ · проверка текста '+nf2.format(n.rates.fact)+' ₽'+(disc?' · скидка за объём '+Math.round(disc*100)+'%':'');
    $('[data-out=mix]').textContent='≈ '+nf1.format(checksPerOp)+' проверок на '+(n.unit==='заказов'?'заказ':'операцию');
    $('[data-out=unit]').textContent=n.unit==='заказов'?'На один заказ':'На одну операцию';
    $('[data-label=ops]').textContent=n.unit==='заказов'?'Заказов в месяц':'Операций в месяц';
  }
  function setNiche(k){
    cur=k;
    root.querySelectorAll('[data-niche]').forEach(function(b){var on=b.getAttribute('data-niche')===k;b.setAttribute('aria-pressed',on)});
    ops.value=N[k].def.ops;
    $('[data-out=hint]').textContent=N[k].hint;
    calc();
  }
  root.querySelectorAll('[data-niche]').forEach(function(b){b.addEventListener('click',function(){setNiche(b.getAttribute('data-niche'))})});
  ops.addEventListener('input',calc);
  setNiche('small');
})();
