const IMAGES = [
  {src:'images/gestante/g01.jpg', alt:'Gestante - por do sol', cat:'gestante'},
  {src:'images/gestante/g02.jpg', alt:'Casal na praia', cat:'gestante'},
  {src:'images/gestante/g03.jpg', alt:'Gestante trilha', cat:'gestante'},
  {src:'images/gestante/g04.jpg', alt:'Gestante sorrindo trilha', cat:'gestante'},
  {src:'images/gestante/g05.jpg', alt:'Casal deitado na areia', cat:'gestante'},
  {src:'images/gestante/g06.jpg', alt:'Retrato close gestante', cat:'gestante'},
  {src:'images/gestante/g07.jpg', alt:'Casal frente ao mar', cat:'gestante'},
  {src:'images/gestante/g08.jpg', alt:'Silhueta PB estúdio', cat:'gestante'},
  {src:'images/gestante/g09.jpg', alt:'Casal testa com testa', cat:'gestante'},
  {src:'images/gestante/g10.jpg', alt:'Casal sorrindo - por do sol', cat:'gestante'},
  {src:'images/gestante/g11.jpg', alt:'sorrindo - por do sol', cat:'gestante'},
  {src:'images/revelacao/r01.jpg', alt:'Maos na massa PB', cat:'revelacao'},
  {src:'images/revelacao/r02.jpg', alt:'Casal vendando cabeça', cat:'revelacao'},
  {src:'images/revelacao/r03.jpg', alt:'Casal vendado rindo PB', cat:'revelacao'},
  {src:'images/revelacao/r04.jpg', alt:'Chuva de confetes rosa', cat:'revelacao'},
  {src:'images/revelacao/r05.jpg', alt:'Familia vibrando', cat:'revelacao'},
  {src:'images/revelacao/r06.jpg', alt:'Familia abraço', cat:'revelacao'},
  {src:'images/revelacao/r07.jpg', alt:'Familia rindo', cat:'revelacao'},
  {src:'images/revelacao/r08.jpg', alt:'Retrato casal sorrisos', cat:'revelacao'},
  {src:'images/revelacao/r09.jpg', alt:'Menino vendado PB', cat:'revelacao'},
  {src:'images/revelacao/r10.jpg', alt:'Casal ajustando vendas', cat:'revelacao'},
  {src:'images/revelacao/r11.jpg', alt:'Familia se abraçando', cat:'revelacao'},
  {src:'images/revelacao/r12.jpg', alt:'Casal tirando vendas', cat:'revelacao'},
  {src:'images/revelacao/r13.jpg', alt:'Casal vendas', cat:'revelacao'},
];

/* ===== Config responsiva =====
 * Quando você gerar variações, crie:
 *  - hero: 1920, 2560, 3840  (ex.: r04-1920.jpg, r04-2560.jpg, r04-3840.jpg)
 *  - grid:  640, 1024, 1600
 * Depois ligue HAS_VARIANTS = true
 */
const HAS_VARIANTS = true;
const GRID_SIZES = '(min-width:1280px) 25vw, (min-width:880px) 33vw, (min-width:640px) 50vw, 100vw';

// Controle de layout: usar proporção natural?
const USE_NATURAL_ASPECT = false; // false = linhas mais alinhadas (thumbs ~1.5)

// Mistura fixa entre gestante e revelação (não muda a cada load)
const _G = IMAGES.filter(i => i.cat === 'gestante');
const _R = IMAGES.filter(i => i.cat === 'revelacao');
const IMAGES_MIXED = (() => {
  const out = [];
  const max = Math.max(_G.length, _R.length);
  for (let i = 0; i < max; i++) {
    if (_G[i]) out.push(_G[i]);
    if (_R[i]) out.push(_R[i]);
  }
  return out;
})();

const $  = (s, ctx=document) => ctx.querySelector(s);
const $$ = (s, ctx=document) => Array.from(ctx.querySelectorAll(s));

// caminhos absolutos
const asset = (p) => p.startsWith('/') ? p : '/' + p;

// srcset/sizes com conjuntos diferentes para hero e grid
function buildResponsive(imgSrc, kind='grid', sizes = GRID_SIZES) {
  if (!HAS_VARIANTS) return { src: asset(imgSrc), srcset: '', sizes };
  const m = imgSrc.match(/^(.*?)(\.[a-zA-Z0-9]+)$/);
  if (!m) return { src: asset(imgSrc), srcset: '', sizes };
  const base = m[1], ext = m[2];
  const widths = kind === 'hero' ? [1920,2560,3840] : [640,1024,1600];
  const srcset = widths.map(w => `${asset(`${base}-${w}${ext}`)} ${w}w`).join(', ');
  return { src: asset(imgSrc), srcset, sizes };
}

