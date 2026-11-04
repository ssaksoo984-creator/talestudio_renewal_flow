import './lumi-chat.js'
// Tale Studio · 어두운 버전 스크립트 (라이브러리 없음)
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
const $ = (s, r = document) => r.querySelector(s)
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s))
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

// 같은 장면을 컷마다 다른 viewBox로 비춰요
$$('[data-vb]').forEach((f) => $('svg', f)?.setAttribute('viewBox', f.dataset.vb))

// 내비 배경
const nav = $('.nav')
const onScroll = () => nav.classList.toggle('nav--on', scrollY > 10)
addEventListener('scroll', onScroll, { passive: true })
onScroll()

// 나타나기
const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target) } }), { rootMargin: '0px 0px -8% 0px' })
$$('.rise').forEach((e) => (reduce ? e.classList.add('in') : io.observe(e)))

// 히어로 입력창: 예시 문장을 번갈아 타이핑해요
const ask = $('#ask')
const ideas = ['비 오는 정류장, 우산 하나를 같이 쓴 두 사람', '새벽 4시 편의점, 매일 같은 컵라면을 사는 손님', '404호에서만 들리는 피아노 소리', '마지막 배달을 마친 라이더의 생일']
if (!reduce) {
  ;(async () => {
    for (let i = 0; ; i = (i + 1) % ideas.length) {
      const t = ideas[i]
      for (let k = 1; k <= t.length; k++) { if (document.activeElement === ask) break; ask.placeholder = t.slice(0, k); await sleep(55) }
      await sleep(2200)
      for (let k = t.length; k > 0; k--) { if (document.activeElement === ask) break; ask.placeholder = t.slice(0, k); await sleep(18) }
      await sleep(300)
    }
  })()
}

// 왜 Tale: 보고 있는 항목에 맞춰 오른쪽 그림이 바뀌어요
const items = $$('.why__item'), cards = $$('.why__stage .why__card')
const show = (k) => { items.forEach((i) => i.classList.toggle('on', i.dataset.k === k)); cards.forEach((c) => c.classList.toggle('on', c.dataset.k === k)) }
const wio = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && show(e.target.dataset.k)), { rootMargin: '-45% 0px -45% 0px' })
items.forEach((i) => wio.observe(i))
show('0')
// 좁은 화면: 그림을 항목 아래에 붙여요
items.forEach((i) => {
  const c = cards.find((x) => x.dataset.k === i.dataset.k)
  if (!c) return
  const box = document.createElement('div')
  box.className = 'why__mobile'
  const clone = c.cloneNode(true)
  clone.classList.add('on')
  box.append(clone)
  i.append(box)
})

// 작품 포스터: 끊김 없이 흐르도록 한 벌 더
const track = $('.marquee__track')
track.append(...$$('.poster', track).map((p) => { const c = p.cloneNode(true); c.setAttribute('aria-hidden', 'true'); return c }))

// Take 계산기
const calc = () => {
  const cuts = +$('#cutsIn').value, per = +$('#modelIn').value, redo = +$('#redoIn').value
  $('#cutsOut').textContent = cuts
  $('#redoOut').textContent = redo
  $('#resBad').textContent = (cuts * per * (redo + 1)).toLocaleString()
  $('#resGood').textContent = (cuts * per).toLocaleString()
}
;['#cutsIn', '#modelIn', '#redoIn'].forEach((s) => $(s).addEventListener('input', calc))
calc()

// ---------- 스튜디오 데모 ----------
const IDEA = '우산 하나를 같이 쓴 두 사람'
const PROSE = '막차를 놓친 서윤은 정류장 지붕 끝에 서서 비를 피했다. 옆자리 남자가 말없이 우산을 기울였다. 둘의 어깨가 한 뼘쯤 젖었을 때, 서윤은 그가 같은 회사 신입이라는 걸 알아챘다.'
const app = $('#app'), log = $('#log'), typed = $('#typed'), input = $('.chat__input'), proseText = $('#proseText')
const steps = $$('.app__steps li'), cutEls = $$('#cuts .cut'), state = $('#lumiState'), cost = $('.studio__cost b')
let run = 0

