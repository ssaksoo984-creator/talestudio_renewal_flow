import { createRoot } from 'react-dom/client'
import { useEffect, useState } from 'react'
import TaleDemo from './TaleDemo'
import './page.css'
import './lumi-chat.js'
import './common.js'

const root = document.documentElement
const themeOf = () => (root.dataset.theme === 'light' ? 'light' : 'dark') as 'light' | 'dark'

// The demo remounts on Replay and when the theme flips
function DemoHost() {
  const [theme, setTheme] = useState(themeOf())
  const [run, setRun] = useState(0)
  useEffect(() => {
    const replay = () => setRun((n) => n + 1)
    const flip = () => setTheme(themeOf())
    document.getElementById('replay')?.addEventListener('click', replay)
    window.addEventListener('tale-theme', flip)
    return () => {
      document.getElementById('replay')?.removeEventListener('click', replay)
      window.removeEventListener('tale-theme', flip)
    }
  }, [])
  return <TaleDemo key={`${theme}-${run}`} theme={theme} />
}

const host = document.getElementById('demo')
if (host) createRoot(host).render(<DemoHost />)

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
  document.querySelectorAll<HTMLElement>('.nd').forEach((n) => {
    const i = order.indexOf(n.dataset.p!)
    n.classList.toggle('on', i === at)
    n.classList.toggle('done', i < at)
  })
  drawLines(at)
  if (nameEl) nameEl.textContent = el.querySelector('h3')!.textContent
  if (numEl) numEl.textContent = `${String(sixItems.indexOf(el) + 1).padStart(2, '0')} / 06`
}
const sio = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && activate(e.target as HTMLElement)), { rootMargin: '-45% 0px -45% 0px' })
sixItems.forEach((x) => sio.observe(x))
if (sixItems[0]) activate(sixItems[0])

// 노드 사이 선: 지난 단계까지는 밝게, 지금 들어오는 선은 흐르게
function drawLines(at = 0) {
  const box = document.getElementById('nodes')
  const svg = box?.querySelector('svg')
  if (!box || !svg) return
  const b = box.getBoundingClientRect()
  const ns = Array.from(box.querySelectorAll<HTMLElement>('.nd'))
  svg.setAttribute('viewBox', `0 0 ${b.width} ${b.height}`)
  svg.innerHTML = ns.slice(0, -1).map((n, i) => {
    const r1 = n.getBoundingClientRect(), r2 = ns[i + 1].getBoundingClientRect()
    const leftToRight = r2.left > r1.left
    const x1 = (leftToRight ? r1.right : r1.left) - b.left, y1 = r1.top + r1.height / 2 - b.top
    const x2 = (leftToRight ? r2.left : r2.right) - b.left, y2 = r2.top + r2.height / 2 - b.top
    const dx = Math.abs(x2 - x1) * 0.6 + 30, s = leftToRight ? 1 : -1
    const cls = i + 1 < at ? 'lit' : i + 1 === at ? 'lit flow' : ''
    return `<path class="${cls}" d="M${x1} ${y1} C${x1 + dx * s} ${y1}, ${x2 - dx * s} ${y2}, ${x2} ${y2}" style="--c:${getComputedStyle(ns[i + 1]).getPropertyValue('--c')}"/>`
  }).join('')
}
addEventListener('resize', () => drawLines(sixItems.findIndex((x) => x.classList.contains('on'))))
requestAnimationFrame(() => drawLines(0))
