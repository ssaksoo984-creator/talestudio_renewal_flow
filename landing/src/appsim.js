// Tale Studio 앱 시뮬레이션: Figma 화면의 색 · 컴포넌트 · 배치 + 프로토타입의 흐름 · 문구
import './appsim.css'
import lumiSrc from '../assets/lumi@2x.webp'
import symbolSrc from '../assets/tale-symbol.svg'
import lp from '../assets/lumi-producer.webp'
import lw from '../assets/lumi-writer.webp'
import la from '../assets/lumi-artist.webp'
import ls from '../assets/lumi-storyboard.webp'
import ld from '../assets/lumi-director.webp'
import le from '../assets/lumi-editor.webp'

export const STEPS = ['producer', 'writer', 'artist', 'storyboard', 'director', 'editor']
const NAMES = { producer: 'Producer', writer: 'Writer', artist: 'Artist', storyboard: 'Storyboard', director: 'Director', editor: 'Editor' }
const COLORS = { producer: '#F2A33A', writer: '#E8606F', artist: '#8B63E8', storyboard: '#5A6AE6', director: '#3E9BE0', editor: '#2DB39A' }
const LUMI = { producer: lp, writer: lw, artist: la, storyboard: ls, director: ld, editor: le }
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
const sleep = (ms) => new Promise((r) => setTimeout(r, reduce ? 0 : ms))
const shot = (vb, flip) => `<svg viewBox="${vb}" preserveAspectRatio="xMidYMid slice" aria-hidden="true"${flip ? ' class="flip"' : ''}><use href="#world"/></svg>`
const PROSE = [
  '막차를 놓친 서윤은 정류장 지붕 끝에 서서 비를 피했다.',
  '옆자리 남자가 말없이 우산을 기울였다.',
  '둘의 어깨가 한 뼘쯤 젖었을 때, 서윤은 그가 같은 회사 신입이라는 걸 알아챘다.',
]
const FIX = '옆자리 남자가 말없이 우산을 기울였다. 우산 끝에서 떨어진 빗방울이 그의 어깨만 적셨다.'

const msg = (html, name) => `<div class="sim-msg"><span class="sim-msg__av"><img src="${lumiSrc}" alt="" /></span><div><p class="sim-msg__name">Lumi<span>${name}</span></p><div class="sim-bub">${html}</div></div></div>`
const input = (ph) => `<div class="sim-input"><span class="sim-input__plus"></span><span class="ph">${ph}</span><b></b><span class="sim-input__send">↑</span></div>`

