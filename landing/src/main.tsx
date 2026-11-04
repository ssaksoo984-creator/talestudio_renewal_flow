import './page.css'
import './lumi-chat.js'
import './common.js'


// Hero tabs
const tabs = Array.from(document.querySelectorAll<HTMLButtonElement>('.prompt__tabs button'))
const holders: Record<string, string> = {
  아이디어로: '예) 비 오는 정류장, 우산 하나를 같이 쓰게 된 두 사람. 알고 보니 같은 회사 신입과 팀장이었다.',
  대본으로: '예) S#1. 버스 정류장 / 밤 — 서윤, 지붕 끝에서 비를 피한다. 도현이 우산을 기울인다.',
  파일로: '대본 · 시놉시스 파일(.docx · .pdf · .txt)을 끌어 놓거나 여기에 붙여 넣어 주세요.',
}
const idea = document.getElementById('idea') as HTMLTextAreaElement | null
tabs.forEach((t) =>
  t.addEventListener('click', () => {
    tabs.forEach((x) => x.setAttribute('aria-selected', String(x === t)))
    if (idea) idea.placeholder = holders[t.textContent!.trim()] ?? ''
  }),
)
document.querySelectorAll('.prompt__opts .opt').forEach((o) => o.addEventListener('click', () => o.classList.toggle('opt--on')))

// 작품 슬라이드: 끊김 없이 흐르도록 한 벌 더
const track = document.querySelector('.carousel__track')
if (track) Array.from(track.children).forEach((c) => { const d = c.cloneNode(true) as HTMLElement; d.setAttribute('aria-hidden', 'true'); track.append(d) })

// 여섯 단계: 보고 있는 단계로 오른쪽 Lumi가 옷을 갈아입어요
const sixItems = Array.from(document.querySelectorAll<HTMLElement>('.six__item'))
const card = document.querySelector<HTMLElement>('.six__card')
const nameEl = document.getElementById('sixName'), numEl = document.getElementById('sixNum')
let current = ''
const activate = (el: HTMLElement) => {
  const p = el.dataset.p!
  if (p === current) return
  current = p
  sixItems.forEach((x) => x.classList.toggle('on', x === el))
  card?.style.setProperty('--c', el.style.getPropertyValue('--c'))
  const order = sixItems.map((x) => x.dataset.p)
  const at = order.indexOf(p)
  document.querySelectorAll<HTMLElement>('.six__app img').forEach((n) => n.classList.toggle('on', n.dataset.p === p))
  void at
  if (nameEl) nameEl.textContent = el.querySelector('h3')!.textContent
  if (numEl) numEl.textContent = `${String(sixItems.indexOf(el) + 1).padStart(2, '0')} / 06`
}
const sio = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && activate(e.target as HTMLElement)), { rootMargin: '-45% 0px -45% 0px' })
sixItems.forEach((x) => sio.observe(x))
if (sixItems[0]) activate(sixItems[0])


// 한 줄의 여정: 실제 앱 화면이 차례로 넘어가요 (탭을 눌러 고를 수 있어요)
const frame = document.querySelectorAll<HTMLImageElement>('.shots__frame img')
const stabs = Array.from(document.querySelectorAll<HTMLButtonElement>('.shots__tabs button'))
let si = 0, timer = 0
const showShot = (n: number) => {
  si = (n + frame.length) % frame.length
  frame.forEach((f, i) => f.classList.toggle('on', i === si))
  stabs.forEach((b, i) => { b.classList.toggle('on', i === si); b.setAttribute('aria-selected', String(i === si)) })
}
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches
const play = () => { clearInterval(timer); if (!reduceMotion) timer = window.setInterval(() => showShot(si + 1), 4500) }
stabs.forEach((b, i) => b.addEventListener('click', () => { showShot(i); play() }))
const shots = document.getElementById('shots')
shots?.addEventListener('mouseenter', () => { clearInterval(timer); shots.classList.add('paused') })
shots?.addEventListener('mouseleave', () => { shots.classList.remove('paused'); play() })
play()
