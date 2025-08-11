/* =========================
 *  Config & Data
 * ========================= */
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
];

// Se você tiver variantes g01-640.jpg, g01-1024.jpg, g01-1600.jpg etc., ligue isto:
const HAS_VARIANTS = true;

// tamanhos do layout (combine com seu CSS)
const GRID_SIZES = '(min-width:1280px) 25vw, (min-width:880px) 33vw, (min-width:640px) 50vw, 100vw';

/* =========================
 *  Helpers
 * ========================= */
const $  = (s, ctx=document) => ctx.querySelector(s);
const $$ = (s, ctx=document) => Array.from(ctx.querySelectorAll(s));
$('#year') && ($('#year').textContent = new Date().getFullYear());

/** Retorna {src, srcset, sizes} com base no caminho original e no HAS_VARIANTS */
function buildResponsive(imgSrc, sizes = GRID_SIZES) {
  if (!HAS_VARIANTS) return { src: imgSrc, srcset: '', sizes: '' };

  // g01.jpg -> g01-640.jpg, g01-1024.jpg, g01-1600.jpg
  const m = imgSrc.match(/^(.*?)(\.[a-zA-Z0-9]+)$/);
  if (!m) return { src: imgSrc, srcset: '', sizes: '' };
  const base = m[1], ext = m[2];
  const s640 = `${base}-640${ext}`;
  const s1024 = `${base}-1024${ext}`;
  const s1600 = `${base}-1600${ext}`;
  const srcset = `${s640} 640w, ${s1024} 1024w, ${s1600} 1600w, ${imgSrc} 2000w`;
  return { src: imgSrc, srcset, sizes };
}

/** Cria uma tag IMG pronta (com decoding, loading, fetchpriority e width/height opcionais) */
function imgTag({src, alt, eager=false, sizes=GRID_SIZES, w=1600, h=1067}) {
  const r = buildResponsive(src, sizes);
  const fp = eager ? 'high' : 'auto';
  return `
    <img
      src="${r.src}"
      ${r.srcset ? `srcset="${r.srcset}"` : ''}
      ${r.sizes  ? `sizes="${r.sizes}"`   : ''}
      alt="${alt}"
      ${eager ? '' : 'loading="lazy"'}
      decoding="async"
      fetchpriority="${fp}"
      width="${w}" height="${h}" />`;
}

/* =========================
 *  Header – estado no scroll
 * ========================= */
const header = document.querySelector('[data-header]');
const onScroll = () => header?.setAttribute('data-elevated', window.scrollY > 10);
onScroll();
addEventListener('scroll', onScroll, { passive: true });

/* =========================
 *  Menu mobile
 * ========================= */
const navToggle = $('.nav-toggle');
const overlay = document.querySelector('[data-overlay]');
const navList = $('.nav-list');

function setMenu(open){
  const expanded = !!open;
  navToggle?.setAttribute('aria-expanded', expanded);
  if (overlay) overlay.hidden = !expanded;
  document.body.style.overflow = expanded ? 'hidden' : '';
  navList?.classList.toggle('is-open', expanded);
}
navToggle?.addEventListener('click', () => setMenu(navToggle.getAttribute('aria-expanded') !== 'true'));
overlay?.addEventListener('click', () => setMenu(false));

/* =========================
 *  HERO – carrossel
 * ========================= */