function template() {
  const nav = STEPS.map((s) => `<div class="sim-nav" data-n="${s}" style="--c:${COLORS[s]}"><i></i>${NAMES[s]}</div>`).join('')
  return `<div class="sim__canvas">
  <aside class="sim-side"><img class="sim-side__logo" src="${symbolSrc}" alt="" />${nav}
    <div class="sim-side__end"><span><i></i>Take</span><span><i></i>공유</span><span><i></i>Help</span><span class="sim-av">A</span></div></aside>
  <div class="sim-top"><span class="sim-badge">Producer</span><span class="sim-title">비 오는 날 만난 두 사람</span><span class="sim-pen"></span></div>
  <div class="sim-btns" data-for="writer"></div>

  <section class="sim-scene" data-scene="producer">
    <div class="sim-pro">
      <div class="sim-set"><span>화면 비율 <b data-k="ratio">—</b></span><span>길이 <b data-k="len">—</b></span><span>장르 <b data-k="genre">—</b></span></div>
      <div class="sim-pro__log"></div>
      ${input('Lumi에게 이야기해 보세요')}
    </div>
  </section>

  <section class="sim-scene" data-scene="writer">
    <div class="sim-h"><b>산문</b><span>1화 · 15초</span></div>
    <div class="sim-meta"><span>장르<b>로맨틱 코미디</b></span><span>길이<b>15초 · 숏폼</b></span><span>비율<b>9:16 🔒</b></span></div>
    <div class="sim-prose">${PROSE.map((p, i) => `<div class="sim-para" data-i="${i}"><em>0${i + 1}</em><div class="sim-para__t">${p.split(' ').map((w) => `<span class="w">${w} </span>`).join('')}</div></div>`).join('')}</div>
  </section>

  <section class="sim-scene" data-scene="artist">
    <div class="sim-h"><b>인물 · 배경</b><span>확정 산문에서 뽑았어요</span></div>
    <div class="sim-tabs"><span class="on">모두 3</span><span>인물 2</span><span>배경 1</span></div>
    <div class="sim-cards sim-cards--art">
      <div class="sim-card"><div class="sim-card__img">${shot('128 76 40 53')}</div><p>서윤<span>29 · 팀장</span></p></div>
      <div class="sim-card"><div class="sim-card__img">${shot('150 72 40 53')}</div><p>도현<span>26 · 신입</span></p></div>
      <div class="sim-card sim-card--wide"><div class="sim-card__img">${shot('40 30 240 114')}</div><p>버스 정류장<span>밤 · 비</span></p></div>
    </div>
  </section>

  <section class="sim-scene" data-scene="storyboard">
    <div class="sim-h"><b>Storyboard</b><span>씬 1 · 샷 6 · 15초</span></div>
    <div class="sim-tabs"><span class="on">러프</span><span>시트</span></div>
    <div class="sim-cards sim-cards--sb">
      ${[['0 0 320 180', 'WS', '정류장 전경'], ['112 66 96 54', 'MS', '우산을 기울임'], ['128 79 46 25.9', 'CU', '서윤의 눈빛'], ['118 58 120 67.5', 'OS', '뒤에서 둘', true], ['150 72 40 30', 'CU', '도현의 미소'], ['60 40 200 112', 'LS', '버스가 지나감']]
        .map(([vb, t, d, f], i) => `<div class="sim-card${i === 2 ? ' sb-redo' : ''}"><div class="sim-card__img">${shot(vb, f)}<span class="sim-tag">다시 그리기 · 무료</span></div><p><em>${t}</em>${d}</p></div>`).join('')}
    </div>
  </section>

  <section class="sim-scene" data-scene="director">
    <div class="sim-tool"><span class="sim-seg"><span class="on">노드</span><span>스토리보드</span></span><b>The Set</b><small>노드 6 · 샷 3</small>
      <span class="sim-pill">스토리보드 생성 6/6</span><span class="sim-pill sim-pill--live">영상 만드는 중 · <span data-k="vid">0</span>/3</span></div>
    <div class="sim-board">
      <svg class="lines" viewBox="0 0 1316 760" preserveAspectRatio="none"><path d="M234 120 C300 120 300 150 360 150"/><path d="M234 330 C300 330 300 170 360 170"/><path d="M234 330 C300 330 300 440 360 440"/><path d="M234 560 C300 560 300 460 360 460"/><path d="M564 160 C640 160 640 150 700 150"/><path d="M564 450 C640 450 640 470 700 470"/><path d="M904 160 C960 160 960 260 1040 260"/></svg>
      <div class="sim-node" style="left:30px;top:40px"><small>이미지</small><b>서윤<em>인물</em></b><div class="sim-node__img">${shot('128 76 40 53')}</div></div>
      <div class="sim-node" style="left:30px;top:250px"><small>이미지</small><b>도현<em>인물</em></b><div class="sim-node__img">${shot('150 72 40 53')}</div></div>
      <div class="sim-node" style="left:30px;top:470px"><small>이미지</small><b>버스 정류장<em>배경</em></b><div class="sim-node__img">${shot('40 30 240 135')}</div></div>
      <div class="sim-node" style="left:360px;top:60px"><small>이미지</small><b>샷 1<em>MS</em></b><div class="sim-node__img">${shot('112 66 96 54')}</div><p class="sim-node__ok">● 완료</p></div>
      <div class="sim-node" style="left:360px;top:360px"><small>이미지</small><b>샷 2<em>CU</em></b><div class="sim-node__img">${shot('128 79 46 25.9')}</div><p class="sim-node__ok">● 완료</p></div>
      <div class="sim-node" style="left:700px;top:60px"><small>영상</small><b>샷 1 · 영상<em>5초</em></b><div class="sim-node__img">${shot('112 66 96 54')}</div><p class="sim-node__ok">● 완료 · Kling</p></div>
      <div class="sim-node" style="left:700px;top:380px"><small>영상</small><b>샷 2 · 영상<em>4초</em></b><div class="sim-load"><img src="${ld}" alt="" /><p>영상을 만들고 있어요</p><span class="pct">샷 2 · 약 1분 남음</span><div class="sim-prog"><i></i></div></div></div>
      <div class="sim-node" style="left:1040px;top:170px;width:220px"><small>영상</small><b>샷 3 · 영상<em>6초</em></b><div class="sim-node__img">${shot('118 58 120 67.5', true)}</div><p class="sim-node__ok" style="color:var(--t3)">○ 순서 기다리는 중</p></div>
    </div>
  </section>

  <section class="sim-scene" data-scene="editor">
    <div class="sim-tool"><span class="sim-seg"><span class="on">타임라인</span><span>노드</span></span><b>1화 · 우산 하나</b><small>샷 6 · 15초</small><span class="sim-pill">20 Takes 사용</span></div>
    <div class="sim-ed">
      <div class="sim-player">${shot('104 44 72 128')}<span class="tri"></span></div>
      <div class="sim-tl">${[['0 0 320 180', 2.5], ['112 66 96 54', 2.5], ['128 79 46 25.9', 2], ['118 58 120 67.5', 3, true], ['150 72 40 30', 2], ['60 40 200 112', 3]].map(([vb, f, fl]) => `<i style="flex:${f}">${shot(vb, fl)}</i>`).join('')}<span class="sim-head"></span></div>
    </div>
  </section>

  <aside class="sim-chat"><div class="sim-chat__head"><img src="${lumiSrc}" alt="" /><b class="sim-chat__title">Lumi와 산문 이야기</b><span></span></div><div class="sim-chat__log"></div>${input('질문을 입력하세요')}</aside>
  <svg class="sim-cursor" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 2l16 9.5-7 1.6L9.5 20z" fill="#fff" stroke="#141312" stroke-width="1.4" stroke-linejoin="round"/></svg>
</div>`
}