// cria <img> (width/height opcionais)
function imgTag({src, alt, eager=false, kind='grid', sizes=GRID_SIZES, w=null, h=null}) {
  const r = buildResponsive(src, kind, sizes);
  const fp = eager ? 'high' : 'auto';
  const wh = (w && h) ? ` width="${w}" height="${h}"` : '';
  return `
    <img
      src="${r.src}"
      ${r.srcset ? `srcset="${r.srcset}"` : ''}
      ${r.sizes  ? `sizes="${r.sizes}"`   : ''}
      alt="${alt}"
      ${eager ? '' : 'loading="lazy"'}
      decoding="async"
      fetchpriority="${fp}"${wh} />`;
}

$('#year') && ($('#year').textContent = new Date().getFullYear());

// Header elev
const header = document.querySelector('[data-header]');
const onScroll = () => header?.setAttribute('data-elevated', window.scrollY > 10);
onScroll(); addEventListener('scroll', onScroll, {passive:true});

// ===== Menu mobile (.topbar e .topbarb) =====
const navToggle = document.querySelector('.nav-toggle, .nav-toggleb');
let overlay = document.querySelector('[data-overlay]');
const navList  = document.querySelector('.nav-list, .nav-listb');

// cria o overlay se não existir
if (!overlay) {
  overlay = document.createElement('div');
  overlay.className = 'nav-overlay';
  overlay.setAttribute('data-overlay','');
  overlay.hidden = true;
  document.body.appendChild(overlay);
}

function setMenu(open){
  const expanded = !!open;
  navToggle?.setAttribute('aria-expanded', expanded);
  overlay.hidden = !expanded;
  document.body.style.overflow = expanded ? 'hidden' : '';
  navList?.classList.toggle('is-open', expanded);
}

navToggle?.addEventListener('click', () => {
  const open = navToggle.getAttribute('aria-expanded') !== 'true';
  setMenu(open);
});

overlay?.addEventListener('click', () => setMenu(false));
document.addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });

// ===== HERO (home) =====
const slidesWrap = $('#slides');
if (slidesWrap){
  const left = $('.arrow-left');
  const right = $('.arrow-right');
  const currentEl = $('#heroCurrent');
  const totalEl = $('#heroTotal');
  const pad2 = n => String(n).padStart(2,'0');

  const HERO = (function(){
    const g = IMAGES.filter(i=>i.cat==='gestante').slice(0,5);
    const r = IMAGES.filter(i=>i.cat==='revelacao').slice(0,5);
    const mixed=[]; for (let i=0;i<5;i++){ if(g[i]) mixed.push(g[i]); if(r[i]) mixed.push(r[i]); }
    return mixed;
  })();

  // Preload do primeiro slide
  try {
    const first = HERO[0];
    if (first) {
      const r = buildResponsive(first.src, 'hero', '100vw');
      const link = document.createElement('link');
      link.rel='preload'; link.as='image'; link.href=r.src;
      if (r.srcset) link.setAttribute('imagesrcset', r.srcset);
      link.setAttribute('imagesizes','100vw');
      document.head.appendChild(link);
    }
  } catch(e){}

  slidesWrap.innerHTML = HERO.map((it,idx)=>`
    <article class="slide ${idx===0?'is-active':''}">
      <picture>
        ${imgTag({src: it.src, alt: it.alt, eager: idx===0, kind:'hero', sizes: '100vw'})}
      </picture>
    </article>`).join('');

  let index=0;
  const total=HERO.length;
  const slides=()=> $$('.slide', slidesWrap);
  totalEl && (totalEl.textContent = pad2(total));
  currentEl && (currentEl.textContent = pad2(1));

  // Pré-carrega sem bloquear (eager) com prioridade controlada
  function prime(i, priority='low'){
    const s = slides()[i];
    const img = s && s.querySelector('img');
    if (!img) return;
    img.loading = 'eager';
    img.fetchPriority = priority; // 'high' p/ os próximos, 'low' p/ os demais
    if (img.decode) img.decode().catch(()=>{});
  }

  // prime os 3 primeiros de cara (alta p/ 1º e 2º)
  prime(0, 'high'); prime(1, 'high'); prime(2, 'low');
  // e o resto em baixa prioridade
  for (let i=3;i<total;i++) prime(i, 'low');

  function show(i){
    const next = (i+total)%total;
    slides()[index].classList.remove('is-active');
    index = next;
    slides()[index].classList.add('is-active');
    currentEl && (currentEl.textContent = pad2(index+1));
    // sempre prepara o seguinte
    prime((index+1)%total, 'high');
  }

  left?.addEventListener('click', ()=> { show(index-1); reset(); });
  right?.addEventListener('click', ()=> { show(index+1); reset(); });
  document.addEventListener('keydown', (e)=>{ 
    if(e.key==='ArrowLeft'){ show(index-1); reset(); }
    if(e.key==='ArrowRight'){ show(index+1); reset(); }
    if(e.key==='Escape') setMenu(false);
  });

  // ===== Autoplay exatamente a cada 5s =====
  let timer=null, paused=false;
  const T = 5000;
  const tick = ()=> { show(index+1); schedule(); };
  const schedule = ()=> { timer = setTimeout(tick, T); };
  const start = ()=> { if (!timer && !paused) schedule(); };
  const stop  = ()=> { if (timer){ clearTimeout(timer); timer=null; } };
  const reset = ()=> { stop(); start(); };

  start();

  const hero = document.querySelector('.hero-carousel');
  hero?.addEventListener('pointerenter', ()=>{ paused=true; stop(); }, {passive:true});
  hero?.addEventListener('pointerleave', ()=>{ paused=false; start(); }, {passive:true});
  document.addEventListener('visibilitychange', ()=>{ document.hidden ? (paused=true, stop()) : (paused=false, start()); });

  // swipe
  let x0=null;
  slidesWrap.addEventListener('touchstart', e=> x0 = e.touches[0].clientX, {passive:true});
  slidesWrap.addEventListener('touchend', e=>{
    if(x0===null) return;
    const dx = e.changedTouches[0].clientX - x0; x0=null;
    if(Math.abs(dx)>40){ dx>0?show(index-1):show(index+1); reset(); }
  });
}

