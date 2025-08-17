/* =============================================================
   scripts.js — CLEANED (sem duplicatas, só o que é usado)
   Compatível com o HTML e o CSS atuais
   ============================================================= */

/* ====== Dados do Portfólio ====== */
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

/* ====== Config responsiva ====== */
const HAS_VARIANTS = true; // usa -640/-1024/-1600 (grid) e -1920/-2560/-3840 (hero)
const GRID_SIZES = '(min-width:1280px) 25vw, (min-width:880px) 33vw, (min-width:640px) 50vw, 100vw';
const USE_NATURAL_ASPECT = false; // false → linhas mais retinhas

/* ====== Utils ====== */
const $  = (s, ctx=document) => ctx.querySelector(s);
const $$ = (s, ctx=document) => Array.from(ctx.querySelectorAll(s));
const asset = (p) => p.startsWith('/') ? p : '/' + p; // por quê: garante src absoluto p/ srcset

function buildResponsive(imgSrc, kind='grid', sizes = GRID_SIZES) {
  if (!HAS_VARIANTS) return { src: asset(imgSrc), srcset: '', sizes };
  const m = imgSrc.match(/^(.*?)(\.[a-zA-Z0-9]+)$/);
  if (!m) return { src: asset(imgSrc), srcset: '', sizes };
  const base = m[1], ext = m[2];
  const widths = kind === 'hero' ? [1920,2560,3840] : [640,1024,1600];
  const srcset = widths.map(w => `${asset(`${base}-${w}${ext}`)} ${w}w`).join(', ');
  return { src: asset(imgSrc), srcset, sizes };
}

function imgTag({src, alt, eager=false, kind='grid', sizes=GRID_SIZES, w=null, h=null}) {
  const r = buildResponsive(src, kind, sizes);
  const fp = eager ? 'high' : 'auto';
  const wh = (w && h) ? ` width="${w}" height="${h}"` : '';
  return `\n    <img\n      src="${r.src}"\n      ${r.srcset ? `srcset="${r.srcset}"` : ''}\n      ${r.sizes  ? `sizes="${r.sizes}"`   : ''}\n      alt="${alt}"\n      ${eager ? '' : 'loading="lazy"'}\n      decoding="async"\n      fetchpriority="${fp}"${wh} />`;
}

/* ====== Ano no rodapé ====== */
const y = $('#year'); if (y) y.textContent = new Date().getFullYear();

/* ====== Header elevado ====== */
const header = document.querySelector('[data-header]');
const setElevated = () => header?.setAttribute('data-elevated', window.scrollY > 10);
setElevated(); addEventListener('scroll', setElevated, { passive:true });

/* =============================================================
   MENU (off-canvas) + SUBMENUS (.dropdown e .has-submenu)
   ============================================================= */
