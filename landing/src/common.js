// 두 페이지 공통: 밝게 · 어둡게 토글(기억), 나타나기, 내비 배경
const root = document.documentElement
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches

document.querySelector('.theme-toggle')?.addEventListener('click', () => {
  const next = root.dataset.theme === 'dark' ? 'light' : 'dark'
  root.dataset.theme = next
  try { localStorage.setItem('tale-theme', next) } catch {}
  dispatchEvent(new Event('tale-theme'))
})

const items = document.querySelectorAll('.reveal')
if (reduce || !('IntersectionObserver' in window)) items.forEach((e) => e.classList.add('in'))
else {
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target) } }), { rootMargin: '0px 0px -8% 0px', threshold: 0.08 })
  items.forEach((e) => io.observe(e))
}

const nav = document.querySelector('.nav')
const onScroll = () => nav?.classList.toggle('nav--scrolled', scrollY > 8)
addEventListener('scroll', onScroll, { passive: true })
onScroll()