const slidesWrap = $('#slides');
if (slidesWrap) {
  const left = $('.arrow-left');
  const right = $('.arrow-right');
  const currentEl = $('#heroCurrent');
  const totalEl = $('#heroTotal');
  const pad2 = n => String(n).padStart(2,'0');

  function pickHeroImages() {
    const g = IMAGES.filter(i=>i.cat==='gestante').slice(0,5);
    const r = IMAGES.filter(i=>i.cat==='revelacao').slice(0,5);
    const mixed=[]; 
    for (let i=0;i<5;i++) { if (g[i]) mixed.push(g[i]); if (r[i]) mixed.push(r[i]); }
    return mixed;
  }

  const HERO = pickHeroImages();
  slidesWrap.innerHTML = HERO.map((it,idx)=>`
    <article class="slide ${idx===0?'is-active':''}">
      <picture>
        ${imgTag({src: it.src, alt: it.alt, eager: idx===0, sizes: '(min-width:1024px) 80vw, 100vw', w: 1920, h: 1080})}
      </picture>
    </article>
  `).join('');

  let index=0;
  const total=HERO.length;
  const slides=()=> $$('.slide', slidesWrap);
  totalEl && (totalEl.textContent = pad2(total));
  currentEl && (currentEl.textContent = pad2(1));

  function show(i){
    const list = slides();
    list[index].classList.remove('is-active');
    index = (i+total)%total;
    list[index].classList.add('is-active');
    currentEl && (currentEl.textContent = pad2(index+1));
  }

  left?.addEventListener('click', ()=> show(index-1));
  right?.addEventListener('click', ()=> show(index+1));

  document.addEventListener('keydown', (e)=>{ 
    if (e.key==='ArrowLeft') show(index-1);
    if (e.key==='ArrowRight') show(index+1);
    if (e.key==='Escape') setMenu(false);
  });

  // auto-play com pausa ao passar o mouse e quando a aba perde foco
  let auto = setInterval(()=> show(index+1), 5500);
  const pause = ()=> { clearInterval(auto); auto = null; };
  const resume = ()=> { if (!auto) auto = setInterval(()=> show(index+1), 5500); };
  $('.hero-carousel')?.addEventListener('mouseenter', pause);
  $('.hero-carousel')?.addEventListener('mouseleave', resume);
  document.addEventListener('visibilitychange', ()=> document.hidden ? pause() : resume());

  // swipe
  let x0=null;
  slidesWrap.addEventListener('touchstart', e=> x0 = e.touches[0].clientX, {passive:true});
  slidesWrap.addEventListener('touchend', e=>{
    if (x0===null) return;
    const dx = e.changedTouches[0].clientX - x0;
    x0=null;
    if (Math.abs(dx)>40){ dx>0?show(index-1):show(index+1);}
  });
}

/* =========================
 *  Portfólio – render + filtro
 * ========================= */
const grid = $('#portfolioGrid');
const controls = $('.portfolio-controls');

if (grid) {
  // Render dos cards
  const render = (filter = 'all') => {
    const list = IMAGES.filter(i => filter === 'all' ? true : i.cat === filter);
    grid.dataset.filter = filter;

    grid.innerHTML = list.map(i => `
      <figure class="portfolio-card">
        <picture>
          ${imgTag({ src: i.src, alt: i.alt, eager: false })}
        </picture>
      </figure>
    `).join('');
  };

  // inicial (respeita data-filter do HTML)
  render(grid.dataset.filter || 'all');

  // delegação de clique nas pílulas
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

    // teclado (Enter/Espaço)
    controls.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      const btn = e.target.closest('button[data-filter]');
      if (!btn) return;
      e.preventDefault();
      btn.click();
    });
  }
}

/* =========================
 *  Reveal – animações de entrada
 * ========================= */
const io = new IntersectionObserver((entries)=>{
  entries.forEach(en => en.isIntersecting && en.target.classList.add('is-visible'));
}, { threshold:.12 });
$$('[data-reveal]').forEach(el=> io.observe(el));

/* =========================
 *  Qualidade/perf extra
 * ========================= */
// Evita seleção nos números do heropager
const heroPag = document.querySelector('.hero-pagination');
if (heroPag) {
  heroPag.style.userSelect='none';
  heroPag.style.webkitUserSelect='none';
}

// Dropdown (hover desktop, click mobile)
document.querySelectorAll('.dropdown').forEach(dd => {
  const btn = dd.querySelector('.dropdown-toggle');
  const menu = dd.querySelector('.dropdown-menu');

  function openMenu() { dd.classList.add('open'); }
  function closeMenu() { dd.classList.remove('open'); }

  if (window.matchMedia("(min-width: 1025px)").matches) {
    btn?.addEventListener('mouseenter', openMenu);
    menu?.addEventListener('mouseenter', openMenu);
    btn?.addEventListener('mouseleave', () => setTimeout(() => {
      if (!menu.matches(':hover') && !btn.matches(':hover')) closeMenu();
    }, 100));
    menu?.addEventListener('mouseleave', () => setTimeout(() => {
      if (!menu.matches(':hover') && !btn.matches(':hover')) closeMenu();
    }, 100));
  } else {
    btn?.addEventListener('click', e => {
      e.preventDefault();
      dd.classList.toggle('open');
      btn.setAttribute('aria-expanded', dd.classList.contains('open'));
    });
  }
});