(function menuAndSubmenus(){
  const navToggle = document.querySelector('.nav-toggle') || document.querySelector('.nav-toggleb');
  const navList   = document.querySelector('.nav-list')   || document.querySelector('.nav-listb');
  let overlay = document.querySelector('[data-overlay]');

  if (!overlay) { // garante overlay
    overlay = document.createElement('div');
    overlay.className = 'nav-overlay';
    overlay.setAttribute('data-overlay','');
    overlay.hidden = true;
    document.body.appendChild(overlay);
  }

  const closeAllDropdowns = (root=document) => {
    // fecha ambos padrões
    root.querySelectorAll('.dropdown.open').forEach(dd => {
      dd.classList.remove('open');
      dd.querySelector('.dropdown-toggle')?.setAttribute('aria-expanded','false');
    });
    root.querySelectorAll('.has-submenu.open').forEach(li => {
      li.classList.remove('open');
      li.querySelector(':scope > a')?.setAttribute('aria-expanded','false');
    });
  };

  function setMenu(open){
    const expanded = !!open;
    navToggle?.setAttribute('aria-expanded', String(expanded));
    navList?.classList.toggle('is-open', expanded);
    overlay.hidden = !expanded;
    document.body.style.overflow = expanded ? 'hidden' : '';
    if (!expanded) closeAllDropdowns(navList || document);
  }

  navToggle?.addEventListener('click', () => setMenu(navToggle.getAttribute('aria-expanded') !== 'true'));
  overlay?.addEventListener('click', () => setMenu(false));
  document.addEventListener('keydown', (e)=>{ if (e.key === 'Escape') setMenu(false); });

  // fecha o menu ao clicar em qualquer link do drawer
  (navList ? $$('a', navList) : []).forEach(a => a.addEventListener('click', () => setMenu(false), { capture:true }));

  // ========= .dropdown (HTML atual da Home) =========
  (function initDropdown(){
    const isDesktop = window.matchMedia('(hover:hover) and (pointer:fine)');
    function wire(){
      document.querySelectorAll('.dropdown').forEach(dd => {
        const btn  = dd.querySelector('.dropdown-toggle');
        const menu = dd.querySelector('.dropdown-menu');
        if (!btn || !menu) return;

        // remove listeners duplicados
        btn.replaceWith(btn.cloneNode(true));
        const b = dd.querySelector('.dropdown-toggle');

        if (isDesktop.matches){
          let t; dd.addEventListener('mouseenter', ()=>{ clearTimeout(t); dd.classList.add('open'); b.setAttribute('aria-expanded','true'); });
          dd.addEventListener('mouseleave', ()=>{ t = setTimeout(()=>{ dd.classList.remove('open'); b.setAttribute('aria-expanded','false'); },120); });
        } else {
          b.addEventListener('click', (e)=>{
            e.preventDefault();
            const willOpen = !dd.classList.contains('open');
            // fecha irmãos
            dd.parentElement?.querySelectorAll('.dropdown.open').forEach(s => { if (s!==dd){ s.classList.remove('open'); s.querySelector('.dropdown-toggle')?.setAttribute('aria-expanded','false'); } });
            dd.classList.toggle('open', willOpen);
            b.setAttribute('aria-expanded', String(willOpen));
          });
        }
      });
    }
    wire();
    isDesktop.addEventListener('change', wire);
  })();

  // ========= .has-submenu (se usar nas internas) =========
  (function initHasSubmenu(){
    const mqMobile = window.matchMedia('(max-width:1024px)');
    const isDesktopPointer = window.matchMedia('(hover:hover) and (pointer:fine)').matches;

    if (isDesktopPointer){
      document.querySelectorAll('.has-submenu').forEach(li => {
        let t; li.addEventListener('mouseenter', ()=>{ clearTimeout(t); li.classList.add('open'); });
        li.addEventListener('mouseleave', ()=>{ t = setTimeout(()=>li.classList.remove('open'), 120); });
      });
    }

    const TAP = window.PointerEvent ? 'pointerdown' : 'click';
    document.querySelectorAll('.has-submenu > a').forEach(a => {
      a.addEventListener('click', e => { if (mqMobile.matches) e.preventDefault(); }, true);
      a.addEventListener(TAP, e => {
        if (!mqMobile.matches) return;
        e.preventDefault(); e.stopPropagation();
        const li = a.parentElement; const willOpen = !li.classList.contains('open');
        li.parentElement?.querySelectorAll('.has-submenu.open').forEach(s => { if (s!==li){ s.classList.remove('open'); s.querySelector(':scope > a')?.setAttribute('aria-expanded','false'); } });
        li.classList.toggle('open', willOpen);
        a.setAttribute('aria-expanded', String(willOpen));
      }, { passive:false });
    });

    // tocar fora fecha submenus (só com drawer aberto)
    document.addEventListener(TAP, ev => {
      if (!mqMobile.matches) return;
      const drawer = document.querySelector('.nav-list.is-open, .nav-listb.is-open');
      if (!drawer) return; if (ev.target.closest('.has-submenu')) return;
      drawer.querySelectorAll('.has-submenu.open').forEach(li => {
        li.classList.remove('open');
        li.querySelector(':scope > a')?.setAttribute('aria-expanded','false');
      });
    }, true);
  })();

  // fechar dropdowns ao tocar fora (padrão .dropdown)
  document.addEventListener('click', ev => {
    if (window.matchMedia('(min-width:1025px)').matches) return;
    const drawer = document.querySelector('.nav-list.is-open, .nav-listb.is-open');
    if (!drawer) return; if (ev.target.closest('.dropdown')) return;
    drawer.querySelectorAll('.dropdown.open').forEach(li => {
      li.classList.remove('open');
      li.querySelector('.dropdown-toggle')?.setAttribute('aria-expanded','false');
    });
  }, true);
})();