const setStep = (n) => steps.forEach((s, i) => { s.classList.toggle('done', i < n); s.classList.toggle('on', i === n) })
const say = (html, cls = 'msg--lumi') => { const m = document.createElement('div'); m.className = `msg ${cls}`; m.innerHTML = html; log.append(m); return m }

function reset() {
  log.innerHTML = ''
  typed.textContent = ''
  input.classList.remove('ready', 'press')
  proseText.innerHTML = ''
  cutEls.forEach((c) => c.classList.remove('on', 'hot'))
  setStep(0)
  state.textContent = '듣고 있어요'
  cost.textContent = '0'
}

function finalState() {
  reset()
  say(IDEA, 'msg--me')
  say('좋아요. 어떤 결로 풀어 볼까요?<div class="chips done"><span class="chip pick">로맨틱 코미디</span><span class="chip">잔잔한 드라마</span><span class="chip">미스터리</span></div>')
  say('산문을 썼어요. 컷 4개로 나눴어요. <b>영상으로 만들기 전에 확인해 보세요.</b>')
  proseText.innerHTML = PROSE.split(' ').map((w) => `<span class="w on">${w} </span>`).join('')
  cutEls.forEach((c) => c.classList.add('on'))
  setStep(3)
  state.textContent = '확인을 기다려요'
}

async function play() {
  const my = ++run
  const alive = () => my === run
  reset()
  await sleep(700)
  for (let i = 1; i <= IDEA.length && alive(); i++) { typed.textContent = IDEA.slice(0, i); input.classList.add('ready'); await sleep(70) }
  if (!alive()) return
  await sleep(350); input.classList.add('press'); await sleep(160)
  typed.textContent = ''; input.classList.remove('ready', 'press')
  say(IDEA, 'msg--me')
  state.textContent = '읽는 중'
  const think = say('아이디어를 읽는 중', 'msg--lumi msg--think')
  await sleep(1300); if (!alive()) return
  think.remove()
  const q = say('좋아요. 어떤 결로 풀어 볼까요?<div class="chips"><span class="chip">로맨틱 코미디</span><span class="chip">잔잔한 드라마</span><span class="chip">미스터리</span></div>')
  state.textContent = '물어보는 중'
  await sleep(1500); if (!alive()) return
  const chips = $('.chips', q); chips.children[0].classList.add('pick'); chips.classList.add('done')
  await sleep(500); if (!alive()) return
  setStep(1); state.textContent = '쓰는 중'
  say('산문을 쓰고 있어요. 왼쪽에서 바로 볼 수 있어요.')
  const words = PROSE.split(' ')
  proseText.innerHTML = words.map((w) => `<span class="w">${w} </span>`).join('')
  const ws = $$('.w', proseText)
  for (const w of ws) { if (!alive()) return; w.classList.add('on'); await sleep(85) }
  await sleep(500); if (!alive()) return
  setStep(2); state.textContent = '그리는 중'
  await sleep(700); if (!alive()) return
  setStep(3); state.textContent = '콘티 나누는 중'
  for (const c of cutEls) { if (!alive()) return; c.classList.add('on'); await sleep(380) }
  say('컷 4개로 나눴어요. <b>영상으로 만들기 전에 확인해 보세요.</b>')
  state.textContent = '확인을 기다려요'
  await sleep(700); if (!alive()) return
  cutEls[2].classList.add('hot')
  await sleep(5200); if (!alive()) return
  play()
}

if (reduce) finalState()
else {
  let started = false
  new IntersectionObserver((es) => es.forEach((e) => {
    if (e.isIntersecting && !started) { started = true; play() }
    else if (!e.isIntersecting && started) { started = false; run++; finalState() }
  }), { threshold: 0.35 }).observe(app)
  finalState()
}
$('#replay').addEventListener('click', () => (reduce ? finalState() : play()))