// ===== PORTFÓLIO =====  (layout justificado)
const grid = $('#portfolioGrid');
const controls = $('.portfolio-controls');

if (grid) {
  // altura desejada por breakpoint
  const targetHeight = () =>
    window.innerWidth >= 1280 ? 320 :
    window.innerWidth >= 880  ? 260 :
    window.innerWidth >= 560  ? 220 : 180;

  const gap = 16; // igual ao CSS (.jg-row gap)

  function flushRow(row, rowAspectSum, isLast) {
    if (!row.length) return;

    const containerWidth = grid.clientWidth;
    const totalGaps = gap * (row.length - 1);
    const rawWidth = rowAspectSum * targetHeight();
    let scale = (containerWidth - totalGaps) / rawWidth;
    if (isLast) scale = Math.min(scale, 1); // última linha não estica demais

    const h = Math.round(targetHeight() * scale);

    const rowEl = document.createElement('div');
    rowEl.className = 'jg-row';

    row.forEach(it => {
      const w = Math.round(h * it.aspect);
      const fig = document.createElement('figure');
      fig.className = 'portfolio-card';
      fig.style.flex = `0 0 ${w}px`;
      fig.style.height = `${h}px`;
      fig.innerHTML = `
        <picture>
          ${imgTag({
            src: it.src,
            alt: it.alt,
            eager: false,
            kind: 'grid',
            sizes: `(min-width:1280px) ${w}px, (min-width:880px) ${w}px, 100vw`
          })}
        </picture>`;
      rowEl.appendChild(fig);
    });

    grid.appendChild(rowEl);
  }

  function renderJustified(list) {
  grid.innerHTML = '';
  const items = list.map(it => ({ ...it, aspect: 1.5 }));

  function layout() {
    let row = [], sum = 0;
    items.forEach(it => {
      row.push(it); sum += it.aspect;
      const expected = sum * targetHeight() + gap * (row.length - 1);
      if (expected >= grid.clientWidth) {
        flushRow(row, sum, false);
        row = []; sum = 0;
      }
    });
    if (row.length) flushRow(row, sum, true); // última linha
  }

  if (USE_NATURAL_ASPECT) {
    const loaders = items.map((it, idx) => new Promise(resolve => {
      const img = new Image();
      img.src = asset(it.src);
      img.onload = () => { items[idx].aspect = (img.naturalWidth||3)/(img.naturalHeight||2); resolve(); };
      img.onerror = () => resolve();
    }));
    Promise.all(loaders).then(layout);
  } else {
    layout(); // usa aspecto fixo p/ alinhar mais
  }
}


const render = (filter='all') => {
  const list = (filter === 'all') ? IMAGES_MIXED : IMAGES.filter(i => i.cat === filter);
  grid.dataset.filter = filter;
  renderJustified(list);
};

  render(grid.dataset.filter || 'all');

  // filtros
  if (controls) {
    controls.addEventListener('click', (e) => {
      const btn = e.target.closest('button[data-filter]');
      if (!btn) return;
      controls.querySelectorAll('button.pill').forEach(b => {
        const active = b === btn;
        b.classList.toggle('is-active', active);
        b.setAttribute('aria-selected', active ? 'true' : 'false');
        b.setAttribute('tabindex', active ? '0' : '-1');
      });
      render(btn.dataset.filter || 'all');
    });
    controls.addEventListener('keydown', (e) => {
      if (e.key!=='Enter' && e.key!==' ') return;
      const btn = e.target.closest('button[data-filter]');
      if (!btn) return;
      e.preventDefault(); btn.click();
    });
  }

  // reflow no resize
  let rId;
  addEventListener('resize', () => {
    clearTimeout(rId);
    rId = setTimeout(() => render(grid.dataset.filter || 'all'), 150);
  }, {passive:true});
}