export function createSim(host, { loop = false, onStep } = {}) {
  host.classList.add('sim')
  host.innerHTML = template()
  const $ = (s) => host.querySelector(s)
  const $$ = (s) => Array.from(host.querySelectorAll(s))
  const canvas = $('.sim__canvas')
  const fit = () => { canvas.style.transform = `scale(${host.clientWidth / 1440})` }
  new ResizeObserver(fit).observe(host)
  fit()
  const cursor = $('.sim-cursor')
  let run = 0

  const pos = (el, fx = 0.5, fy = 0.5) => {
    const c = canvas.getBoundingClientRect(), r = el.getBoundingClientRect(), k = c.width / 1440
    return [(r.left - c.left + r.width * fx) / k, (r.top - c.top + r.height * fy) / k]
  }
  const move = async (el, fx, fy) => { const [x, y] = pos(el, fx, fy); cursor.style.left = x + 'px'; cursor.style.top = y + 'px'; await sleep(750) }
  const click = async (el, fx, fy) => { await move(el, fx, fy); cursor.classList.add('press'); el.classList.add('press'); await sleep(160); cursor.classList.remove('press'); el.classList.remove('press'); await sleep(120) }
  const type = async (inp, text, alive) => { const b = inp.querySelector('b'); inp.querySelector('.ph').hidden = true; inp.classList.add('ready'); for (let i = 1; i <= text.length && alive(); i++) { b.textContent = text.slice(0, i); await sleep(55) } }
  const clearInput = (inp) => { inp.querySelector('b').textContent = ''; inp.querySelector('.ph').hidden = false; inp.classList.remove('ready') }
  const add = (log, html) => { log.insertAdjacentHTML('beforeend', html); return log.lastElementChild }
  const think = async (log, ms = 900) => { const d = add(log, `<div class="sim-msg"><span class="sim-msg__av"><img src="${lumiSrc}" alt="" /></span><div><span class="sim-dots"><i></i><i></i><i></i></span></div></div>`); await sleep(ms); d.remove() }

  function setStep(s) {
    host.dataset.s = s
    $('.sim-badge').textContent = NAMES[s]
    const at = STEPS.indexOf(s)
    $$('.sim-nav').forEach((n, i) => { n.classList.toggle('on', i === at); n.classList.toggle('done', i < at) })
    $$('.sim-scene').forEach((n) => n.classList.toggle('on', n.dataset.scene === s))
    host.classList.toggle('sim--chat', s !== 'producer' && s !== 'editor')
    $('.sim-chat__title').textContent = { writer: 'Lumi와 산문 이야기', artist: 'Lumi와 그림 이야기', storyboard: 'Lumi와 콘티 이야기', director: 'Lumi와 연출 이야기' }[s] || 'Lumi'
    const btns = { writer: '<span class="sim-btn">작업 계획</span><span class="sim-btn">AI 다시 쓰기</span><span class="sim-btn sim-btn--cream" data-go>브레이크다운하기 →</span>', artist: '<span class="sim-btn">스타일 · 실사</span><span class="sim-btn sim-btn--cream" data-go>콘티로 넘어가기 →</span>', storyboard: '<span class="sim-btn">시트로 보기</span><span class="sim-btn sim-btn--cream" data-go>Director로 →</span>', director: '<span class="sim-btn sim-btn--cream" data-go>다음: Editor →</span>', editor: '<span class="sim-btn">마스터 시트</span><span class="sim-btn sim-btn--cream" data-go>내보내기</span>' }
    $('.sim-btns').innerHTML = btns[s] || '<span class="sim-btn">원본에서 고르기</span><span class="sim-btn">채팅으로 만들기</span>'
    onStep?.(s)
  }

  function reset() {
    $('.sim-pro__log').innerHTML = ''
    $('.sim-chat__log').innerHTML = ''
    $$('.sim-set b').forEach((b) => (b.textContent = '—'))
    $$('.sim-input').forEach(clearInput)
    $$('.sim-para .w').forEach((w) => w.classList.remove('on'))
    $$('.sim-para').forEach((p) => { p.classList.remove('sel'); p.querySelector('.sim-fix')?.remove() })
    $('.sim-para[data-i="1"] .sim-para__t').innerHTML = PROSE[1].split(' ').map((w) => `<span class="w">${w} </span>`).join('')
    $$('.sim-card').forEach((c) => c.classList.remove('on', 'redo'))
    $$('.sim-node').forEach((n) => n.classList.remove('on', 'done', 'hot'))
    $$('.sim-board path').forEach((p) => p.classList.remove('on'))
    $('.sim-prog i').style.width = '0'
    $('[data-k="vid"]').textContent = '1'
    $('.sim-head').style.left = '6px'
    $('.sim-player').classList.remove('is-playing')
  }

  const SCENES = {
    async producer(alive) {
      const log = $('.sim-pro__log'), inp = $('.sim-pro .sim-input')
      add(log, msg('안녕하세요! 어떤 이야기를 만들어 볼까요?<br>한 줄이면 충분해요. 장르 · 길이 · 화면 비율은 같이 정해요.<div class="sim-qs"><span class="sim-chipq">아이디어가 있어요</span><span class="sim-chipq">대본이 있어요</span><span class="sim-chipq">추천해 주세요</span></div>', 'Producer'))
      await sleep(900); if (!alive()) return
      await click(inp, 0.3); await type(inp, '우산 하나를 같이 쓴 두 사람', alive); if (!alive()) return
      await click(inp.querySelector('.sim-input__send')); clearInput(inp)
      add(log, `<p class="sim-me">우산 하나를 같이 쓴 두 사람</p>`)
      await think(log); if (!alive()) return
      const q = add(log, msg('좋아요! 글의 장르 · 분위기와 길이를 골라 주세요.<div class="sim-qs"><span class="sim-chipq">로맨틱 코미디 · 15초</span><span class="sim-chipq">잔잔한 드라마 · 1분</span><span class="sim-chipq">미스터리 · 30초</span></div>', 'Producer'))
      await sleep(900); if (!alive()) return
      const chip = q.querySelector('.sim-chipq'); await click(chip); chip.classList.add('pick'); q.querySelector('.sim-qs').classList.add('done')
      $('[data-k="genre"]').textContent = '로맨틱 코미디'; $('[data-k="len"]').textContent = '15초'
      add(log, `<p class="sim-me">로맨틱 코미디 · 15초</p>`)
      await think(log); if (!alive()) return
      const sum = add(log, msg('이렇게 시작해 볼게요.<div class="sim-sum"><div><span>장르</span>로맨틱 코미디</div><div><span>길이</span>15초 · 숏폼</div><div><span>화면 비율</span>9:16 🔒</div><div><span>인물</span>서윤 · 도현</div></div><div class="sim-sum-btns"><span class="sim-btn sim-btn--cream">좋아요, 산문 쓰기로</span><span class="sim-btn">아니요, 더 고칠래요</span></div>', 'Producer'))
      $('[data-k="ratio"]').textContent = '9:16'
      await sleep(1200); if (!alive()) return
      await click(sum.querySelector('.sim-btn--cream'))
      await sleep(400)
    },
    async writer(alive) {
      const log = $('.sim-chat__log'), inp = $('.sim-chat .sim-input')
      for (const w of $$('.sim-para .w')) { if (!alive()) return; w.classList.add('on'); await sleep(45) }
      add(log, msg('산문을 썼어요. 고치고 싶은 문단을 누르고 어떻게 고칠지 말해 주세요.<div class="sim-qs"><span class="sim-chipq">전부 다시 써 줘</span><span class="sim-chipq">대사를 늘려 줘</span><span class="sim-chipq">좋아요</span></div>', 'Writer'))
      await sleep(800); if (!alive()) return
      const p2 = $('.sim-para[data-i="1"]'); await click(p2, 0.3, 0.5); p2.classList.add('sel')
      await click(inp, 0.3); await type(inp, '이 문단을 조금 더 설레게', alive); if (!alive()) return
      await click(inp.querySelector('.sim-input__send')); clearInput(inp)
      add(log, `<p class="sim-me">02 · 이 문단을 조금 더 설레게</p>`)
      await think(log, 1100); if (!alive()) return
      const fix = document.createElement('div'); fix.className = 'sim-fix'
      fix.innerHTML = `<small>AI 수정안</small>${FIX}<div class="sim-sum-btns"><span class="sim-btn">되돌리기</span><span class="sim-btn sim-btn--cream">적용</span></div>`
      p2.append(fix)
      add(log, msg('2문단에 수정안을 붙였어요. 마음에 들면 적용해 주세요.', 'Writer'))
      await sleep(900); if (!alive()) return
      await click(fix.querySelector('.sim-btn--cream'))
      fix.remove(); p2.classList.remove('sel'); p2.querySelector('.sim-para__t').innerHTML = `<span class="w on">${FIX}</span>`
      await sleep(600); if (!alive()) return
      await click($('[data-go]'))
    },
    async artist(alive) {
      const log = $('.sim-chat__log')
      add(log, msg('산문에서 인물 2명, 배경 1곳을 뽑았어요. 어떤 스타일로 그릴까요?<div class="sim-qs"><span class="sim-chipq">실사</span><span class="sim-chipq">3D 애니메이션</span><span class="sim-chipq">2D 일러스트</span></div>', 'Artist'))
      await sleep(900); if (!alive()) return
      const c = log.querySelector('.sim-chipq'); await click(c); c.classList.add('pick'); c.parentElement.classList.add('done')
      for (const card of $$('[data-scene="artist"] .sim-card')) { if (!alive()) return; await sleep(650); card.classList.add('on') }
      add(log, msg('다 그렸어요. 얼굴은 모든 컷에서 이 모습으로 이어져요.', 'Artist'))
      await sleep(900); if (!alive()) return
      await click($('[data-go]'))
    },
    async storyboard(alive) {
      const log = $('.sim-chat__log')
      add(log, msg('씬 · 샷을 나누고 러프를 그려요. 다 그린 샷부터 하나씩 나타나요.', 'Storyboard'))
      for (const card of $$('[data-scene="storyboard"] .sim-card')) { if (!alive()) return; await sleep(420); card.classList.add('on') }
      await sleep(500); if (!alive()) return
      const redo = $('[data-scene="storyboard"] .sb-redo'); await move(redo, 0.5, 0.45); redo.classList.add('redo')
      add(log, msg('샷 6개, 15초예요. 영상으로 만들기 전에 마음에 안 드는 컷은 다시 그려요. 무료예요.', 'Storyboard'))
      await sleep(1300); if (!alive()) return
      await click($('[data-go]'))
    },
    async director(alive) {
      const log = $('.sim-chat__log')
      const nodes = $$('.sim-node'), paths = $$('.sim-board path')
      for (const n of nodes.slice(0, 3)) { if (!alive()) return; n.classList.add('on'); await sleep(260) }
      for (const n of nodes.slice(3, 5)) { if (!alive()) return; n.classList.add('on', 'done'); await sleep(260) }
      paths.slice(0, 4).forEach((p) => p.classList.add('on'))
      add(log, msg('샷마다 카메라 · 조명을 정했어요. 확정한 샷부터 하나씩 영상으로 만들게요.', 'Director'))
      await sleep(700); if (!alive()) return
      nodes[5].classList.add('on', 'done'); paths[4].classList.add('on'); await sleep(400)
      nodes[6].classList.add('on', 'hot'); nodes[7].classList.add('on'); paths[5].classList.add('on'); paths[6].classList.add('on')
      $('[data-k="vid"]').textContent = '2'
      const bar = $('.sim-prog i')
      for (let p = 0; p <= 100 && alive(); p += 4) { bar.style.width = p + '%'; await sleep(70) }
      if (!alive()) return
      nodes[6].classList.remove('hot')
      add(log, msg('샷 2 영상이 나왔어요. 생성 전에 보여 드린 대로 5 Take를 썼어요.', 'Director'))
      await sleep(1000); if (!alive()) return
      await click($('[data-go]'))
    },
    async editor(alive) {
      const head = $('.sim-head'), tl = $('.sim-tl'), player = $('.sim-player')
      await click(player); player.classList.add('is-playing')
      const w = tl.clientWidth - 14
      for (let x = 0; x <= w && alive(); x += 8) { head.style.left = 6 + x + 'px'; await sleep(40) }
      if (!alive()) return
      player.classList.remove('is-playing')
      await sleep(600); if (!alive()) return
      await click($('[data-go]'))
      await sleep(1200)
    },
  }

  async function play(from = 'producer', only = false) {
    const my = ++run
    const alive = () => my === run
    reset()
    let i = STEPS.indexOf(from)
    // 앞 단계 결과는 이미 된 상태로
    if (i > 0) prefill(i)
    while (alive()) {
      const s = STEPS[i]
      setStep(s)
      $('.sim-chat__log').innerHTML = ''
      await sleep(500)
      if (!alive()) return
      await SCENES[s](alive)
      if (!alive()) return
      if (only) { await sleep(2400); if (!alive()) return; reset(); if (i > 0) prefill(i); continue }
      i++
      if (i >= STEPS.length) { if (!loop) return; i = 0; reset() }
    }
  }
  function prefill(i) {
    if (i > 1) $$('.sim-para .w').forEach((w) => w.classList.add('on'))
    if (i > 2) $$('[data-scene="artist"] .sim-card').forEach((c) => c.classList.add('on'))
  }
  function still(s) {
    run++
    reset(); setStep(s); prefill(STEPS.indexOf(s) + 1)
    if (s === 'storyboard') $$('[data-scene="storyboard"] .sim-card').forEach((c) => c.classList.add('on'))
    if (s === 'director') { $$('.sim-node').forEach((n) => n.classList.add('on')); $$('.sim-board path').forEach((p) => p.classList.add('on')) }
  }
  return { play, still, stop: () => run++, setStep }
}
