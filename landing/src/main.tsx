import { createRoot } from 'react-dom/client'
import { useEffect, useState } from 'react'
import TaleDemo from './TaleDemo'
import './page.css'
import './lumi-chat.js'

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

// Theme toggle (each file opens in its own theme; the toggle is for comparing)
document.querySelector('.theme-toggle')?.addEventListener('click', () => {
  root.dataset.theme = themeOf() === 'dark' ? 'light' : 'dark'
  window.dispatchEvent(new Event('tale-theme'))
})

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

// Sections rise in once as they enter
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
const items = document.querySelectorAll('.reveal')
if (reduce || !('IntersectionObserver' in window)) {
  items.forEach((e) => e.classList.add('in'))
} else {
  const io = new IntersectionObserver(
    (entries) =>
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('in')
          io.unobserve(e.target)
        }
      }),
    { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
  )
  items.forEach((e) => io.observe(e))
}

// Nav gets a surface once the page scrolls
const nav = document.querySelector('.nav')
const onScroll = () => nav?.classList.toggle('nav--scrolled', window.scrollY > 8)
window.addEventListener('scroll', onScroll, { passive: true })
onScroll()

// 작품 슬라이드: 끊김 없이 흐르도록 한 벌 더
const track = document.querySelector('.carousel__track')
if (track) Array.from(track.children).forEach((c) => { const d = c.cloneNode(true) as HTMLElement; d.setAttribute('aria-hidden', 'true'); track.append(d) })