/* Reveal on view */
const io = new IntersectionObserver((entries)=>{ 
  entries.forEach(en=> en.isIntersecting && en.target.classList.add('is-visible')); 
}, {threshold:.12});
$$('[data-reveal]').forEach(el=> io.observe(el));

/* UX */
const heroPag = document.querySelector('.hero-pagination');
if(heroPag){ heroPag.style.userSelect='none'; heroPag.style.webkitUserSelect='none'; }

/* Dropdown */
document.querySelectorAll('.dropdown').forEach(dd => {
  const btn = dd.querySelector('.dropdown-toggle');
  const menu = dd.querySelector('.dropdown-menu');
  function openMenu(){ dd.classList.add('open'); }
  function closeMenu(){ dd.classList.remove('open'); }
  if (window.matchMedia("(min-width:1025px)").matches) {
    btn?.addEventListener('mouseenter', openMenu);
    menu?.addEventListener('mouseenter', openMenu);
    btn?.addEventListener('mouseleave', ()=> setTimeout(()=>{ if(!menu.matches(':hover') && !btn.matches(':hover')) closeMenu();},100));
    menu?.addEventListener('mouseleave', ()=> setTimeout(()=>{ if(!menu.matches(':hover') && !btn.matches(':hover')) closeMenu();},100));
  } else {
    btn?.addEventListener('click', e => { e.preventDefault(); dd.classList.toggle('open'); btn.setAttribute('aria-expanded', dd.classList.contains('open')); });
  }
});

// UTM nos CTAs de WhatsApp (ícone da seção + flutuante)
['whatsappCta','fabWhats'].forEach(id=>{
  const a = document.getElementById(id);
  if(!a) return;
  try{
    const u = new URL(a.href);
    u.searchParams.set('utm_source','site');
    u.searchParams.set('utm_medium', id === 'fabWhats' ? 'float' : 'contact');
    u.searchParams.set('utm_campaign','whatsapp');
    a.href = u.toString();
  }catch(e){}
});

// VOLTAR AO TOPO — use apenas este bloco
const toTop = document.getElementById('toTop');

if (toTop) {
  toTop.removeAttribute('hidden'); // <- add isto
  const SHOW_AFTER = 300; // px (ajuste se quiser)

  function updateToTop() {
    if (window.scrollY > SHOW_AFTER) {
      toTop.classList.add('is-visible');
    } else {
      toTop.classList.remove('is-visible');
    }
  }

  window.addEventListener('scroll', updateToTop, { passive: true });
  updateToTop(); // estado inicial

  toTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// Pacotes — “Mais detalhes” só p/ .more-block
(function(){
  document.querySelectorAll('.pricing .pricing-row').forEach(row=>{
    const more = row.querySelector('.more-block');
    if (!more) return; // sem bloco extra, sem botão

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'toggle-more';
    btn.setAttribute('aria-expanded','false');
    btn.textContent = 'Mais detalhes';

    const anchor = row.querySelector('.pricing-cta') || more;
    anchor.parentNode.insertBefore(btn, anchor);

    btn.addEventListener('click', ()=>{
      row.classList.toggle('is-open');
      const open = row.classList.contains('is-open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      btn.textContent = open ? 'Menos detalhes' : 'Mais detalhes';
    });
  });
})();


// site.js (no final)
const form = document.getElementById('contactForm');
const note = document.getElementById('formNote');

if (form && note){
  form.addEventListener('submit', async (e)=>{
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true; note.textContent = 'Enviando...';

    try{
      const res  = await fetch(form.action, { method:'POST', body:new FormData(form) });
      const data = await res.json().catch(()=> ({}));
      if(res.ok && data?.ok !== false){
        note.textContent = data?.message || 'Mensagem enviada! Responderemos em breve.';
        form.reset();
      }else{
        throw new Error(data?.message || 'Não foi possível enviar agora. Tente novamente.');
      }
    }catch(err){
      note.textContent = err.message;
    }finally{
      btn.disabled = false;
    }
  });
}

if (note) {
  const p = new URLSearchParams(location.search);
  if (p.has('sent'))  note.textContent = 'Mensagem enviada! Responderemos em breve.';
  if (p.has('error')) note.textContent = 'Não foi possível enviar agora. Tente novamente.';
  // limpa a query da URL
  if (p.has('sent') || p.has('error')) {
    history.replaceState({}, '', location.pathname + location.hash);
  }
}
