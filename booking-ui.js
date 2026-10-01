import {business,categories,services,money,escapeHtml as e} from './content.js';
import {dateOptions,dateLabel,timeOptions,moscowNow,validateContacts,validatePreference,formatPhone,makePayload,createRequestManager,selectedServices,selectionTotal,updateSelection} from './booking-domain.js';
const initial=()=>({step:1,category:'hair',serviceIds:[],serviceIntent:'service',preferredDate:'',preferredTime:'',timeMode:'exact',customerName:'',phone:'',comment:'',errors:{},notice:'',sending:false,result:null});
let state=initial();
const manager=createRequestManager();
const panel=document.querySelector('#booking-panel');
const summary=document.querySelector('#booking-summary');
const selection=()=>selectedServices(state.serviceIds);
export const getServiceSelection=()=>({serviceIds:[...state.serviceIds],total:selectionTotal(state.serviceIds),locked:state.sending});
function announceSelection(){document.dispatchEvent(new CustomEvent('services-changed',{detail:getServiceSelection()}));}
const error=(id)=>`<p class="error-message" id="error-${id}">${e(state.errors[id]||'')}</p>`;
const fieldAttributes=id=>`aria-describedby="error-${id}" aria-invalid="${!!state.errors[id]}"`;
const hintFor=s=>s?.id==='hair-cut'?'Вид стрижки уточним по телефону':s?.requiresClarification?'Состав услуги уточним по телефону':'';
const actions=(last=false)=>`<div class="form-actions">${state.step>1?'<button class="back-button" type="button" data-back>Назад</button>':''}<button class="button" type="${last?'submit':'button'}" ${last?'':'data-next'} ${state.sending?'disabled':''}>${state.sending?'Показываем заявку…':last?'Посмотреть заявку':'Продолжить'} <span aria-hidden="true">${last?'↗':'→'}</span></button></div>`;
function summaryMarkup(includeContacts=true){
  const chosen=selection();const consultation=state.serviceIntent==='consultation';
  return `${chosen.length?`<p class="summary-service">Выбрано услуг: ${chosen.length}</p><ul class="summary-items">${chosen.map(s=>`<li><div><span>${e(s.title)}</span><small>${money(s.priceRub)}</small></div>${!state.result?`<button type="button" class="remove-service" data-remove-service="${s.id}" aria-label="Убрать: ${e(s.title)}" ${state.sending?'disabled':''}><span aria-hidden="true">×</span></button>`:''}</li>`).join('')}</ul><div class="summary-cost"><span>Итого по прайсу</span><strong>${money(selectionTotal(state.serviceIds))}</strong></div>`:`<p class="summary-service">${consultation?'Помогите выбрать услугу':'Начнем с выбора услуг'}</p><p class="summary-category">${consultation?'Стоимость уточним по телефону':'Можно выбрать несколько услуг из разных направлений'}</p>`}${chosen.some(s=>s.id.endsWith('-set'))?'<p class="summary-category">В комплекс уже входят перечисленные в нем процедуры. Их не нужно добавлять отдельно.</p>':''}${chosen.some(s=>s.requiresClarification)?'<p class="summary-category">Состав выбранных услуг уточним по телефону.</p>':''}${state.preferredDate?`<div class="summary-details"><p><small>Желаемая дата</small>${e(dateLabel(state.preferredDate))}</p><p><small>Желаемое время · Москва</small>${e(state.timeMode==='phone'?'Обсудить по телефону':state.preferredTime||'Пока не выбрано')}</p></div>`:''}${includeContacts&&(state.customerName||state.phone)?`<div class="summary-details"><p><small>Ваши контакты</small>${e(state.customerName)}</p><p>${e(formatPhone(state.phone))}</p></div>`:''}`;
}
function updateSummary(){summary.innerHTML=summaryMarkup();const mobile=document.querySelector('#mobile-summary');if(mobile)mobile.innerHTML=summaryMarkup()+'<p class="summary-note">Время и стоимость подтвердим по телефону.</p><p class="summary-note">Продолжительность и возможность записи уточним при звонке.</p>';}
function renderServiceOptions(){
  const list=panel.querySelector('#service-options');if(!list)return;
  list.innerHTML=services.filter(s=>s.categoryId===state.category).map(s=>`<label class="service-option"><input type="checkbox" value="${s.id}" ${state.serviceIds.includes(s.id)?'checked':''}><span class="service-option-name">${e(s.title)}${hintFor(s)?`<small>${hintFor(s)}</small>`:''}</span><span class="service-option-price">${money(s.priceRub)}</span></label>`).join('');
}
function selectionNote(){return state.serviceIntent==='consultation'?'Поможем с выбором по телефону':state.serviceIds.length?`Выбрано услуг: ${state.serviceIds.length} · ${money(selectionTotal(state.serviceIds))} по прайсу`:'Можно сочетать услуги из разных направлений';}
function stepOne(){return `<div class="form-step"><h3 id="step-title" tabindex="-1">Что хотите сделать?</h3><p class="helper">Отметьте все нужные услуги. Выбор сохранится при смене направления.</p><div class="field"><label for="booking-category">Направление</label><select id="booking-category">${categories.map(c=>`<option value="${c.id}" ${c.id===state.category?'selected':''}>${c.title}</option>`).join('')}</select></div><fieldset class="service-options-field" id="serviceIds" tabindex="-1" ${fieldAttributes('serviceIds')}><legend>Услуги <span class="optional">· можно выбрать несколько</span></legend><div id="service-options" class="service-options"></div>${error('serviceIds')}</fieldset><p class="selected-service-note" role="status">${selectionNote()}</p><button class="help-choice" type="button" aria-pressed="${state.serviceIntent==='consultation'}" data-consultation><span aria-hidden="true">${state.serviceIntent==='consultation'?'✓':'?'}</span>Помогите выбрать услугу</button>${actions()}</div>`;}
function refreshSelection(){
  panel.querySelectorAll('#service-options input').forEach(input=>{input.checked=state.serviceIds.includes(input.value);});
  const note=panel.querySelector('.selected-service-note');if(note)note.textContent=selectionNote();
  const help=panel.querySelector('[data-consultation]');if(help){help.setAttribute('aria-pressed',String(state.serviceIntent==='consultation'));help.querySelector('span').textContent=state.serviceIntent==='consultation'?'✓':'?';}
  updateSummary();announceSelection();
}
function refreshTimes(){
  const select=panel.querySelector('#preferredTime');if(!select)return;
  select.innerHTML='<option value="">Выберите время</option>'+timeOptions(state.preferredDate).map(t=>`<option value="${t}" ${t===state.preferredTime?'selected':''}>${t}</option>`).join('');
  panel.querySelector('#time-field').hidden=state.timeMode==='phone';
}
function stepTwo(){
  const dates=dateOptions();
  if(!state.preferredDate||!dates.includes(state.preferredDate)){state.preferredDate=dates[0]||'';state.preferredTime='';}
  const noToday=!dates.includes(moscowNow().date);
  return `<div class="form-step"><h3 id="step-title" tabindex="-1">Когда вам удобно?</h3><p class="helper">Это пожелание по времени. Запись подтвердим после звонка.</p>${noToday?'<p class="time-notice">На сегодня вариантов для заявки через форму больше нет. Можно <a href="tel:'+business.phone+'">позвонить</a>.</p>':''}<div class="field"><label for="preferredDate">Желаемая дата</label><select id="preferredDate" ${fieldAttributes('preferredDate')}>${dates.map(d=>`<option value="${d}" ${state.preferredDate===d?'selected':''}>${e(dateLabel(d))}${d===moscowNow().date?' · сегодня':''}</option>`).join('')}</select>${error('preferredDate')}</div><fieldset class="time-modes"><legend>Как договоримся о времени?</legend><label class="radio-row"><input type="radio" name="timeMode" value="exact" ${state.timeMode==='exact'?'checked':''}>Указать время</label><label class="radio-row"><input type="radio" name="timeMode" value="phone" ${state.timeMode==='phone'?'checked':''}>Обсудить время по телефону</label></fieldset><div id="time-field" class="field" ${state.timeMode==='phone'?'hidden':''}><label for="preferredTime">Желаемое время</label><select id="preferredTime" ${fieldAttributes('preferredTime')}></select>${error('preferredTime')}<p class="helper">Время московское. Варианты не отражают занятость мастеров.</p></div><p class="time-notice" aria-live="polite" id="time-notice">${e(state.notice)}</p>${actions()}</div>`;
}
function stepThree(){return `<form class="form-step" id="contact-form" novalidate><h3 id="step-title" tabindex="-1">Как с вами связаться?</h3><p class="helper">Для демонстрации используйте тестовые данные.</p><div class="field-grid"><div class="field"><label for="customerName">Ваше имя</label><input id="customerName" name="customerName" autocomplete="name" maxlength="80" value="${e(state.customerName)}" placeholder="Например, Анна" ${fieldAttributes('customerName')}>${error('customerName')}</div><div class="field"><label for="phone">Телефон</label><input id="phone" name="phone" type="tel" inputmode="tel" autocomplete="tel" maxlength="30" value="${e(state.phone)}" placeholder="+7 (___) ___-__-__" ${fieldAttributes('phone')}>${error('phone')}</div></div><div class="field"><label for="comment">Комментарий <span class="optional">· необязательно</span></label><textarea id="comment" name="comment" maxlength="500" placeholder="Пожелания к стрижке, дополнительные услуги или имя мастера" ${fieldAttributes('comment')}>${e(state.comment)}</textarea>${error('comment')}<p class="helper"><span id="comment-count">${state.comment.length}</span> / 500</p></div><p class="demo-form-note">Демонстрация формы. Данные не передаются.</p><details class="mobile-review" open><summary>Проверьте вашу заявку</summary><div id="mobile-summary"></div></details><div class="form-error" role="alert" id="delivery-error"></div>${actions(true)}<p class="demo-form-note">Это запрос на запись. Время визита подтвердит сотрудник.</p><p class="sr-only" id="sending-status" role="status"></p></form>`;}
function successMarkup(){return `<div class="success-view"><div class="success-icon" aria-hidden="true">✓</div><h3 id="step-title" tabindex="-1">Так будет выглядеть заявка</h3><p>Это демонстрация: данные не отправлены в парикмахерскую.</p><details class="mobile-review" open><summary>Ваша заявка</summary><div id="mobile-summary"></div></details><button class="button" data-new>Новая заявка <span aria-hidden="true">↗</span></button><p>Договориться о визите можно по телефону<br><a class="text-link" href="tel:${business.phone}">${business.phoneDisplay}</a></p></div>`;}
function render(focus=false){
  panel.innerHTML=state.result?.kind==='demo'?successMarkup():[stepOne,stepTwo,stepThree][state.step-1]();
  document.querySelectorAll('.stepper li').forEach((li,i)=>{li.classList.toggle('done',i+1<state.step);if(i+1===state.step)li.setAttribute('aria-current','step');else li.removeAttribute('aria-current');});
  if(state.step===1&&!state.result)renderServiceOptions();
  if(state.step===2&&!state.result)refreshTimes();
  updateSummary();bind();
  if(focus){const title=panel.querySelector('#step-title');title.focus({preventScroll:true});if(!matchMedia('(min-width: 701px)').matches)title.scrollIntoView({block:'center',behavior:motion()});}
}
function motion(){return matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth';}
function showErrors(errors){
  state.errors=errors;
  for(const id of ['serviceIds','preferredDate','preferredTime','customerName','phone','comment']){
    const input=panel.querySelector('#'+id),msg=panel.querySelector('#error-'+id);
    if(input)input.setAttribute('aria-invalid',String(!!errors[id]));
    if(msg)msg.textContent=errors[id]||'';
  }
  const first=Object.keys(errors)[0];if(first)panel.querySelector('#'+first)?.focus();
}
function next(){
  if(state.step===1){if(!state.serviceIds.length&&state.serviceIntent!=='consultation'){showErrors({serviceIds:'Выберите хотя бы одну услугу или попросите помочь с выбором'});return;}}
  if(state.step===2){const errors=validatePreference(state);if(Object.keys(errors).length){if(errors.preferredTime){state.preferredTime='';refreshTimes();updateSummary();}showErrors(errors);return;}}
  state.errors={};state.step++;render(true);
}
async function submit(event){
  event.preventDefault();if(state.sending)return;
  if(!state.serviceIds.length&&state.serviceIntent!=='consultation'){state.step=1;render(true);showErrors({serviceIds:'Выберите хотя бы одну услугу'});return;}
  const timeErrors=validatePreference(state);
  if(Object.keys(timeErrors).length){state.step=2;state.errors=timeErrors;state.preferredTime='';state.notice='Время изменилось, пока заявка была открыта. Пожалуйста, выберите новое пожелание.';render(true);showErrors(timeErrors);return;}
  const errors=validateContacts(state);showErrors(errors);if(Object.keys(errors).length)return;
  state.phone=formatPhone(state.phone);panel.querySelector('#phone').value=state.phone;updateSummary();
  state.sending=true;refreshSelection();const submitButton=panel.querySelector('[type=submit]');submitButton.disabled=true;submitButton.textContent='Показываем заявку…';
  panel.querySelector('#sending-status').textContent='Готовим демонстрацию заявки';
  const back=panel.querySelector('[data-back]');back.disabled=true;
  panel.querySelectorAll('input,textarea').forEach(input=>input.readOnly=true);
  panel.querySelector('#delivery-error').textContent='';
  const result=await manager.submit(makePayload(state));state.sending=false;announceSelection();
  if(result.kind==='demo'){state.result=result;render(true);return;}
  // Live delivery is intentionally unavailable. A demo never becomes accepted.
  const message=result.kind==='error'?result.message:'Прием заявок еще не подключен. Пожалуйста, позвоните';
  panel.querySelector('#delivery-error').innerHTML=`${e(message)}: <a href="tel:${business.phone}">${business.phoneDisplay}</a>`;
  panel.querySelector('#sending-status').textContent='Заявка не подтверждена';submitButton.disabled=false;submitButton.innerHTML='Посмотреть заявку <span aria-hidden="true">↗</span>';back.disabled=false;
  panel.querySelectorAll('input,textarea').forEach(input=>input.readOnly=false);
  updateSummary();
}
function bind(){
  panel.querySelector('[data-next]')?.addEventListener('click',next);
  panel.querySelector('[data-back]')?.addEventListener('click',()=>{state.step--;state.errors={};render(true);});
  panel.querySelector('[data-new]')?.addEventListener('click',()=>{state=initial();manager.reset();render(true);announceSelection();});
  panel.querySelector('#booking-category')?.addEventListener('change',event=>{state.category=event.target.value;renderServiceOptions();});
  panel.querySelector('#service-options')?.addEventListener('change',event=>{if(event.target.matches('input[type=checkbox]'))setServiceSelected(event.target.value,event.target.checked);});
  panel.querySelector('[data-consultation]')?.addEventListener('click',()=>{state.serviceIds=[];state.serviceIntent='consultation';showErrors({});refreshSelection();});
  panel.querySelector('#preferredDate')?.addEventListener('change',event=>{
    state.preferredDate=event.target.value;state.notice='';
    if(state.preferredTime&&!timeOptions(state.preferredDate).includes(state.preferredTime)){state.preferredTime='';state.notice='Прежнее время не подходит для этой даты. Выберите другое время.';}
    panel.querySelector('#time-notice').textContent=state.notice;showErrors({});refreshTimes();updateSummary();
  });
  panel.querySelectorAll('[name=timeMode]').forEach(radio=>radio.addEventListener('change',()=>{state.timeMode=radio.value;if(radio.value==='phone')state.preferredTime='';showErrors({});refreshTimes();updateSummary();}));
  panel.querySelector('#preferredTime')?.addEventListener('change',event=>{state.preferredTime=event.target.value;showErrors({});updateSummary();});
  for(const id of ['customerName','phone','comment']){
    const input=panel.querySelector('#'+id);input?.addEventListener('input',()=>{state[id]=input.value;if(state.errors[id]){delete state.errors[id];panel.querySelector('#error-'+id).textContent='';input.setAttribute('aria-invalid','false');}if(id==='comment')panel.querySelector('#comment-count').textContent=state.comment.length;updateSummary();});
  }
  panel.querySelector('#phone')?.addEventListener('blur',event=>{state.phone=formatPhone(event.target.value);event.target.value=state.phone;updateSummary();});
  panel.querySelector('#contact-form')?.addEventListener('submit',submit);
}
export function setServiceSelected(id,selected=true){
  const chosen=services.find(s=>s.id===id);if(!chosen)return false;
  if(state.sending)return false;
  const restart=!!state.result;
  if(restart){state.result=null;state.step=1;manager.reset();}
  state.serviceIds=updateSelection(state.serviceIds,id,selected);state.serviceIntent='service';
  if(!state.serviceIds.length&&state.step>1){state.step=1;render(true);}
  else if(restart){state.category=chosen.categoryId;render();}
  showErrors({});refreshSelection();return true;
}
export const chooseService=id=>setServiceSelected(id,true);
export function focusBooking(){document.querySelector('#booking').scrollIntoView({behavior:motion(),block:'start'});document.querySelector('#booking-title').focus({preventScroll:true});}
export function initializeBooking(){
  render();
  document.querySelector('.booking-card').addEventListener('click',event=>{
    const button=event.target.closest('[data-remove-service]');if(!button||state.sending||state.result)return;
    const container=button.closest('#mobile-summary,#booking-summary');
    const buttons=[...container.querySelectorAll('[data-remove-service]')];const index=buttons.indexOf(button);
    setServiceSelected(button.dataset.removeService,false);
    const remaining=container.querySelectorAll('[data-remove-service]');
    if(remaining.length)remaining[Math.min(index,remaining.length-1)].focus({preventScroll:true});
    else panel.querySelector('#step-title')?.focus({preventScroll:true});
  });
  const recheck=()=>{
    if(state.result||state.sending||!state.preferredDate)return;
    if(state.preferredTime&&!timeOptions(state.preferredDate).includes(state.preferredTime)){
      state.preferredTime='';state.notice='Прежнее время уже наступило. Выберите новое пожелание по времени.';
      if(state.step===2){refreshTimes();panel.querySelector('#time-notice').textContent=state.notice;}
      updateSummary();
    }
  };
  const timer=setInterval(recheck,60000);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)recheck();});
  window.addEventListener('pagehide',()=>clearInterval(timer),{once:true});
}
