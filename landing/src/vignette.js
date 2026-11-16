// 여섯 단계 오른쪽: 단계마다 컴포넌트 몇 개 + 한 가지 동작만 (Figma 토큰)
import './vignette.css'
import lumiSrc from '../assets/lumi@2x.webp'

const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
const sleep = (ms) => new Promise((r) => setTimeout(r, reduce ? 0 : ms))
const shot = (vb, flip) => `<svg viewBox="${vb}" preserveAspectRatio="xMidYMid slice" aria-hidden="true"${flip ? ' class="flip"' : ''}><use href="#world"/></svg>`
const PROSE = '막차를 놓친 서윤은 정류장 지붕 끝에 서서 비를 피했다. 옆자리 남자가 말없이 우산을 기울였다. 둘의 어깨가 한 뼘쯤 젖었을 때, 서윤은 그가 같은 회사 신입이라는 걸 알아챘다.'
const lumi = (text) => `<div class="vg-msg"><img src="${lumiSrc}" alt="" /><p class="vg-bub">${text}</p></div>`

const VIEWS = {
  producer: `
    ${lumi('글의 장르 · 분위기와 길이를 골라 주세요.')}
    <div class="vg-chips"><span class="vg-chip" data-t>로맨틱 코미디 · 15초</span><span class="vg-chip">잔잔한 드라마 · 1분</span><span class="vg-chip">미스터리 · 30초</span></div>
    <div class="vg-sum">${[['장르', '로맨틱 코미디'], ['길이', '15초 · 숏폼'], ['화면 비율', '9:16 🔒'], ['인물', '서윤 · 도현']].map(([k, v]) => `<div class="vg-row"><span>${k}</span>${v}</div>`).join('')}</div>`,
  writer: `
    <div class="vg-card vg-prose"><p class="vg-label"><i></i>산문 · 1화</p><p class="vg-text" data-text></p><p class="vg-ph">아직 비어 있어요</p></div>
    <span class="vg-btn vg-btn--cream" data-t>AI에게 쓰기</span>`,
  artist: `
    <div class="vg-chips"><span class="vg-chip" data-t>실사</span><span class="vg-chip">3D 애니메이션</span><span class="vg-chip">2D 일러스트</span></div>
    <div class="vg-cast">
      <div class="vg-pic">${shot('128 76 40 53')}<p>서윤 <span>29 · 팀장</span></p></div>
      <div class="vg-pic">${shot('150 72 40 53')}<p>도현 <span>26 · 신입</span></p></div>
      <div class="vg-pic vg-pic--bg">${shot('40 30 240 160')}<p>버스 정류장 <span>밤 · 비</span></p></div>
    </div>`,
  storyboard: `
    <div class="vg-cuts">
      ${[['0 0 320 180', 'WS', '정류장 전경'], ['112 66 96 54', 'MS', '우산을 기울임'], ['128 79 46 25.9', 'CU', '서윤의 눈빛'], ['118 58 120 67.5', 'OS', '뒤에서 둘', true]]
        .map(([vb, t, d, f], i) => `<div class="vg-cut${i === 2 ? ' vg-cut--redo' : ''}"><div class="vg-cut__img">${shot(vb, f)}<span class="vg-tag">다시 그리기 · 무료</span></div><p><em>${t}</em>${d}</p></div>`).join('')}
    </div>
    <span class="vg-btn vg-btn--cream" data-t>러프 그리기</span>`,
  director: `
    <div class="vg-nodes">
      <svg class="vg-line" viewBox="0 0 100 40" preserveAspectRatio="none"><path d="M0 20 C40 20 60 20 100 20"/></svg>
      <div class="vg-node"><small>이미지</small><b>샷 2 <em>CU</em></b><div class="vg-node__img">${shot('128 79 46 25.9')}</div><p class="vg-ok">● 완료</p></div>
      <div class="vg-node vg-node--vid"><small>영상</small><b>샷 2 · 영상 <em>4초</em></b>
        <div class="vg-load"><p>영상을 만들고 있어요</p><div class="vg-prog"><i></i></div><span>로우앵글 · 천천히 다가가기</span></div>
        <div class="vg-node__img vg-done">${shot('128 79 46 25.9')}<span class="vg-play"></span></div></div>
    </div>
    <span class="vg-btn vg-btn--blue" data-t>영상 만들기 · 5 Take</span>`,
  editor: `
    <div class="vg-player">${shot('118 58 120 67.5', true)}<span class="vg-time">00:00 / 00:15</span></div>
    <div class="vg-tl">${[['0 0 320 180', 2.5], ['112 66 96 54', 2.5], ['128 79 46 25.9', 2], ['118 58 120 67.5', 3, true]].map(([vb, f, fl]) => `<i style="flex:${f}">${shot(vb, fl)}</i>`).join('')}<span class="vg-head"></span></div>
    <div class="vg-foot"><span class="vg-btn vg-btn--cream" data-t>내보내기</span><span class="vg-toast">mp4 · 1080p로 내보냈어요</span></div>`,
}