/* =============================================================
   HERO (carrossel)
   ============================================================= */
(function hero(){
  const wrap = $('#slides');
  if (!wrap) return;
  const left = $('.arrow-left');
  const right = $('.arrow-right');
  const currentEl = $('#heroCurrent');
  const totalEl = $('#heroTotal');
  const pad2 = n => String(n).padStart(2,'0');

  const g = IMAGES.filter(i=>i.cat==='gestante').slice(0,5);
  const r = IMAGES.filter(i=>i.cat==='revelacao').slice(0,5);
  const HERO = []; for (let i=0;i<5;i++){ if(g[i]) HERO.push(g[i]); if(r[i]) HERO.push(r[i]); }

  // Preload do primeiro
  try{
    const first = HERO[0]; if (first){
      const r = buildResponsive(first.src,'hero','100vw');
      const link = document.createElement('link');
      link.rel='preload'; link.as='image'; link.href=r.src;
      if (r.srcset) link.setAttribute('imagesrcset', r.srcset);
      link.setAttribute('imagesizes','100vw'); document.head.appendChild(link);
    }
  }catch(_){ }

  wrap.innerHTML = HERO.map((it,idx)=>`<article class="slide ${idx===0?'is-active':''}"><picture>${imgTag({src:it.src,alt:it.alt,eager:idx===0,kind:'hero',sizes:'100vw'})}</picture></article>`).join('');

  let index=0; const total=HERO.length; const slides=()=> $$('.slide', wrap);
  if (totalEl) totalEl.textContent = pad2(total); if (currentEl) currentEl.textContent = pad2(1);

  function prime(i, priority='low'){
    const s = slides()[i]; const img = s && s.querySelector('img'); if (!img) return;
    img.loading='eager'; img.fetchPriority=priority; if (img.decode) img.decode().catch(()=>{});
  }
  prime(0,'high'); prime(1,'high'); prime(2,'low'); for (let i=3;i<total;i++) prime(i,'low');

  function show(i){
    const next=(i+total)%total; slides()[index].classList.remove('is-active'); index=next; slides()[index].classList.add('is-active');
    if (currentEl) currentEl.textContent = pad2(index+1); prime((index+1)%total,'high');
  }

  const reset=()=>{ stop(); start(); };
  left?.addEventListener('click', ()=>{ show(index-1); reset(); });
  right?.addEventListener('click',()=>{ show(index+1); reset(); });
  document.addEventListener('keydown', (e)=>{ if(e.key==='ArrowLeft'){show(index-1);reset();} if(e.key==='ArrowRight'){show(index+1);reset();} if(e.key==='Escape') setMenu?.(false); });

  let timer=null, paused=false; const T=5000;
  const tick=()=>{ show(index+1); schedule(); };
  const schedule=()=>{ timer=setTimeout(tick,T); };
  const start=()=>{ if(!timer && !paused) schedule(); };
  const stop =()=>{ if(timer){ clearTimeout(timer); timer=null; } };
  start();

  const heroEl = document.querySelector('.hero-carousel');
  heroEl?.addEventListener('pointerenter', ()=>{ paused=true; stop(); }, {passive:true});
  heroEl?.addEventListener('pointerleave', ()=>{ paused=false; start(); }, {passive:true});
  document.addEventListener('visibilitychange', ()=>{ document.hidden ? (paused=true, stop()) : (paused=false, start()); });

  // swipe
  let x0=null; wrap.addEventListener('touchstart', e=> x0=e.touches[0].clientX, {passive:true});
  wrap.addEventListener('touchend', e=>{ if(x0===null) return; const dx=e.changedTouches[0].clientX - x0; x0=null; if(Math.abs(dx)>40){ dx>0?show(index-1):show(index+1); reset(); } });
})();

