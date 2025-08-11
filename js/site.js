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

const $ = (s, ctx=document) => ctx.querySelector(s);
const $$ = (s, ctx=document) => Array.from(ctx.querySelectorAll(s));

$('#year') && ($('#year').textContent = new Date().getFullYear());

// Header scroll state
const header = document.querySelector('[data-header]');
const onScroll = () => header?.setAttribute('data-elevated', window.scrollY > 10);
onScroll();
addEventListener('scroll', onScroll, {passive:true});

// Menu mobile
const navToggle = $('.nav-toggle');
const overlay = document.querySelector('[data-overlay]');
const navList = $('.nav-list');
function setMenu(open){
  const expanded = !!open;
  navToggle?.setAttribute('aria-expanded', expanded);
  if(overlay) overlay.hidden = !expanded;
  document.body.style.overflow = expanded ? 'hidden' : '';
  navList?.classList.toggle('is-open', expanded);
}
navToggle?.addEventListener('click', ()=> setMenu(navToggle.getAttribute('aria-expanded') !== 'true'));
overlay?.addEventListener('click', ()=> setMenu(false));

// ===== HERO (home) =====
const slidesWrap = $('#slides');
if (slidesWrap){
  const left = $('.arrow-left');
  const right = $('.arrow-right');
  const currentEl = $('#heroCurrent');
  const totalEl = $('#heroTotal');
  const pad2 = n => String(n).padStart(2,'0');

  function pickHeroImages(){
    const g = IMAGES.filter(i=>i.cat==='gestante').slice(0,5);
    const r = IMAGES.filter(i=>i.cat==='revelacao').slice(0,5);
    const mixed=[]; 
    for(let i=0;i<5;i++){ 
      if(g[i]) mixed.push(g[i]); 
      if(r[i]) mixed.push(r[i]); 
    }
    return mixed;
  }

  const HERO = pickHeroImages();
  slidesWrap.innerHTML = HERO.map((it,idx)=>`
    <article class="slide ${idx===0?'is-active':''}">
      <picture><img src="${it.src}" alt="${it.alt}" ${idx? 'loading="lazy" decoding="async"':''}></picture>
    </article>`).join('');

  let index=0; 
  const total=HERO.length; 
  const slides=()=> $$('.slide', slidesWrap);
  totalEl.textContent = pad2(total); 
  currentEl.textContent = pad2(1);

  function show(i){ 
    slides()[index].classList.remove('is-active'); 
    index=(i+total)%total; 
    slides()[index].classList.add('is-active'); 
    currentEl.textContent=pad2(index+1); 
  }

  left.addEventListener('click', ()=> show(index-1));
  right.addEventListener('click', ()=> show(index+1));

  document.addEventListener('keydown', (e)=>{ 
    if(e.key==='ArrowLeft') show(index-1); 
    if(e.key==='ArrowRight') show(index+1); 
    if(e.key==='Escape') setMenu(false); 
  });

  let auto = setInterval(()=> show(index+1), 5500);
  const pause=()=> clearInterval(auto);
  const resume=()=> auto = setInterval(()=> show(index+1), 5500);
  $('.hero-carousel').addEventListener('mouseenter', pause);
  $('.hero-carousel').addEventListener('mouseleave', resume);

  let x0=null; 
  slidesWrap.addEventListener('touchstart', e=> x0 = e.touches[0].clientX, {passive:true});
  slidesWrap.addEventListener('touchend', e=>{ 
    if(x0===null) return; 
    const dx = e.changedTouches[0].clientX - x0; 
    x0=null; 
    if(Math.abs(dx)>40){ dx>0?show(index-1):show(index+1);} 
  });
}

// Portfolio pages
const grid = $('#portfolioGrid');
if(grid){
  const filter = grid.dataset.filter; // 'gestante' | 'revelacao' | 'all'
  const list = IMAGES.filter(i=> !filter || filter==='all' ? true : i.cat===filter);
  grid.innerHTML = list.map(i=> `<figure class="portfolio-card"><img src="${i.src}" alt="${i.alt}" loading="lazy" decoding="async"></figure>`).join('');
}

// Reveal animate-in
const io = new IntersectionObserver((entries)=>{ 
  entries.forEach(en=> en.isIntersecting && en.target.classList.add('is-visible')); 
}, {threshold:.12});
$$('[data-reveal]').forEach(el=> io.observe(el));

// Pagination numbers non-selectable
const heroPag = document.querySelector('.hero-pagination');
if(heroPag){ 
  heroPag.style.userSelect='none'; 
  heroPag.style.webkitUserSelect='none'; 
}

// Dropdown responsivo (hover funcional no desktop)
document.querySelectorAll('.dropdown').forEach(dd => {
  const btn = dd.querySelector('.dropdown-toggle');
  const menu = dd.querySelector('.dropdown-menu');

  function openMenu() { dd.classList.add('open'); }
  function closeMenu() { dd.classList.remove('open'); }

  if (window.matchMedia("(min-width: 1025px)").matches) {
    // Desktop: abre no hover do botão ou do menu
    btn.addEventListener('mouseenter', openMenu);
    menu.addEventListener('mouseenter', openMenu);

    btn.addEventListener('mouseleave', () => {
      // espera um pouquinho pra ver se o mouse vai pro menu
      setTimeout(() => {
        if (!menu.matches(':hover') && !btn.matches(':hover')) closeMenu();
      }, 100);
    });

    menu.addEventListener('mouseleave', () => {
      // idem, espera um pouco pra evitar fechamento abrupto
      setTimeout(() => {
        if (!menu.matches(':hover') && !btn.matches(':hover')) closeMenu();
      }, 100);
    });

  } else {
    // Mobile: abre/fecha no clique
    btn.addEventListener('click', e => {
      e.preventDefault();
      dd.classList.toggle('open');
      btn.setAttribute('aria-expanded', dd.classList.contains('open'));
    });
  }
});
