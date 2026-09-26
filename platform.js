/* Doveron platform story: live example + before/after diagrams. Demo data only. */
(function(){
  var LABEL={ok:'РАЗРЕШЕНО',bad:'НА ДОРАБОТКУ',pass:'ПЕРЕДАНО',log:'ЗАПИСАНО',back:'ВОЗВРАЩЕНО'};
  var HUBV={ok:'РАЗРЕШЕНО АВТОМАТИЧЕСКИ',bad:'ВОЗВРАЩЕНО АГЕНТУ С ВЕРНЫМИ ДАННЫМИ',pass:'ЗАДАЧА ПЕРЕДАНА',log:'ЗАПИСАНО В ИСТОРИЮ',back:'АГЕНТ ИСПРАВЛЯЕТСЯ'};
  var CLS={ok:'v-ok',bad:'v-bad',pass:'v-pass',log:'v-pass',back:'v-pass'};
  var HUBKEYS=['rights','data','rule','sec'];

  /* Each scenario: its own agents, systems, chat channel, story and plan price per check.
     Agent/system: icon = logo file in assets/integrations/, otherwise g = glyph (собственный агент или система без логотипа).
     Step: a = agent ids, s = system ids, v = verdict, k = check kind, fix = corrected action after a return,
     msg = chat message(s) {from:'client'|'agent', text, who?, via?}, gate = confirmation/payment before fulfilment. */
  var SCENARIOS={
    small:{
      rates:{read:.995,write:.995,fact:.995},
      note:'Тариф «Старт»: 1 990 ₽ в месяц за 2 000 проверок — около 1 ₽ за проверку. Демонстрационные данные.',
      channel:'ЧАТ МАГАЗИНА · САЙТ',
      clientWho:'Покупатель',agentWho:'ИИ-консультант',
      costLabel:'СТОИМОСТЬ ПРОВЕРОК',
      leak:'ДОШЛО ДО ПОКУПАТЕЛЯ',
      agents:[
        {id:'jivo',icon:'jivo.svg',name:'ИИ-консультант',sub:'Jivo · чат на сайте'},
        {id:'wh',g:'▣',name:'Агент склада',sub:'Собственный · сборка и отгрузка'},
        {id:'mp',icon:'yandexgpt.svg',name:'Агент маркетплейсов',sub:'YandexGPT · остатки Ozon и WB'}
      ],
      systems:[
        {id:'sklad',icon:'moysklad.png',name:'МойСклад',sub:'Остатки, цены, заказы'},
        {id:'kassa',g:'₽',name:'ЮKassa',sub:'Ссылки на оплату и чеки'},
        {id:'ozon',icon:'ozon.jpg',name:'Ozon',sub:'FBS-остатки'},
        {id:'wb',icon:'wildberries.svg',name:'Wildberries',sub:'Остатки'}
      ],
      steps:[
        {a:['jivo'],s:['sklad'],what:'ИИ-консультант ← МойСклад: остаток и цена «Лён 2.0» евро',check:'Всего 14, в резерве 6 — доступно 8 ✓ · «Розничная» 3 490 ₽ ✓ · СДЭК: отгрузка в четверг, доставка в пятницу ✓',v:'ok',k:'read',hub:{rights:'ok',data:'ok'},
          msg:{from:'client',text:'Здравствуйте! Есть 2 комплекта «Лён 2.0» евро? Если оформлю сейчас — до пятницы привезёте?'}},
        {a:['jivo'],s:[],what:'ИИ-консультант → чат: черновик «2 × 3 490 ₽, доставка бесплатно»',check:'Бесплатная доставка — от 10 000 ₽, в корзине 6 980 ₽. Вернули агенту тариф СДЭК до двери: 390 ₽',v:'bad',k:'fact',hub:{rights:'ok',data:'ok',rule:'bad'}},
        {a:['jivo'],s:[],what:'ИИ-консультант → чат: цена, доставка 390 ₽ и срок',check:'3 490 ₽ = «Розничная» ✓ · 390 ₽ = тариф доставки ✓ · пятница = график СДЭК ✓',v:'ok',k:'fact',fix:true,hub:{rights:'ok',data:'ok',rule:'ok'},
          msg:{from:'agent',text:'Здравствуйте! Оба комплекта есть. 2 × 3 490 ₽ = 6 980 ₽, доставка СДЭК до двери — 390 ₽, итого 7 370 ₽. Если оформим сегодня, отгрузим в четверг — в пятницу будут у вас. Оформляем?'}},
        {a:['jivo'],s:['sklad'],what:'ИИ-консультант ← чат: покупатель подтвердил заказ',check:'Состав и сумма 7 370 ₽ подтверждены ✓ · адрес — из прошлого заказа покупателя ✓',v:'ok',k:'read',gate:'confirm',hub:{rights:'ok',data:'ok'},
          msg:{from:'client',text:'Да, оформляйте. Доставка на тот же адрес, что в прошлый раз.'}},
        {a:['jivo'],s:['sklad','kassa'],what:'ИИ-консультант → МойСклад и ЮKassa: заказ №0412 «ждёт оплаты», ссылка на 7 370 ₽',check:'Сумма ссылки = заказ ✓ · ссылка на 30 минут ✓ · без оплаты заказ не собираем ✓',v:'ok',k:'write',hub:{rights:'ok',data:'ok',rule:'ok'},
          msg:{from:'agent',text:'Заказ №0412 на 7 370 ₽ оформлен. Вот ссылка на оплату через ЮKassa — она действует 30 минут. Как только оплата пройдёт, соберём заказ.'}},
        {a:['wh'],s:['kassa','sklad'],what:'Агент склада ← ЮKassa: платёж по №0412 прошёл',check:'Статус «оплачен» в ЮKassa ✓ · 7 370 ₽ = заказ №0412 ✓ · чек 54-ФЗ отправлен покупателю ✓',v:'ok',k:'read',gate:'pay',hub:{rights:'ok',data:'ok'},
          msg:{from:'client',text:'Оплатила.'}},
        {a:['wh'],s:['sklad'],what:'Агент склада → МойСклад: резерв 2 шт, отгрузка №0412 в СДЭК на четверг',check:'Резерв только после оплаты ✓ · 2 из 8 доступных ✓ · после резерва доступно 6 ✓',v:'ok',k:'write',hub:{rights:'ok',data:'ok',rule:'ok'}},
        {a:['wh','mp'],s:[],what:'Агент склада → Агенту маркетплейсов: «Доступно 6 шт, обнови площадки»',check:'Передача задачи между агентами — через Doveron, по общим правилам ✓',v:'pass',k:'read',hub:{rights:'ok'}},
        {a:['mp'],s:['ozon'],what:'Агент маркетплейсов → Ozon: остаток «Лён 2.0» евро = 14 шт',check:'14 — весь склад вместе с резервами · в МоёмСкладе доступно 6 — вернули агенту верную цифру',v:'bad',k:'write',hub:{rights:'ok',data:'bad'}},
        {a:['mp'],s:['ozon','wb'],what:'Агент маркетплейсов → Ozon и Wildberries: остаток 6 шт',check:'6 = доступно в МоёмСкладе ✓ · остатки на обеих площадках совпадают ✓',v:'ok',k:'write',fix:true,hub:{rights:'ok',data:'ok'}},
        {a:['jivo'],s:['sklad'],what:'ИИ-консультант → чат: оплата получена, трек СДЭК',check:'Трек = отгрузка в МоёмСкладе ✓ · дата = график СДЭК ✓ · лишних данных нет ✓',v:'ok',k:'fact',hub:{rights:'ok',data:'ok',rule:'ok',sec:'ok'},
          msg:{from:'agent',text:'Оплату получили, чек пришёл вам на почту. Заказ №0412 собран: отгрузим в СДЭК в четверг, трек 1098 4471 2250. В пятницу комплекты будут у вас.'}}
      ]
    },
    mid:{
      rates:{read:.998,write:.998,fact:.998},
      note:'Тариф «Бизнес»: 4 990 ₽ в месяц за 5 000 проверок — около 1 ₽ за проверку. Демонстрационные данные.',
      channel:'ТЕЛЕФОН · ЛИНИЯ ПРОДАЖ → ПОЧТА И ДИАДОК',
      clientWho:'Клиент',agentWho:'Голосовой робот',
      costLabel:'СТОИМОСТЬ ПРОВЕРОК',
      leak:'ДОШЛО ДО КЛИЕНТА',
      agents:[
        {id:'voice',icon:'voximplant.ico',name:'Голосовой робот',sub:'Voximplant · входящие звонки'},
        {id:'copilot',icon:'bitrix24.svg',name:'Менеджер сделок',sub:'CoPilot в Битрикс24'},
        {id:'docs',icon:'gigachat.svg',name:'Агент документов',sub:'GigaChat · счета и УПД'}
      ],
      systems:[
        {id:'bitrix',icon:'bitrix24.svg',name:'Битрикс24',sub:'Компании, сделки, звонки'},
        {id:'sklad',icon:'moysklad.png',name:'МойСклад',sub:'Остатки, цены, платежи'},
        {id:'diadoc',icon:'diadoc.svg',name:'Диадок',sub:'ЭДО: счета и УПД'}
      ],
      steps:[
        {a:['voice'],s:['bitrix'],what:'Голосовой робот → Битрикс24: входящий звонок и расшифровка',check:'Право: запись звонков в CRM ✓ · расшифровка остаётся в контуре компании ✓',v:'ok',k:'write',hub:{rights:'ok',sec:'ok'},
          msg:[{from:'client',via:'звонок',text:'Добрый день! Нам нужно 30 кресел Ergo Pro в новый офис. Какая цена и когда сможете привезти?'},
               {from:'agent',via:'звонок',text:'Добрый день! Подскажите, пожалуйста, ИНН компании — проверю ваши условия и наличие.'}]},
        {a:['voice'],s:['bitrix'],what:'Голосовой робот ← Битрикс24: компания по ИНН 7707123456',check:'ИНН = компания №318 «Ромашка» ✓ · договор поставки действует ✓ · дубль не создан ✓',v:'ok',k:'read',hub:{rights:'ok',data:'ok'},
          msg:{from:'client',via:'звонок',text:'7707123456, ООО «Ромашка».'}},
        {a:['voice','copilot'],s:[],what:'Голосовой робот → Менеджеру сделок: «30 × Ergo Pro для «Ромашки», нужны цена и срок»',check:'Передача задачи между агентами — через Doveron, по общим правилам ✓',v:'pass',k:'read',hub:{rights:'ok'}},
        {a:['copilot'],s:['sklad'],what:'Менеджер сделок ← МойСклад: остаток и цена Ergo Pro',check:'Доступно 42 шт ✓ · у «Ромашки» тип цен «Оптовая» 15 900 ₽ ✓ · доставка — 2 рабочих дня ✓',v:'ok',k:'read',hub:{rights:'ok',data:'ok'}},
        {a:['copilot','voice'],s:['bitrix'],what:'Менеджер сделок → Битрикс24: сделка №2217 и КП на 477 000 ₽',check:'Цена = «Оптовая» ✓ · 30 × 15 900 = 477 000 ₽ ✓ · КП ушло на почту из карточки компании ✓',v:'ok',k:'write',hub:{rights:'ok',data:'ok',rule:'ok'},
          msg:{from:'agent',via:'звонок',text:'Ergo Pro есть в наличии. 30 кресел по 15 900 ₽ — 477 000 ₽ с НДС, привезём за 2 рабочих дня после оплаты. Коммерческое предложение отправил на вашу почту. Выставить счёт?'}},
        {a:['voice'],s:['bitrix'],what:'Голосовой робот → Битрикс24: клиент подтвердил, сделка на стадии «Счёт»',check:'Согласие записано в звонке ✓ · стадия по регламенту продаж ✓',v:'ok',k:'write',gate:'confirm',hub:{rights:'ok',data:'ok',rule:'ok'},
          msg:{from:'client',via:'звонок',text:'Да, выставляйте. Счёт и закрывающие документы — через Диадок.'}},
        {a:['docs'],s:['diadoc'],what:'Агент документов → Диадок: счёт №00295, НДС 20% — 79 500 ₽',check:'С 2026 года ставка НДС 22% — вернули агенту верную ставку и сумму НДС',v:'bad',k:'write',hub:{rights:'ok',data:'ok',rule:'bad'}},
        {a:['docs'],s:['diadoc'],what:'Агент документов → Диадок: счёт №00295, НДС 22% — 86 016,39 ₽',check:'Ставка 22% ✓ · реквизиты = ЕГРЮЛ ✓ · 477 000 ₽ = сделка №2217 ✓',v:'ok',k:'write',fix:true,hub:{rights:'ok',data:'ok',rule:'ok'},
          msg:{from:'agent',who:'Агент документов',via:'Диадок',text:'Счёт №00295 на 477 000 ₽, в том числе НДС 22% — 86 016,39 ₽, отправлен в Диадок. Кресла зарезервируем и отгрузим сразу после оплаты.'}},
        {a:['copilot'],s:['sklad'],what:'Менеджер сделок ← МойСклад: входящий платёж по банковской выписке',check:'Деньги на счёте по выписке, а не по копии платёжки ✓ · плательщик ИНН 7707123456 ✓ · 477 000 ₽ = счёт №00295 ✓',v:'ok',k:'read',gate:'pay',hub:{rights:'ok',data:'ok'},
          msg:{from:'client',via:'почта',text:'Оплатили счёт №00295, платёжка во вложении.'}},
        {a:['copilot','docs'],s:['sklad','diadoc'],what:'Менеджер сделок → МойСклад: резерв и отгрузка 30 шт · Агент документов → Диадок: УПД',check:'Резерв после оплаты ✓ · 30 из 42 ✓ · УПД = счёт №00295 ✓',v:'ok',k:'write',hub:{rights:'ok',data:'ok',rule:'ok'}},
        {a:['copilot'],s:['bitrix'],what:'Менеджер сделок → почта клиента: оплата получена, дата отгрузки',check:'Сверка: 477 000 ₽ = выписка ✓ · 30 шт = отгрузка ✓ · УПД в Диадоке ✓',v:'ok',k:'fact',hub:{rights:'ok',data:'ok',rule:'ok',sec:'ok'},
          msg:{from:'agent',who:'Менеджер сделок',via:'почта',text:'Оплату получили, спасибо! 30 кресел Ergo Pro отгрузим завтра до 12:00. УПД уже в Диадоке — подпишите его при приёмке.'}}
      ]
    },
    retail:{
      rates:{read:.25,write:.25,fact:.25},
      note:'Тариф «Корпоративный»: ориентир 0,25 ₽ за проверку при объёме от 1 млн в месяц. Демонстрационные данные.',
      channel:'МЕССЕНДЖЕР СЕТИ',
      clientWho:'Покупатель',agentWho:'ИИ-оператор',
      costLabel:'СТОИМОСТЬ ПРОВЕРОК',
      leak:'ДОШЛО ДО ПОКУПАТЕЛЯ',
      agents:[
        {id:'c2d',icon:'chat2desk.svg',name:'ИИ-оператор',sub:'Chat2Desk · мессенджеры'},
        {id:'store',icon:'yandexgpt.svg',name:'Агент магазинов',sub:'YandexGPT · резервы в точках'},
        {id:'supply',g:'⇄',name:'Агент закупок',sub:'Собственный · поставщики и ЭДО'}
      ],
      systems:[
        {id:'rcrm',icon:'retailcrm.svg',name:'retailCRM',sub:'Заказы, клиенты, обмены'},
        {id:'ut',icon:'1c.svg',name:'1С:УТ',sub:'Остатки магазинов, закупки'},
        {id:'diadoc',icon:'diadoc.svg',name:'Диадок',sub:'ЭДО с поставщиками'}
      ],
      steps:[
        {a:['c2d'],s:['rcrm'],what:'ИИ-оператор ← retailCRM: заказ №М-88120',check:'Телефон в мессенджере = телефон в заказе ✓ · Vortex X9 куплен 12 дней назад ✓',v:'ok',k:'read',hub:{rights:'ok',data:'ok'},
          msg:{from:'client',text:'Здравствуйте! Пылесос Vortex X9 из заказа №М-88120 перестал держать заряд. Можно обменять?'}},
        {a:['c2d'],s:['rcrm'],what:'ИИ-оператор → мессенджер: условия гарантии и уточняющий вопрос',check:'Обмен при заводском дефекте в течение 15 дней ✓ · 12 < 15 ✓ · обещаний сверх регламента нет ✓',v:'ok',k:'fact',hub:{rights:'ok',data:'ok',rule:'ok'},
          msg:{from:'agent',text:'Жаль, что так вышло! Заказ нашли, обмен возможен: прошло 12 дней из 15. Уточните, пожалуйста: пылесос заряжается, но быстро садится — или не заряжается совсем?'}},
        {a:['c2d'],s:['rcrm'],what:'ИИ-оператор → retailCRM: обращение «дефект аккумулятора», гарантийный случай',check:'Признаки = заводской дефект по регламенту ✓ · обращение привязано к №М-88120 ✓',v:'ok',k:'write',hub:{rights:'ok',data:'ok',rule:'ok'},
          msg:{from:'client',text:'Заряжается, но через 5 минут выключается.'}},
        {a:['c2d'],s:['ut'],what:'ИИ-оператор → мессенджер: черновик «новый ждёт вас на Тверской»',check:'На Тверской 1 шт, и она в резерве другого заказа — вернули агенту ближайший магазин с остатком: Новослободская, 3 шт',v:'bad',k:'fact',hub:{rights:'ok',data:'bad'}},
        {a:['c2d'],s:['ut'],what:'ИИ-оператор → мессенджер: обмен на Новослободской',check:'Новослободская: 3 шт свободно по 1С:УТ ✓ · доплата 0 ₽ ✓',v:'ok',k:'fact',fix:true,hub:{rights:'ok',data:'ok',rule:'ok'},
          msg:{from:'agent',text:'Это гарантийный случай — меняем на новый без доплаты. Ближайший магазин, где Vortex X9 есть в наличии, — на Новослободской. Отложить для вас на завтра?'}},
        {a:['c2d','store'],s:[],what:'ИИ-оператор → Агенту магазинов: «Отложить Vortex X9 на Новослободской до завтра 21:00»',check:'Покупатель подтвердил обмен ✓ · передача задачи между агентами — через Doveron ✓',v:'pass',k:'read',gate:'confirm',hub:{rights:'ok',data:'ok'},
          msg:{from:'client',text:'Да, заберу завтра после 18:00.'}},
        {a:['store'],s:['ut','rcrm'],what:'Агент магазинов → 1С:УТ и retailCRM: резерв 1 шт, обмен №ВЗ-3317',check:'1 из 3 свободных ✓ · обмен = заказ №М-88120 ✓ · резерв до 21:00 завтра ✓',v:'ok',k:'write',hub:{rights:'ok',data:'ok',rule:'ok'},
          msg:{from:'agent',text:'Готово, обмен №ВЗ-3317. Новый Vortex X9 ждёт вас завтра до 21:00 в магазине на Новослободской. Возьмите старый пылесос с зарядкой и назовите номер обмена.'}},
        {a:['c2d','supply'],s:[],what:'ИИ-оператор → Агенту закупок: «Vortex X9 — третий обмен по аккумулятору за неделю»',check:'Передача задачи между агентами — через Doveron, по общим правилам ✓',v:'pass',k:'read',hub:{rights:'ok'}},
        {a:['supply'],s:['diadoc'],what:'Агент закупок → Диадок: претензия ООО «Техноимпорт» с ФИО и телефонами покупателей',check:'Персональные данные покупателей не передаются поставщику — вернули агенту обезличенную версию',v:'bad',k:'write',hub:{rights:'ok',sec:'bad'}},
        {a:['supply'],s:['diadoc','rcrm'],what:'Агент закупок → Диадок: претензия по 3 серийным номерам, без персональных данных',check:'Серийные номера и даты продаж из retailCRM ✓ · ФИО и телефонов нет ✓ · договор №44/25 ✓',v:'ok',k:'write',fix:true,hub:{rights:'ok',data:'ok',sec:'ok'}},
        {a:['supply'],s:['ut','diadoc'],what:'Агент закупок → 1С:УТ и Диадок: заказ поставщику №ЗП-5530, 40 шт',check:'40 × 15 400 = 616 000 ₽ ✓ · в лимите агента 1 млн ₽ ✓ · цена = договор №44/25 ✓',v:'ok',k:'write',hub:{rights:'ok',data:'ok',rule:'ok'}}
      ]
    },
    industry:{
      rates:{read:.8,write:.8,fact:.8},
      note:'Тариф «Корпоративный» с контуром в периметре: ориентир 0,80 ₽ за проверку. Демонстрационные данные.',
      channel:'ЗАЯВКА ОТ ФАБРИКИ · ПОЧТА И ЭДО',
      clientWho:'Обогатительная фабрика',agentWho:'Агент закупок',
      costLabel:'СТОИМОСТЬ ПРОВЕРОК',
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
        {a:['wh'],s:['erp'],what:'Агент склада ТМЦ ← 1С:ERP: плиты для МШЦ-5500 по складам',check:'Центральный склад: 40 шт, 28 в резерве под ремонт МШЦ-4500 — свободно 12 ✓',v:'ok',k:'read',hub:{rights:'ok',data:'ok'},
          msg:{from:'client',via:'почта',text:'Заявка №ОФ-218: 40 футеровочных плит для мельницы МШЦ-5500 к 15 октября. Плановый ремонт, простой недопустим.'}},
        {a:['wh'],s:['erp'],what:'Агент склада ТМЦ → 1С:ERP: перемещение 12 шт на фабрику, потребность №ЗК-7714 на 28 шт',check:'12 = свободный остаток ✓ · чужой резерв не тронут ✓',v:'ok',k:'write',hub:{rights:'ok',data:'ok',rule:'ok'},
          msg:{from:'agent',who:'Агент склада ТМЦ',via:'почта',text:'Заявку №ОФ-218 приняли. 12 плит есть на центральном складе — перемещаем на фабрику завтра. Остальные 28 закупаем, срок поставки сообщим сегодня.'}},
        {a:['wh','proc'],s:[],what:'Агент склада ТМЦ → Агенту закупок: потребность №ЗК-7714, 28 плит',check:'Передача задачи между агентами — через Doveron, по общим правилам ✓',v:'pass',k:'read',hub:{rights:'ok'}},
        {a:['proc'],s:['sbis'],what:'Агент закупок → СБИС: запрос цен у 3 поставщиков',check:'Спецификация = чертёж плиты ✓ · запрос ушёл через ЭДО холдинга ✓',v:'ok',k:'write',hub:{rights:'ok',data:'ok',rule:'ok'}},
        {a:['proc'],s:['erp','focus'],what:'Агент закупок → 1С:ERP: заказ у ООО «ТД Футерпром» (на 9% дешевле)',check:'Контур.Фокус: компании 4 месяца, адрес массовой регистрации — вернули агенту список проверенных поставщиков',v:'bad',k:'write',hub:{rights:'ok',data:'bad',rule:'bad'}},
        {a:['proc'],s:['erp','focus'],what:'Агент закупок → 1С:ERP: заказ у ООО «УралФутеровка», 28 плит',check:'Контур.Фокус: 12 лет, рисков нет ✓ · 28 × 214 000 = 5 992 000 ₽ ✓ · в бюджете ремонта ✓',v:'ok',k:'write',fix:true,gate:'confirm',hub:{rights:'ok',data:'ok',rule:'ok'}},
        {a:['proc','contract'],s:[],what:'Агент закупок → Агенту договоров: спецификация к договору с «УралФутеровкой»',check:'Передача задачи между агентами — через Doveron ✓',v:'pass',k:'read',hub:{rights:'ok'}},
        {a:['contract'],s:['sbis','siem'],what:'Агент договоров → СБИС: спецификация с р/с из письма поставщика',check:'Р/с из письма ≠ р/с в договоре и 1С:ERP — вернули агенту реквизиты из договора, событие передано в KUMA',v:'bad',k:'write',hub:{rights:'ok',data:'bad',sec:'bad'}},
        {a:['contract'],s:['sbis','erp'],what:'Агент договоров → СБИС: спецификация №СП-2291, реквизиты из договора',check:'Р/с = договор ✓ · 5 992 000 ₽ = заказ ✓ · поставка 10 октября ✓',v:'ok',k:'write',fix:true,hub:{rights:'ok',data:'ok',rule:'ok',sec:'ok'}},
        {a:['proc'],s:['erp'],what:'Агент закупок → фабрике: ответ по заявке №ОФ-218',check:'Сверка: 12 шт = перемещение ✓ · 28 шт = №СП-2291 ✓ · 10 октября < 15 октября ✓',v:'ok',k:'fact',hub:{rights:'ok',data:'ok',rule:'ok',sec:'ok'},
          msg:[{from:'agent',via:'почта',text:'По заявке №ОФ-218: 12 плит придут с центрального склада завтра. 28 плит заказаны у ООО «УралФутеровка» по спецификации №СП-2291, поставка 10 октября — к ремонту 15 октября успеваем.'},
               {from:'client',via:'почта',text:'Принято, спасибо. Бригаду на замену футеровки ставим на 13 октября.'}]}
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
    var colA=root.querySelector('.ex-col-agents'),colS=root.querySelector('.ex-col-systems');
    var thread=root.querySelector('[data-ex-thread]'),channel=root.querySelector('[data-ex-channel]');
    var playBtn=root.querySelector('[data-ex-play]'),stepBtn=root.querySelector('[data-ex-next]');
    var sumChecks=root.querySelector('[data-sum-checks]'),sumCost=root.querySelector('[data-sum-cost]'),costLabel=root.querySelector('[data-sum-cost-label]'),note=root.parentNode.querySelector('[data-ex-note]'),sumFixed=root.querySelector('[data-sum-fixed]'),sumLeak=root.querySelector('[data-sum-leak]'),leakLabel=root.querySelector('[data-sum-leak-label]');
    var live=root.querySelector('[data-ex-live]');
    var first=root.querySelector('[data-ex-case][aria-selected="true"]')||tabs[0];
    var cur=first.getAttribute('data-ex-case'),idx=0,timer=null,stats;

    /* ---- Chat thread: queue of messages; agent messages show «Печатает ответ», then type out ---- */
    var queue=[],busy=null,chatTimer=null,typeTimer=null;
    function scrollThread(){thread.scrollTop=thread.scrollHeight}
    function bubble(m){
      var sc=SCENARIOS[cur];
      var d=document.createElement('div');d.className='ex-msg '+(m.from==='client'?'from-client':'from-agent');
      var meta=document.createElement('span');meta.className='ex-msg-who';
      meta.textContent=(m.who||(m.from==='client'?sc.clientWho:sc.agentWho))+(m.via?' · '+m.via:'');
      var p=document.createElement('p');d.appendChild(meta);d.appendChild(p);
      var empty=thread.querySelector('.ex-thread-empty');if(empty)empty.remove();
      thread.appendChild(d);return p;
    }
    function clearChatTimers(){if(chatTimer){clearTimeout(chatTimer);chatTimer=null}if(typeTimer){clearInterval(typeTimer);typeTimer=null}}
    function pump(){
      if(busy||!queue.length)return;
      var m=queue.shift(),p=bubble(m);
      if(m.from==='client'||reduced){p.textContent=m.text;scrollThread();if(queue.length)chatTimer=setTimeout(pump,reduced?0:450);return}
      busy={p:p,text:m.text};
      p.innerHTML='<span class="ex-typing">Печатает ответ<i></i><i></i><i></i></span>';p.parentNode.classList.add('is-typing');scrollThread();
      chatTimer=setTimeout(function(){
        chatTimer=null;var n=0;p.textContent='';p.parentNode.classList.remove('is-typing');
        typeTimer=setInterval(function(){
          n+=2;p.textContent=m.text.slice(0,n);scrollThread();
          if(n>=m.text.length){clearInterval(typeTimer);typeTimer=null;busy=null;chatTimer=setTimeout(pump,350)}
        },22);
      },900);
    }
    function flushChat(){
      clearChatTimers();
      if(busy){busy.p.textContent=busy.text;busy.p.parentNode.classList.remove('is-typing');busy=null}
      while(queue.length){var m=queue.shift();bubble(m).textContent=m.text}
      scrollThread();
    }
    function chatIdle(){return !busy&&!queue.length}
    function resetChat(sc){
      clearChatTimers();queue=[];busy=null;
      if(channel)channel.textContent=sc.channel;
      thread.innerHTML='<p class="ex-thread-empty">Здесь появится переписка: сообщения клиента и ответы агента — после проверки Doveron.</p>';
    }

    function $all(sel){return Array.prototype.slice.call(root.querySelectorAll(sel))}
    function node(n){
      var d=document.createElement('div');d.className='ex-node';d.setAttribute('data-ex-node',n.id);
      var ico;
      if(n.icon){ico=document.createElement('img');ico.src='assets/integrations/'+n.icon;ico.alt='';ico.width=32;ico.height=32}
      else{ico=document.createElement('span');ico.className='ex-av';ico.setAttribute('aria-hidden','true');ico.textContent=n.g}
      var t=document.createElement('div'),st=document.createElement('strong'),sm=document.createElement('small');
      st.textContent=n.name;sm.textContent=n.sub;t.appendChild(st);t.appendChild(sm);
      d.appendChild(ico);d.appendChild(t);return d;
    }
    function renderCol(col,title,list){
      col.innerHTML='';var b=document.createElement('b');b.textContent=title;col.appendChild(b);
      list.forEach(function(n){col.appendChild(node(n))});
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
    function reset(){
      stop();idx=0;stats={checks:0,cost:0,stop:0,fixed:0};
      var sc=SCENARIOS[cur];
      renderCol(colA,'ИИ-АГЕНТЫ',sc.agents);renderCol(colS,'ВАШИ СИСТЕМЫ',sc.systems);
      resetChat(sc);
      if(leakLabel)leakLabel.textContent=sc.leak;
      if(costLabel)costLabel.textContent=sc.costLabel||'СТОИМОСТЬ ПРОВЕРОК';
      if(note)note.textContent=sc.note;
      log.innerHTML='<li class="ex-log-empty">Нажмите «Запустить» — каждое действие агентов появится здесь с результатом проверки.</li>';
      clearNodes();setHub(null,null);renderSum();
      playBtn.querySelector('span:last-child').textContent='Запустить';
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
      var msgs=st.msg?[].concat(st.msg):[];
      if(msgs.length){queue=queue.concat(msgs);pump()}
      var li=document.createElement('li');
      li.innerHTML='<span>'+String(idx+1).padStart(2,'0')+'</span><span></span><span></span><em class="'+CLS[st.v]+'">'+(st.fix?'ИСПРАВЛЕНО':LABEL[st.v])+'</em>';
      li.children[1].textContent=st.what;li.children[2].textContent=st.check;
      log.appendChild(li);log.scrollTop=log.scrollHeight;
      if(live)live.textContent=st.what+'. '+st.check+'. '+(st.fix?'ИСПРАВЛЕНО':LABEL[st.v])+'.'+msgs.map(function(m){return ' '+(m.from==='client'?sc.clientWho:(m.who||sc.agentWho))+': '+m.text}).join('');
      idx++;
      renderSum();
      if(idx>=sc.steps.length){stepBtn.disabled=true;playBtn.querySelector('span:last-child').textContent='Повторить';}
      return st;
    }
    function stop(){if(timer){clearTimeout(timer);timer=null}root.classList.remove('is-playing')}
    function loop(){
      var st=doStep();
      if(!st||idx>=SCENARIOS[cur].steps.length){stop();return}
      var wait=reduced?300:(st.v==='bad'?2400:1300);
      (function next(){
        timer=setTimeout(function(){if(!chatIdle()){wait=250;next();return}loop()},wait);
      })();
    }
    playBtn.addEventListener('click',function(){
      if(timer){stop();playBtn.querySelector('span:last-child').textContent='Продолжить';return}
      if(idx>=SCENARIOS[cur].steps.length)reset();
      root.classList.add('is-playing');playBtn.querySelector('span:last-child').textContent='Пауза';loop();
    });
    stepBtn.addEventListener('click',function(){stop();flushChat();doStep();if(idx<SCENARIOS[cur].steps.length)playBtn.querySelector('span:last-child').textContent='Продолжить'});
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