/* =============================================================
   PORTFÓLIO – layout justificado + filtros
   ============================================================= */
(function portfolio(){
  const grid = $('#portfolioGrid'); if (!grid) return;
  const controls = $('.portfolio-controls');

  const _G = IMAGES.filter(i => i.cat === 'gestante');
  const _R = IMAGES.filter(i => i.cat === 'revelacao');
  const IMAGES_MIXED = (()=>{ const out=[], max=Math.max(_G.length,_R.length); for(let i=0;i<max;i++){ if(_G[i]) out.push(_G[i]); if(_R[i]) out.push(_R[i]); } return out; })();

  const targetHeight = () => window.innerWidth >= 1280 ? 320 : window.innerWidth >= 880 ? 260 : window.innerWidth >= 560 ? 220 : 180;
  const gap = 16;

  function flushRow(row, rowAspectSum, isLast){
    if (!row.length) return;
    const containerWidth = grid.clientWidth; const totalGaps = gap * (row.length - 1);
    const rawWidth = rowAspectSum * targetHeight();
    let scale = (containerWidth - totalGaps) / rawWidth; if (isLast) scale = Math.min(scale, 1);
    const h = Math.round(targetHeight() * scale);

    const rowEl = document.createElement('div'); rowEl.className = 'jg-row';
    row.forEach(it => {
      const w = Math.round(h * it.aspect);
      const fig = document.createElement('figure'); fig.className='portfolio-card';
      fig.style.flex = `0 0 ${w}px`; fig.style.height = `${h}px`;
      fig.innerHTML = `<picture>${imgTag({ src:it.src, alt:it.alt, eager:false, kind:'grid', sizes:`(min-width:1280px) ${w}px, (min-width:880px) ${w}px, 100vw` })}</picture>`;
      rowEl.appendChild(fig);
    });
    grid.appendChild(rowEl);
  }

  function renderJustified(list){
    grid.innerHTML=''; const items=list.map(it=>({...it, aspect:1.5}));
    const layout=()=>{ let row=[], sum=0; items.forEach(it=>{ row.push(it); sum+=it.aspect; const expected = sum*targetHeight() + gap*(row.length-1); if (expected >= grid.clientWidth){ flushRow(row, sum, false); row=[]; sum=0; } }); if (row.length) flushRow(row, sum, true); };
    if (USE_NATURAL_ASPECT){
      const loaders = items.map((it, idx) => new Promise(res=>{ const img=new Image(); img.src=asset(it.src); img.onload=()=>{ items[idx].aspect=(img.naturalWidth||3)/(img.naturalHeight||2); res(); }; img.onerror=()=>res(); }));
      Promise.all(loaders).then(layout);
    } else { layout(); }
  }

  const render = (filter='all') => { const list = filter==='all' ? IMAGES_MIXED : IMAGES.filter(i=>i.cat===filter); grid.dataset.filter=filter; renderJustified(list); };
  render(grid.dataset.filter||'all');

  if (controls){
    controls.addEventListener('click', e=>{ const btn=e.target.closest('button[data-filter]'); if(!btn) return; controls.querySelectorAll('button.pill').forEach(b=>{ const active=b===btn; b.classList.toggle('is-active',active); b.setAttribute('aria-selected', active?'true':'false'); b.setAttribute('tabindex', active?'0':'-1'); }); render(btn.dataset.filter||'all'); });
    controls.addEventListener('keydown', e=>{ if(e.key!=='Enter' && e.key!==' ') return; const btn=e.target.closest('button[data-filter]'); if(!btn) return; e.preventDefault(); btn.click(); });
  }

  let rId; addEventListener('resize', ()=>{ clearTimeout(rId); rId=setTimeout(()=>render(grid.dataset.filter||'all'),150); }, {passive:true});
})();

/* =============================================================
   Reveal on view
   ============================================================= */
