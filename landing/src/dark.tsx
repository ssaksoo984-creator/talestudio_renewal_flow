import { createRoot } from 'react-dom/client'
import { useEffect, useState } from 'react'
import TaleDemo from './TaleDemo'
import './page.css'
import './dark.css'

// Studio preview: the stageshow demo, remounted on Replay
function DemoHost() {
  const [run, setRun] = useState(0)
  useEffect(() => {
    const replay = () => setRun((n) => n + 1)
    const b = document.getElementById('replay')
    b?.addEventListener('click', replay)
    return () => b?.removeEventListener('click', replay)
  }, [])
  return <TaleDemo key={run} theme="dark" />
}
const host = document.getElementById('demo')
if (host) createRoot(host).render(<DemoHost />)

// Panel tabs change the placeholder
const holders = [
  '예) 비 오는 정류장, 우산 하나를 같이 쓰게 된 두 사람. 알고 보니 같은 회사 신입과 팀장이었다.',
  '예) S#1. 버스 정류장 / 밤 — 서윤, 지붕 끝에서 비를 피한다. 도현이 우산을 기울인다.',
  '대본 · 시놉시스 파일(.docx · .pdf · .txt)을 끌어 놓거나 붙여 넣어 주세요.',
]
const tabs = Array.from(document.querySelectorAll<HTMLButtonElement>('.dk-seg button'))
const idea = document.getElementById('dk-idea') as HTMLTextAreaElement | null
tabs.forEach((t, i) =>
  t.addEventListener('click', () => {
    tabs.forEach((x) => x.setAttribute('aria-selected', String(x === t)))
    if (idea) idea.placeholder = holders[i]!
  }),
)

// Gallery filter chips (visual only until real works exist)
const chips = Array.from(document.querySelectorAll<HTMLButtonElement>('.dk-filter button'))
chips.forEach((c) => c.addEventListener('click', () => chips.forEach((x) => x.classList.toggle('on', x === c))))

// Step rail arrows
const rail = document.getElementById('rail')
document.querySelectorAll<HTMLButtonElement>('.dk-arrow').forEach((b) =>
  b.addEventListener('click', () => rail?.scrollBy({ left: Number(b.dataset.dir) * 320, behavior: 'smooth' })),
)

// Take calculator: straight to video = every cut regenerated N times; Tale = confirmed cuts once
const $ = (id: string) => document.getElementById(id) as HTMLInputElement
const calc = () => {
  const cuts = +$('cuts').value
  const per = +$('model').value
  const redo = +$('redo').value
  $('cutsOut').textContent = String(cuts)
  $('redoOut').textContent = String(redo)
  $('resBad').textContent = (cuts * per * (redo + 1)).toLocaleString()
  $('resGood').textContent = (cuts * per).toLocaleString()
}
;['cuts', 'model', 'redo'].forEach((id) => $(id)?.addEventListener('input', calc))
calc()

// Rise in once
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
const items = document.querySelectorAll('.reveal')
if (reduce || !('IntersectionObserver' in window)) items.forEach((e) => e.classList.add('in'))
else {
  const io = new IntersectionObserver(
    (es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target) } }),
    { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
  )
  items.forEach((e) => io.observe(e))
}

const nav = document.querySelector('.nav')
const onScroll = () => nav?.classList.toggle('nav--scrolled', window.scrollY > 8)
window.addEventListener('scroll', onScroll, { passive: true })
onScroll()
