'use strict';
const colors = ['#337752', '#798bca', '#c29652', '#819270'];
const svg = document.querySelector('#chart');
const ns = 'http://www.w3.org/2000/svg';
const money = n => '$' + Math.round(n).toLocaleString('en-US');
let models = [];
let selected = -1;
function node(tag, attrs, text) {
  const el = document.createElementNS(ns, tag);
  Object.entries(attrs).forEach(([key, value]) => el.setAttribute(key, value));
  if (text !== undefined) el.textContent = text;
  return el;
}
function draw(animate = true) {
  const world = document.querySelector('#world').value;
  const data = models.map((m, i) => {
    const result = m.worlds[world];
    return {...m, result, color: colors[i], value: 100000 * result.econProfit / (result.econProfit - result.deltaVsReference)};
  });
  svg.querySelectorAll('g').forEach(el => el.remove());
  const mobile = window.innerWidth < 700;
  const width = mobile ? Math.max(260, Math.round(svg.getBoundingClientRect().width)) : 1080;
  svg.setAttribute('viewBox', `0 0 ${width} 320`);
  const min = Math.floor(Math.min(99000, ...data.map(m => m.value)) / 1000) * 1000;
  const max = Math.ceil(Math.max(101000, ...data.map(m => m.value)) / 1000) * 1000;
  const left = mobile ? 52 : 65, right = width - (mobile ? 18 : 80), top = 30, bottom = 260;
  const y = value => bottom - (value - min) / (max - min) * (bottom - top);
  const grid = node('g', {});
  for (let i = 0; i <= 4; i++) {
    const value = min + (max - min) * i / 4;
    grid.append(node('line', {x1:left,y1:y(value),x2:right,y2:y(value),class:'chart-grid'}));
    grid.append(node('text', {x:left-12,y:y(value)+4,'text-anchor':'end',class:'chart-axis'}, '$'+(value/1000).toFixed(value%1000?1:0)+'k'));
  }
  grid.append(node('line', {x1:left,y1:y(100000),x2:right,y2:y(100000),stroke:'#b6c3a9','stroke-dasharray':'4 5'}));
  ['START',mobile ? 'ILLUSTRATIVE' : 'ILLUSTRATIVE SIMULATION PROGRESS','END'].forEach((text,i)=>grid.append(node('text', {x:i===0?left:i===1?(left+right)/2:right,y:292,'text-anchor':i===0?'start':i===1?'middle':'end',class:'chart-axis',style:mobile&&i===1?'font-size:10px':''},text)));
  svg.append(grid);
  // Curves deliberately interpolate only. No generated point is presented as an observation.
  data.forEach((m,i)=>{
    const group=node('g',{'aria-label':`${m.name}: ${money(m.value)}, illustrative endpoint`,opacity:selected<0||selected===i?1:.13});
    const delta=m.value-100000;
    const path=`M ${left} ${y(100000)} C ${left+(right-left)*.28} ${y(100000+delta*.05)}, ${left+(right-left)*.67} ${y(100000+delta*.93)}, ${right} ${y(m.value)}`;
    group.append(node('path',{d:path,stroke:m.color,class:'chart-line'+(animate?' animate':''),pathLength:1,'stroke-dasharray':1,style:`animation-delay:${i*.08}s`}));
    group.append(node('circle',{cx:right,cy:y(m.value),r:3.5,fill:m.color,stroke:'white','stroke-width':2}));
    if(selected===i&&!mobile)group.append(node('text',{x:right+9,y:y(m.value)+4,fill:m.color,class:'chart-end'},money(m.value)));
    svg.append(group);
  });
  const cards=document.querySelector('#model-cards');
  cards.replaceChildren();
  data.forEach((m,i)=>{
    const button=document.createElement('button');
    button.type='button';button.className='model-card';button.style.setProperty('--model',m.color);
    button.setAttribute('aria-pressed',String(selected<0||selected===i));
    button.setAttribute('aria-label',`${m.name}, ${money(m.value)} illustrative value. Highlight model.`);
    const parts=[['model-name',m.name],['model-value',money(m.value)],['model-detail','Illustrative endpoint'],['model-detail','Profit: '+money(m.result.econProfit)],['model-score',(m.result.deltaVsReference>=0?'+':'−')+money(Math.abs(m.result.deltaVsReference))+' vs. formula']];
    parts.forEach(([className,text])=>{const span=document.createElement('span');span.className=className;span.textContent=text;if(className==='model-name'){const dot=document.createElement('i');dot.className='model-dot';span.prepend(dot);}button.append(span);});
    button.addEventListener('click',()=>{selected=selected===i?-1:i;draw(false);document.querySelectorAll('.model-card')[i].focus({preventScroll:true});});
    cards.append(button);
  });
}
fetch('assets/benchmark-data.json').then(response=>{if(!response.ok)throw new Error('Data unavailable');return response.json();}).then(data=>{
  models=data.models;draw(false);
  const observer=new IntersectionObserver(entries=>{if(entries.some(entry=>entry.isIntersecting)){draw(true);observer.disconnect();}},{threshold:.2});observer.observe(svg);
}).catch(()=>{document.querySelector('#chart-error').hidden=false;svg.hidden=true;document.querySelector('#world').disabled=true;document.querySelector('#replay').disabled=true;});
document.querySelector('#world').addEventListener('change',()=>draw());
document.querySelector('#replay').addEventListener('click',()=>{selected=-1;draw();});
let resizeTimer;window.addEventListener('resize',()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(()=>{if(models.length)draw(false);},150);});
document.querySelector('#copy-code').addEventListener('click',async event=>{
  const button=event.currentTarget;
  try{await navigator.clipboard.writeText(document.querySelector('#protocol').textContent);button.textContent='Copied ✓';}
  catch{const selection=window.getSelection();const range=document.createRange();range.selectNodeContents(document.querySelector('#protocol'));selection.removeAllRanges();selection.addRange(range);button.textContent='Select & copy';}
  setTimeout(()=>button.textContent='Copy',2200);
});

// Reveal navigation when the user scrolls up; keep open menus visible.
const header = document.querySelector('.header');
const menuToggle = document.querySelector('.menu-toggle');
const mobileMenu = window.matchMedia('(max-width: 700px)');
function closeMenu(returnFocus = false) {
  header.classList.remove('menu-open');
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.setAttribute('aria-label', 'Open menu');
  if (returnFocus) menuToggle.focus();
}
menuToggle.addEventListener('click', () => {
  const open = menuToggle.getAttribute('aria-expanded') !== 'true';
  header.classList.toggle('menu-open', open);
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  header.classList.remove('is-hidden');
});
header.querySelectorAll('a').forEach(link => link.addEventListener('click', () => closeMenu()));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && header.classList.contains('menu-open')) closeMenu(true);
});
document.addEventListener('click', event => {
  if (!header.contains(event.target)) closeMenu();
});
mobileMenu.addEventListener('change', () => closeMenu());
header.addEventListener('focusin', () => header.classList.remove('is-hidden'));
let previousScroll = Math.max(0, window.scrollY);
window.addEventListener('scroll', () => {
  const current = Math.max(0, window.scrollY);
  if (current <= header.offsetHeight || header.classList.contains('menu-open')) {
    header.classList.remove('is-hidden');
    previousScroll = current;
    return;
  }
  if (Math.abs(current - previousScroll) < 6) return;
  header.classList.toggle('is-hidden', current > previousScroll);
  previousScroll = current;
}, {passive: true});