(() => {
  const io = new IntersectionObserver((entries)=>{ entries.forEach(en=> en.isIntersecting && en.target.classList.add('is-visible')); }, {threshold:.12});
  $$('[data-reveal]').forEach(el=> io.observe(el));
})();

/* =============================================================
   UTM nos CTAs (WhatsApp)
   ============================================================= */
(() => {
  ['whatsappCta','fabWhats'].forEach(id=>{ const a=document.getElementById(id); if(!a) return; try{ const u = new URL(a.href); u.searchParams.set('utm_source','site'); u.searchParams.set('utm_medium', id==='fabWhats' ? 'float' : 'contact'); u.searchParams.set('utm_campaign','whatsapp'); a.href = u.toString(); }catch(_){} });
})();

/* =============================================================
   Voltar ao topo
   ============================================================= */
(() => {
  const toTop = document.getElementById('toTop'); if (!toTop) return;
  toTop.removeAttribute('hidden');
  const SHOW_AFTER = 300;
  const update = ()=>{ window.scrollY > SHOW_AFTER ? toTop.classList.add('is-visible') : toTop.classList.remove('is-visible'); };
  addEventListener('scroll', update, { passive:true }); update();
  toTop.addEventListener('click', ()=> window.scrollTo({ top:0, behavior:'smooth' }));
})();

/* =============================================================
   Pacotes — botão "Mais detalhes" (só se houver .more-block)
   ============================================================= */
(() => {
  document.querySelectorAll('.pricing .pricing-row').forEach(row=>{
    const more = row.querySelector('.more-block'); if (!more) return;
    const btn = document.createElement('button'); btn.type='button'; btn.className='toggle-more'; btn.setAttribute('aria-expanded','false'); btn.textContent='Mais detalhes';
    const anchor = row.querySelector('.pricing-cta') || more; anchor.parentNode.insertBefore(btn, anchor);
    btn.addEventListener('click', ()=>{ row.classList.toggle('is-open'); const open=row.classList.contains('is-open'); btn.setAttribute('aria-expanded', open?'true':'false'); btn.textContent = open ? 'Menos detalhes' : 'Mais detalhes'; });
  });
})();

/* =============================================================
   Seguir a página (highlight do item atual)
   ============================================================= */
(() => {
  const ALL = () => Array.from(document.querySelectorAll('.nav-list a, .nav-listb a, .dropdown-menu a, .submenu a'));
  const clear = () => ALL().forEach(a => a.removeAttribute('aria-current'));
  const set = (matcher) => ALL().filter(matcher).forEach(a => a.setAttribute('aria-current','page'));

  function sync(){
    const path = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
    const hash = (location.hash || '#home').toLowerCase();
    clear();
    if (path === '' || path === 'index.html'){
      set(a => (a.getAttribute('href')||'').toLowerCase() === ('index.html'+hash));
    } else if (path === 'gestante.html' || path === 'revelacao.html'){
      set(a => (a.getAttribute('href')||'').toLowerCase().endsWith(path));
    } else if (path === 'pacotes.html'){
      set(a => { const href=(a.getAttribute('href')||'').toLowerCase(); if(!href.startsWith('pacotes.html')) return false; return location.hash ? href === ('pacotes.html'+hash) : true; });
    }
  }
  sync(); addEventListener('hashchange', sync);

  // Scrollspy na Home
  const isHome = /(?:^|\/)index\.html?$/.test(location.pathname) || location.pathname === '/';
  if (isHome){
    const ids=['home','sobre','portfolio','contato']; const sections=ids.map(id=>document.getElementById(id)).filter(Boolean);
    const io = new IntersectionObserver(ents=>{ const v=ents.filter(e=>e.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0]; if(!v) return; clear(); const id='#'+v.target.id; document.querySelectorAll(`.nav-link[href="index.html${id}"], .nav-linkb[href="index.html${id}"]`).forEach(a=>a.setAttribute('aria-current','page')); }, { rootMargin:'-45% 0px -50% 0px', threshold:[0,.25,.5,.75,1] });
    sections.forEach(s=>io.observe(s));
  }
})();