VIEWS.write = VIEWS.writer
VIEWS.expand = `
  <div class="vg-seed" data-seed>우산 하나를 같이 쓴 두 사람</div>
  <div class="vg-branches">
    <svg class="vg-blines" viewBox="0 0 300 40" preserveAspectRatio="none"><path d="M150 0 C150 22 50 18 50 40"/><path d="M150 0 V40"/><path d="M150 0 C150 22 250 18 250 40"/></svg>
    <div class="vg-leaf" data-t style="--lc:#E8606F"><small>로맨틱 코미디</small>상사와 신입, 비밀 연애의 시작</div>
    <div class="vg-leaf" style="--lc:#3E9BE0"><small>잔잔한 드라마</small>매일 같은 버스, 말 없는 동행</div>
    <div class="vg-leaf" style="--lc:#8B63E8"><small>미스터리</small>우산 주인은 왜 나타나지 않을까</div>
  </div>
  <div class="vg-chips vg-chips--c"><span class="vg-chip vg-pop">인물 · 서윤 · 도현</span><span class="vg-chip vg-pop">결말 · 해피엔딩</span><span class="vg-chip vg-pop">15초 · 9:16</span></div>
  <span class="vg-btn vg-btn--cream" data-go>갈래 펼치기</span>`
VIEWS.board = `
  <div class="vg-cmp vg-cmp--bad"><p class="vg-cmp__h">영상부터 바로<span>다시 · 다시 · 다시</span></p>
    <div class="vg-vids">${['0 0 320 180', '112 66 96 54', '128 79 46 25.9', '118 58 120 67.5'].map((vb) => `<i>${shot(vb)}</i>`).join('')}</div>
    <p class="vg-take"><b data-bad>0</b> Takes</p></div>
  <div class="vg-cmp"><p class="vg-cmp__h">Tale · 콘티 먼저<span>확인 → 확정 → 생성</span></p>
    <div class="vg-vids vg-vids--sb">${['0 0 320 180', '112 66 96 54', '128 79 46 25.9', '118 58 120 67.5'].map((vb, i) => `<i${i === 2 ? ' class="redo"' : ''}>${shot(vb)}<em>${i === 2 ? '다시 그리기 · 무료' : '✓ 확정'}</em></i>`).join('')}</div>
    <p class="vg-take">콘티 <b>0</b> · 영상 <b data-good>0</b> Takes</p></div>`

