/* Doveron pricing calculator: pay per check only, price falls with monthly volume. Estimates only. */
(function(){
  var root=document.querySelector('[data-calc]');
  if(!root)return;
  // Price per check (₽) by monthly volume — same numbers as the pricing table and the demo.
  var TIERS=[
    {upto:1e6,  name:'до 1 млн проверок',     rates:{read:.02, write:.10,fact:.40}},
    {upto:1e7,  name:'1–10 млн проверок',     rates:{read:.01, write:.06,fact:.25}},
    {upto:1e8,  name:'10–100 млн проверок',   rates:{read:.005,write:.03,fact:.15}},
    {upto:1/0,  name:'от 100 млн проверок',   rates:{read:.003,write:.02,fact:.10}}
  ];
  // Typical checks per operation and default volume for each kind of business.
  var N={
    small:{unit:'заказ',per:{read:5,write:2,fact:1},ops:800,hint:'Магазин, селлер на маркетплейсах, сервис'},
    mid:{unit:'заказ',per:{read:7,write:3,fact:1},ops:1200,hint:'Опт, дистрибуция, производство'},
    retail:{unit:'заказ',per:{read:6,write:2,fact:.5},ops:1000000,hint:'Сеть магазинов, e-commerce'},
    industry:{unit:'операцию',per:{read:9,write:3,fact:1},ops:2500,hint:'Закупки, склад ТМЦ, договоры'}
  };
  var FREE=2000,cur='small';
  var $=function(s){return root.querySelector(s)};
  var ops=$('[name=ops]');
  var nf=new Intl.NumberFormat('ru-RU',{maximumFractionDigits:0});
  var nf1=new Intl.NumberFormat('ru-RU',{maximumFractionDigits:1});
  var nf2=new Intl.NumberFormat('ru-RU',{minimumFractionDigits:2,maximumFractionDigits:2});
  function money(v){return v>=100?nf.format(Math.round(v))+' ₽':v>=1?nf2.format(v)+' ₽':nf1.format(v*100)+' коп.'}
  function kop(v){return nf1.format(v*100)+' коп.'}
  function num(el){var v=parseFloat(String(el.value).replace(/\s/g,'').replace(',','.'));return isFinite(v)&&v>0?v:0}
  function tierFor(checks){for(var i=0;i<TIERS.length;i++)if(checks<=TIERS[i].upto)return TIERS[i];return TIERS[TIERS.length-1]}
  function calc(){
    var n=N[cur],o=num(ops);
    var checksPerOp=n.per.read+n.per.write+n.per.fact;
    var checks=Math.round(o*checksPerOp);
    var t=tierFor(checks),r=t.rates;
    var perOp=n.per.read*r.read+n.per.write*r.write+n.per.fact*r.fact;
    var month=checks>0?o*perOp*Math.max(0,1-FREE/checks):0;
    $('[data-out=checks]').textContent=nf.format(checks);
    $('[data-out=month]').textContent=month>0?money(month):'0 ₽';
    $('[data-out=order]').textContent=money(o?month/o:0);
    $('[data-out=plan]').textContent=checks<=FREE?'Бесплатно':t.name;
    $('[data-out=rates]').textContent='чтение '+kop(r.read)+' · действие '+kop(r.write)+' · проверка текста '+kop(r.fact);
    $('[data-out=mix]').textContent='≈ '+nf1.format(checksPerOp)+' проверок на '+n.unit;
    $('[data-out=unit]').textContent='На '+(n.unit==='заказ'?'один заказ':'одну операцию');
    $('[data-label=ops]').textContent=n.unit==='заказ'?'Заказов в месяц':'Операций в месяц';
  }
  function setNiche(k){
    cur=k;
    root.querySelectorAll('[data-niche]').forEach(function(b){b.setAttribute('aria-pressed',b.getAttribute('data-niche')===k)});
    ops.value=N[k].ops;$('[data-out=hint]').textContent=N[k].hint;calc();
  }
  root.querySelectorAll('[data-niche]').forEach(function(b){b.addEventListener('click',function(){setNiche(b.getAttribute('data-niche'))})});
  ops.addEventListener('input',calc);
  setNiche('small');
})();
