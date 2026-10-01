import {business,categories,services,reviews,photos,money,escapeHtml as e} from './content.js';
import {chooseService,setServiceSelected,getServiceSelection,focusBooking,initializeBooking} from './booking-ui.js';
let activeCategory='hair',nailsExpanded=false;
const priceCatalog=document.querySelector('#price-catalog');
priceCatalog.innerHTML=`<div class="tabs" role="tablist" aria-label="Направления услуг">${categories.map((c,i)=>`<button class="tab" id="tab-${c.id}" role="tab" aria-selected="${i===0}" aria-controls="price-panel" tabindex="${i===0?0:-1}" data-category="${c.id}">${c.title}<small>${c.count}</small></button>`).join('')}</div><div class="catalog-basket"><p id="catalog-selection" role="status">Можно выбрать несколько услуг</p><button class="basket-continue" type="button">К заявке <span aria-hidden="true">↗</span></button></div><div role="tabpanel" id="price-panel" aria-labelledby="tab-hair" tabindex="0"></div>`;
priceCatalog.querySelector('.basket-continue').addEventListener('click',focusBooking);
function updateCatalogSelection(){
  const {serviceIds,total,locked}=getServiceSelection();
  priceCatalog.querySelector('#catalog-selection').textContent=serviceIds.length?`Выбрано услуг: ${serviceIds.length} · ${money(total)}`:'Можно выбрать несколько услуг';
  priceCatalog.querySelector('.catalog-basket').classList.toggle('has-selection',serviceIds.length>0);
  priceCatalog.querySelectorAll('[data-service]').forEach(button=>{
    const selected=serviceIds.includes(button.dataset.service);const item=services.find(s=>s.id===button.dataset.service);
    button.classList.toggle('chosen',selected);button.setAttribute('aria-pressed',String(selected));button.disabled=locked;
    button.setAttribute('aria-label',`${selected?'Убрать':'Добавить'}: ${item.title}, ${money(item.priceRub)}`);
    button.querySelector('.choose-label').textContent=selected?'Выбрано':'Выбрать';
    button.querySelector('[aria-hidden]').textContent=selected?'✓':'+';
  });
}
function renderPrices(){
  const items=services.filter(s=>s.categoryId===activeCategory);
  const visible=activeCategory==='nails'&&!nailsExpanded?items.slice(0,7):items;
  const panel=document.querySelector('#price-panel');
  panel.setAttribute('aria-labelledby','tab-'+activeCategory);
  panel.innerHTML=`<div class="price-list">${visible.map(s=>`<div class="price-row"><div class="service-title">${e(s.title)}${s.id==='hair-cut'?'<small>Вид стрижки уточним по телефону</small>':''}</div><div class="service-price">${money(s.priceRub)}</div><button class="select-service" data-service="${s.id}" aria-pressed="false"><span class="choose-label">Выбрать</span><span aria-hidden="true">+</span></button></div>`).join('')}</div>${activeCategory==='nails'?`<button class="expand-services" aria-expanded="${nailsExpanded}">${nailsExpanded?'Свернуть список':'Показать все 15 услуг'} <span aria-hidden="true">${nailsExpanded?'−':'+'}</span></button>`:''}`;
  updateCatalogSelection();
  panel.querySelectorAll('[data-service]').forEach(b=>b.addEventListener('click',()=>setServiceSelected(b.dataset.service,!getServiceSelection().serviceIds.includes(b.dataset.service))));
  panel.querySelector('.expand-services')?.addEventListener('click',()=>{nailsExpanded=!nailsExpanded;renderPrices();document.querySelector('.expand-services').focus({preventScroll:true});});
}
function switchCategory(category,focus=false){activeCategory=category;document.querySelectorAll('.tab').forEach(t=>{const current=t.dataset.category===category;t.setAttribute('aria-selected',String(current));t.tabIndex=current?0:-1;if(current&&focus)t.focus();});renderPrices();}
document.querySelectorAll('.tab').forEach((tab,i)=>{
 tab.addEventListener('click',()=>switchCategory(tab.dataset.category));
 tab.addEventListener('keydown',event=>{let next=i;if(event.key==='ArrowRight')next=(i+1)%3;else if(event.key==='ArrowLeft')next=(i+2)%3;else if(event.key==='Home')next=0;else if(event.key==='End')next=2;else return;event.preventDefault();switchCategory(categories[next].id,true);});
});
document.addEventListener('services-changed',updateCatalogSelection);
renderPrices();initializeBooking();
document.querySelector('#review-list').innerHTML=reviews.map(r=>`<article class="review reveal"><span class="quote-mark" aria-hidden="true">“</span><blockquote>«${e(r.quote)}»</blockquote><div class="review-meta"><span>${e(r.name)}</span><time datetime="${r.isoDate}">${r.date}</time></div><a href="${business.reviewsUrl}" target="_blank" rel="noopener noreferrer">Фрагмент отзыва · Яндекс Карты</a></article>`).join('');
document.querySelectorAll('a[href="#booking"]').forEach(a=>{if(!a.closest('#mobile-menu'))a.addEventListener('click',event=>{event.preventDefault();focusBooking();});});
document.addEventListener('scroll',()=>document.querySelector('#header').classList.toggle('scrolled',scrollY>30),{passive:true});
const menu=document.querySelector('#mobile-menu'),menuToggle=document.querySelector('.menu-toggle');let menuNavigating=false;
function closeMenu(){menu.close();}
menuToggle.addEventListener('click',()=>{menuNavigating=false;menu.showModal();document.body.classList.add('modal-open');menuToggle.setAttribute('aria-expanded','true');});
menu.querySelector('[data-close-menu]').addEventListener('click',closeMenu);
menu.addEventListener('click',event=>{if(event.target===menu)closeMenu();});
menu.addEventListener('close',()=>{document.body.classList.remove('modal-open');menuToggle.setAttribute('aria-expanded','false');if(!menuNavigating)menuToggle.focus({preventScroll:true});});
menu.querySelectorAll('nav a,a[href="#booking"]').forEach(a=>a.addEventListener('click',event=>{event.preventDefault();menuNavigating=true;const target=a.getAttribute('href');closeMenu();if(target==='#booking')focusBooking();else{document.querySelector(target).scrollIntoView({behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth'});const h=document.querySelector(target+' h2');h.setAttribute('tabindex','-1');h.focus({preventScroll:true});}}));
const gallery=document.querySelector('#photo-dialog');let photoIndex=0,photoTrigger=null;
function showPhoto(){const p=photos[photoIndex],img=gallery.querySelector('img');img.src=`/parikmaherskaya-avia-demo/images/${p.file}.webp`;img.alt=p.alt;document.querySelector('#photo-caption').textContent=p.caption;document.querySelector('#photo-counter').textContent=`${photoIndex+1} / ${photos.length}`;}
document.querySelectorAll('[data-photo]').forEach(b=>b.addEventListener('click',()=>{photoTrigger=b;photoIndex=Number(b.dataset.photo);showPhoto();gallery.showModal();document.body.classList.add('modal-open');}));
gallery.querySelector('.photo-close').addEventListener('click',()=>gallery.close());
gallery.querySelector('[data-photo-prev]').addEventListener('click',()=>{photoIndex=(photoIndex+photos.length-1)%photos.length;showPhoto();});
gallery.querySelector('[data-photo-next]').addEventListener('click',()=>{photoIndex=(photoIndex+1)%photos.length;showPhoto();});
gallery.addEventListener('keydown',event=>{if(event.key==='ArrowLeft'||event.key==='ArrowRight'){event.preventDefault();photoIndex=(photoIndex+(event.key==='ArrowLeft'?-1:1)+photos.length)%photos.length;showPhoto();}});
gallery.addEventListener('close',()=>{document.body.classList.remove('modal-open');photoTrigger?.focus({preventScroll:true});});
gallery.addEventListener('click',event=>{if(event.target===gallery)gallery.close();});
const bar=document.querySelector('.mobile-booking-bar');let heroVisible=true,bookingVisible=false;
function updateBar(){bar.hidden=heroVisible||bookingVisible||document.activeElement?.matches('input,textarea,select')||document.querySelector('dialog[open]')!==null;}
new IntersectionObserver(entries=>{heroVisible=entries[0].isIntersecting;updateBar();},{threshold:0}).observe(document.querySelector('#hero-cta'));
new IntersectionObserver(entries=>{bookingVisible=entries[0].isIntersecting;updateBar();},{threshold:0}).observe(document.querySelector('#booking'));
document.addEventListener('focusin',updateBar);document.addEventListener('focusout',()=>requestAnimationFrame(updateBar));
new MutationObserver(updateBar).observe(document.body,{attributes:true,attributeFilter:['class']});
if(!matchMedia('(prefers-reduced-motion:reduce)').matches){const reveals=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-revealed');reveals.unobserve(entry.target);}}),{threshold:.08});document.querySelectorAll('.reveal').forEach(el=>reveals.observe(el));}
// This local, read-only catalog and explicit selection tool never handle contacts.
const modelContext=document.modelContext;
if(modelContext?.registerTool){
  const lifecycle=new AbortController();
  const register=tool=>{try{void Promise.resolve(modelContext.registerTool(tool,{signal:lifecycle.signal})).catch(()=>{});}catch{}};
  register({name:'get_service_catalog',title:'Услуги и цены',description:'Read the 25 salon services and prices from the provided price list. Prices require phone confirmation.',annotations:{readOnlyHint:true,untrustedContentHint:false},inputSchema:{type:'object',properties:{},additionalProperties:false},execute:async()=>({categories,services:services.map(({id,categoryId,title,priceRub})=>({id,categoryId,title,priceRub})),currency:'RUB',ownerVerified:false})});
  register({name:'select_salon_service',title:'Добавить услугу',description:'Add a service to the shared demo booking selection, keeping previously selected services. Repeated additions do not create duplicates. Does not submit a request or transmit contact data.',annotations:{readOnlyHint:false,untrustedContentHint:false},inputSchema:{type:'object',properties:{serviceId:{type:'string',enum:services.map(s=>s.id)}},required:['serviceId'],additionalProperties:false},execute:async input=>{if(!input||typeof input.serviceId!=='string'||!services.some(s=>s.id===input.serviceId))throw new Error('Unknown service ID');return {selected:chooseService(input.serviceId),serviceIds:getServiceSelection().serviceIds,submitted:false};}});
  window.addEventListener('pagehide',()=>lifecycle.abort(),{once:true});
}