export function createVignettes(host) {
  host.classList.add('vg')
  const C = { write: '#E8606F', expand: '#F2A33A', board: '#5A6AE6', producer: '#F2A33A', writer: '#E8606F', artist: '#8B63E8', storyboard: '#5A6AE6', director: '#3E9BE0', editor: '#2DB39A' }
  host.innerHTML = Object.entries(VIEWS).map(([k, v]) => `<div class="vg-view" data-v="${k}" style="--c:${C[k]}">${v}</div>`).join('') +
    `<svg class="vg-cursor" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 2l16 9.5-7 1.6L9.5 20z" fill="#fff" stroke="#141312" stroke-width="1.4" stroke-linejoin="round"/></svg>`
  const cursor = host.querySelector('.vg-cursor')
  let run = 0
  const to = async (el, fx = 0.5, fy = 0.55) => {
    const h = host.getBoundingClientRect(), r = el.getBoundingClientRect()
    cursor.style.transform = `translate(${r.left - h.left + r.width * fx}px, ${r.top - h.top + r.height * fy}px)`
    await sleep(700)
  }
  const click = async (el, fx, fy) => { await to(el, fx, fy); el.classList.add('press'); cursor.classList.add('press'); await sleep(170); el.classList.remove('press'); cursor.classList.remove('press') }
  const park = () => { const h = host.getBoundingClientRect(); cursor.style.transform = `translate(${h.width - 40}px, ${h.height - 30}px)` }

  const ANIM = {
    async producer(v, alive) {
      await sleep(600); const c = v.querySelector('[data-t]'); await click(c); if (!alive()) return
      c.classList.add('pick'); v.querySelector('.vg-chips').classList.add('done')
      for (const r of v.querySelectorAll('.vg-row')) { await sleep(350); if (!alive()) return; r.classList.add('on') }
    },
    async writer(v, alive) {
      const t = v.querySelector('[data-text]')
      await sleep(500); await click(v.querySelector('[data-t]')); if (!alive()) return
      v.classList.add('busy')
      for (let i = 1; i <= PROSE.length && alive(); i++) { t.textContent = PROSE.slice(0, i); await sleep(32) }
      v.classList.remove('busy')
    },
    async artist(v, alive) {
      await sleep(600); const c = v.querySelector('[data-t]'); await click(c); if (!alive()) return
      c.classList.add('pick'); v.querySelector('.vg-chips').classList.add('done')
      for (const p of v.querySelectorAll('.vg-pic')) { await sleep(700); if (!alive()) return; p.classList.add('on') }
    },
    async storyboard(v, alive) {
      await sleep(500); await click(v.querySelector('[data-t]')); if (!alive()) return
      for (const c of v.querySelectorAll('.vg-cut')) { await sleep(450); if (!alive()) return; c.classList.add('on') }
      await sleep(500); const r = v.querySelector('.vg-cut--redo'); await to(r, 0.5, 0.4); r.classList.add('hot')
    },
    async director(v, alive) {
      await sleep(500); await click(v.querySelector('[data-t]')); if (!alive()) return
      v.classList.add('go'); const bar = v.querySelector('.vg-prog i')
      for (let p = 0; p <= 100 && alive(); p += 3) { bar.style.width = p + '%'; await sleep(55) }
      if (!alive()) return
      v.classList.add('fin')
    },
    async editor(v, alive) {
      const head = v.querySelector('.vg-head'), tl = v.querySelector('.vg-tl'), time = v.querySelector('.vg-time')
      await sleep(400); const w = tl.clientWidth - 12
      for (let x = 0; x <= w && alive(); x += 6) { head.style.left = 6 + x + 'px'; time.textContent = `00:${String(Math.round((x / w) * 15)).padStart(2, '0')} / 00:15`; await sleep(30) }
      if (!alive()) return
      await click(v.querySelector('[data-t]')); v.classList.add('fin')
    },
  }


  ANIM.write = ANIM.writer
  ANIM.expand = async (v, alive) => {
    await sleep(500); await click(v.querySelector('[data-go]')); if (!alive()) return
    v.classList.add('open')
    for (const l of v.querySelectorAll('.vg-leaf')) { await sleep(320); if (!alive()) return; l.classList.add('on') }
    await sleep(600); const pick = v.querySelector('.vg-leaf[data-t]'); await click(pick); if (!alive()) return
    pick.classList.add('pick'); v.querySelector('.vg-branches').classList.add('done')
    for (const c of v.querySelectorAll('.vg-pop')) { await sleep(300); if (!alive()) return; c.classList.add('on') }
  }
  ANIM.board = async (v, alive) => {
    const bad = v.querySelector('[data-bad]'), good = v.querySelector('[data-good]')
    const vids = v.querySelectorAll('.vg-cmp--bad i')
    for (let r = 0; r < 4 && alive(); r++) { vids[r].classList.add('on'); for (let k = 0; k < 5; k++) { bad.textContent = String(r * 5 + k + 1); await sleep(40) } await sleep(260) }
    if (!alive()) return
    v.querySelector('.vg-cmp--bad').classList.add('x')
    const cuts = v.querySelectorAll('.vg-vids--sb i')
    for (const c of cuts) { await sleep(380); if (!alive()) return; c.classList.add('on') }
    await sleep(400); for (let k = 1; k <= 5 && alive(); k++) { good.textContent = String(k); await sleep(70) }
  }

  function reset(v) {
    v.classList.remove('busy', 'go', 'fin', 'open')
    v.querySelectorAll('.x').forEach((e) => e.classList.remove('x'))
    v.querySelectorAll('[data-bad],[data-good]').forEach((e) => (e.textContent = '0'))
    v.querySelectorAll('.pick, .on, .hot, .done').forEach((e) => e.classList.remove('pick', 'on', 'hot', 'done'))
    const t = v.querySelector('[data-text]'); if (t) t.textContent = ''
    const bar = v.querySelector('.vg-prog i'); if (bar) bar.style.width = '0'
    const head = v.querySelector('.vg-head'); if (head) head.style.left = '6px'
    const time = v.querySelector('.vg-time'); if (time) time.textContent = '00:00 / 00:15'
  }

  async function play(k, loop = true) {
    const my = ++run, alive = () => my === run
    const v = host.querySelector(`[data-v="${k}"]`)
    host.querySelectorAll('.vg-view').forEach((x) => x.classList.toggle('on', x === v))
    do {
      reset(v); park(); await sleep(300)
      if (!alive()) return
      await ANIM[k](v, alive)
      if (!alive()) return
      await sleep(2400)
    } while (loop && alive() && !reduce)
  }
  function still(k) {
    run++
    const v = host.querySelector(`[data-v="${k}"]`)
    host.querySelectorAll('.vg-view').forEach((x) => x.classList.toggle('on', x === v))
    reset(v); park()
  }
  return { play, still, stop: () => run++ }
}
