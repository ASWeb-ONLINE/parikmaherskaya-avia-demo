import {business,services} from './content.js';
export function moscowNow(now=new Date()) {
  const parts=Object.fromEntries(new Intl.DateTimeFormat('en-CA',{timeZone:business.timezone,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(now).map(p=>[p.type,p.value]));
  return {date:`${parts.year}-${parts.month}-${parts.day}`,minutes:Number(parts.hour)*60+Number(parts.minute)};
}
export const addDays=(date,days)=>new Date(Date.parse(date+'T12:00:00Z')+days*86400000).toISOString().slice(0,10);
export const minutes=t=>Number(t.split(':')[0])*60+Number(t.split(':')[1]);
export function hoursForDate(date,config=business){
  const override=config.exceptions.find(x=>x.date===date);
  if(override)return override.closed?null:override;
  return config.hours[new Date(date+'T12:00:00Z').getUTCDay()]??null;
}
export function timeOptions(date,now=new Date(),config=business){
  if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||!Number.isFinite(Date.parse(date+'T12:00:00Z')))return [];
  const current=moscowNow(now);
  if(date<current.date||date>addDays(current.date,config.bookingDaysAhead))return [];
  const hours=hoursForDate(date,config);if(!hours)return [];
  const result=[];
  for(let m=minutes(hours.open);m<minutes(hours.close);m+=30){
    if(date===current.date&&m<=current.minutes)continue;
    result.push(`${String(Math.floor(m/60)).padStart(2,'0')}:${String(m%60).padStart(2,'0')}`);
  }
  return result;
}
export function dateOptions(now=new Date(),config=business){
  const {date}=moscowNow(now);
  return Array.from({length:config.bookingDaysAhead+1},(_,i)=>addDays(date,i)).filter(d=>timeOptions(d,now,config).length);
}
export function dateLabel(date,options={weekday:'long',day:'numeric',month:'long'}){
  return date?new Intl.DateTimeFormat('ru-RU',{timeZone:business.timezone,...options}).format(new Date(date+'T12:00:00Z')):'';
}
export function normalizePhone(value){
  let n=value.replace(/\D/g,'');
  if(n.length===11&&(n[0]==='8'||n[0]==='7'))n=n.slice(1);
  else if(n.length!==10)return null;
  return n.length===10?'+7'+n:null;
}
export function formatPhone(value){
  const n=normalizePhone(value);return n?`+7 (${n.slice(2,5)}) ${n.slice(5,8)}-${n.slice(8,10)}-${n.slice(10,12)}`:value;
}
export function validateContacts(state){
  const errors={};const name=state.customerName.trim();
  if(name.length<2||name.length>80||!/^\p{L}[\p{L}\s-]*$/u.test(name))errors.customerName='Укажите имя: от 2 до 80 букв, пробелы и дефисы допустимы';
  if(!normalizePhone(state.phone))errors.phone='Укажите номер телефона полностью';
  if(state.comment.length>500)errors.comment='Комментарий должен быть не длиннее 500 знаков';
  return errors;
}
export function validatePreference(state,now=new Date()){
  if(!dateOptions(now).includes(state.preferredDate))return {preferredDate:'Выберите дату из доступного диапазона. На сегодня вариантов может уже не быть'};
  if(state.timeMode!=='phone'&&!timeOptions(state.preferredDate,now).includes(state.preferredTime))return {preferredTime:'Выберите желаемое время. Прежнее значение уже не подходит'};
  return {};
}
export function selectedServices(ids){
  if(!Array.isArray(ids))throw new Error('Invalid service selection');
  return [...new Set(ids)].map(id=>{const item=services.find(s=>s.id===id);if(!item)throw new Error('Unknown service');return item;});
}
export const selectionTotal=ids=>selectedServices(ids).reduce((total,s)=>total+s.priceRub,0);
export function updateSelection(ids,id,selected=true){
  const current=selectedServices(ids).map(s=>s.id);
  if(!services.some(s=>s.id===id))throw new Error('Unknown service');
  return selected?[...new Set([...current,id])]:current.filter(value=>value!==id);
}
export function makePayload(state){
  if(!['service','consultation'].includes(state.serviceIntent))throw new Error('Unknown service intent');
  const serviceIds=state.serviceIntent==='consultation'?[]:selectedServices(state.serviceIds).map(s=>s.id).sort();
  if(state.serviceIntent==='service'&&!serviceIds.length)throw new Error('Select at least one service');
  return {serviceIds,serviceIntent:state.serviceIntent,preferredDate:state.preferredDate,preferredTime:state.timeMode==='phone'?null:state.preferredTime,timezone:business.timezone,customerName:state.customerName.trim(),phone:normalizePhone(state.phone),comment:state.comment.trim(),source:'website'};
}
export function createBookingAdapter({mode=business.mode,scenario='success',delayMs=650}={}){
  return async function submitBookingRequest(_payload){
    if(mode!=='demo')return {kind:'error',retryable:false,message:'Прием заявок еще не подключен. Пожалуйста, позвоните в парикмахерскую'};
    await new Promise(resolve=>setTimeout(resolve,delayMs));
    if(scenario==='error')return {kind:'error',retryable:true,message:'Не удалось отправить заявку. Попробуйте еще раз или позвоните'};
    if(scenario==='timeout')return {kind:'error',retryable:true,message:'Результат запроса пока неизвестен. Попробуйте еще раз с теми же данными или позвоните'};
    return {kind:'demo'};
  };
}
export function createRequestManager(adapter=createBookingAdapter()){
  let fingerprint=null,requestId=null,pending=null;
  return {submit(data){
    if(pending)return pending;
    const next=JSON.stringify(data);
    if(next!==fingerprint){fingerprint=next;requestId=crypto.randomUUID();}
    pending=Promise.resolve().then(()=>adapter({...data,requestId})).catch(()=>({kind:'error',retryable:true,message:'Не удалось отправить заявку. Попробуйте еще раз или позвоните'})).finally(()=>{pending=null;});
    return pending;
  },reset(){fingerprint=null;requestId=null;}};
}
