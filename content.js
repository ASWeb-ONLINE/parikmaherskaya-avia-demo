export const business = {
  name: 'Парикмахерская на Авиамоторной',
  phone: '+79036877858', phoneDisplay: '+7 (903) 687-78-58',
  address: 'Москва, Авиамоторная улица, 8, стр. 1',
  mapsUrl: 'https://yandex.ru/maps/org/parikmakherskaya/1221763109/',
  reviewsUrl: 'https://yandex.ru/maps/org/parikmakherskaya/1221763109/reviews/',
  routeUrl: 'https://yandex.ru/maps/?rtext=~55.755574%2C37.715587&rtt=auto',
  coordinates: {lat:55.755574,lon:37.715587},
  timezone:'Europe/Moscow', mode:'demo', bookingDaysAhead:60,
  hours: {0:{open:'10:00',close:'19:00'},1:{open:'09:00',close:'21:00'},2:{open:'09:00',close:'21:00'},3:{open:'09:00',close:'21:00'},4:{open:'09:00',close:'21:00'},5:{open:'09:00',close:'21:00'},6:{open:'09:00',close:'21:00'}},
  exceptions: []
};
export const categories = [{id:'hair',title:'Стрижки и окрашивание',short:'Стрижки и окрашивание',count:7},{id:'men',title:'Мужской зал',short:'Мужской зал',count:3},{id:'nails',title:'Ногтевой сервис',short:'Ногтевой сервис',count:15}];
export const catalog = {source:'provided-screenshots',ownerVerified:false,verifiedAt:null,currency:'RUB'};
const records = [
  ['hair-biowave','hair','Биохимическая завивка',3000,false,'prices-1.png'],
  ['hair-complex-color','hair','Колорирование, шатуш, сложное окрашивание',4700,false,'prices-1.png'],
  ['hair-highlights','hair','Мелирование волос',2850,false,'prices-1.png'],
  ['hair-color','hair','Окрашивание волос',2800,false,'prices-1.png'],
  ['hair-cut','hair','Стрижка',900,true,'prices-2.png'],
  ['hair-styling','hair','Укладка волос, вечерняя прическа',800,false,'prices-2.png'],
  ['hair-mask','hair','Маска для волос',800,false,'prices-2.png'],
  ['men-color','men','Окрашивание волос, бороды',2500,true,'prices-2.png'],
  ['men-cut','men','Мужская стрижка',400,false,'prices-2.png'],
  ['men-beard','men','Стрижка бороды',650,false,'prices-2.png'],
  ['nails-correction','nails','Коррекция наращенных ногтей',1800,false,'prices-1.png'],
  ['nails-manicure','nails','Комбинированный маникюр',750,false,'prices-1.png'],
  ['nails-extension','nails','Наращивание ногтей (руки, ноги)',2300,true,'prices-1.png'],
  ['nails-paraffin','nails','Парафинотерапия для рук',600,false,'prices-1.png'],
  ['nails-pedicure','nails','Комбинированный педикюр',1850,false,'prices-1.png'],
  ['nails-french','nails','Покрытие ногтей гель-лаком (френч)',1500,false,'prices-1.png'],
  ['nails-shellac','nails','Покрытие ногтей гель-лаком (shellac)',1300,false,'prices-1.png'],
  ['nails-polish','nails','Покрытие ногтей: основа, лак, закрепитель',400,false,'prices-1.png'],
  ['nails-repair','nails','Ремонт одного ногтя',300,false,'prices-1.png'],
  ['nails-manicure-set','nails','Снятие геля + маникюр + покрытие гель-лаком',2500,true,'prices-1.png'],
  ['nails-pedicure-set','nails','Снятие геля + педикюр + покрытие гель-лаком',3150,true,'prices-1.png'],
  ['nails-gel-removal','nails','Снятие гель-лака, shellac',400,false,'prices-1.png'],
  ['nails-extension-removal','nails','Снятие искусственных ногтей',600,false,'prices-1.png'],
  ['nails-spa','nails','Спа-маникюр: массаж, скраб, маска',1150,false,'prices-1.png'],
  ['nails-strengthening','nails','Укрепление гелем (руки, ноги)',1400,true,'prices-1.png']
];
export const services = records.map(([id,categoryId,title,priceRub,requiresClarification,file])=>({id,categoryId,title,priceRub,requiresClarification,sourceLabel:'Прайс заказчика',sourceFile:`original-materials/references/${file}`}));
export const reviews = [
 {name:'Алексей К.',date:'17.07.2025',isoDate:'2025-07-17',quote:'Уютная, спокойная парикмахерская.'},
 {name:'Александра Полякова',date:'05.08.2025',isoDate:'2025-08-05',quote:'Благодарю парикмахера Джозетту за внимательное отношение и красивую стрижку'},
 {name:'Кирилл П.',date:'25.12.2024',isoDate:'2024-12-25',quote:'Не меняю это место уже 8 лет'}
];
export const rating = {value:4.3,ratings:147,reviews:64,snapshot:'15.09.2026'};
export const photos = [
 {file:'styling-corner',caption:'Рабочее место у окна',alt:'Зеркало, коричневое кресло и растения на фоне белого кирпича и красной стены'},
 {file:'main-hall',caption:'Рабочие места',alt:'Перспектива зала с рядом кресел и зеркал вдоль светлой кирпичной стены'},
 {file:'waiting-area',caption:'Зона ожидания',alt:'Диван у входа и витрина в зоне ожидания'},
 {file:'reception',caption:'Стойка парикмахерской',alt:'Деревянная стойка парикмахерской и живые растения возле окна'}
];
export const money = value=>new Intl.NumberFormat('ru-RU').format(value)+'\u00a0₽';
export const escapeHtml = value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
