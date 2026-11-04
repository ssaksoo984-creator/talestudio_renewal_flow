import { Bar, Check, Collapse, Field, Stage, Stream, Text, Window, type Act, type Theme } from './kit'
import lumiSrc from '../assets/lumi@2x.webp'
import './demo.css'

// Tale Studio, one line becoming a storyboard. Beats: an idea is typed into
// Lumi's composer and sent; Lumi offers three directions as a choice card;
// one is picked and Producer is ticked; the prose streams into the work area
// (Writer); Lumi splits it into four cuts and the cut cards fill one by one
// (Storyboard), each with its shot. Plays once; the still is the payoff:
// prose and cuts on screen, the choice kept as the record in the chat.
//
// Real strings: the idea, Lumi's three lines, the three directions, the
// prose, the four cut labels, the six step names. Everything else is filler.

const IDEA = '우산 하나를 같이 쓴 두 사람'
const GENRES = ['로맨틱 코미디', '잔잔한 드라마', '미스터리']
const TITLE = '1화 · 우산 하나'
const PROSE =
  '막차를 놓친 서윤은 정류장 지붕 끝에 서서 비를 피했다. 옆자리 남자가 말없이 우산을 기울였다. 둘의 어깨가 한 뼘쯤 젖었을 때, 서윤은 그가 같은 회사 신입이라는 걸 알아챘다.'
const WORDS = PROSE.split(' ').length
const CUTS = [
  { n: 1, shot: '와이드', cam: '아이레벨', tone: 'a' },
  { n: 2, shot: '미디엄', cam: '옆에서', tone: 'b' },
  { n: 3, shot: '클로즈업', cam: '로우앵글', tone: 'c' },
  { n: 4, shot: '투샷', cam: '뒤에서', tone: 'd' },
]
const STEPS = [
  { k: 'producer', name: 'Producer' },
  { k: 'writer', name: 'Writer' },
  { k: 'artist', name: 'Artist' },
  { k: 'storyboard', name: 'Storyboard' },
  { k: 'director', name: 'Director' },
  { k: 'editor', name: 'Editor' },
]

type Phase = 'idle' | 'thinking' | 'ask' | 'writing' | 'cuts'
type S = { draft: string; sent: boolean; phase: Phase; genre: number | null; words: number; cuts: number; step: number }

const initial: S = { draft: '', sent: false, phase: 'idle', genre: null, words: 0, cuts: 0, step: 0 }
const poster: S = { draft: '', sent: true, phase: 'cuts', genre: 0, words: WORDS, cuts: 4, step: 3 }

async function script(a: Act<S>) {
  await a.wait(700)
  a.mark('type')
  await a.click({ at: 'composer', x: 0.3, y: 0.5 })
  await a.type('draft', IDEA, { interval: 42 })
  await a.wait(300)
  await a.click('send')
  a.mark('send')
  a.put({ sent: true, draft: '', phase: 'thinking' })
  await a.wait(1000)
  a.mark('ask')
  a.put({ phase: 'ask' })
  await a.wait(1100)
  a.mark('pick')
  await a.click({ at: 'genre-0', x: 0.6, y: 0.5 })
  a.put({ genre: 0 })
  await a.wait(500)
  a.mark('write')
  a.put({ phase: 'writing', step: 1 })
  await a.wait(400)
  for (let i = 1; i <= WORDS; i++) {
    a.put({ words: i })
    await a.wait(70)
  }
  await a.wait(600)
  a.mark('cuts')
  a.put({ phase: 'cuts', step: 3 })
  await a.wait(300)
  for (let i = 1; i <= CUTS.length; i++) {
    a.put({ cuts: i })
    await a.wait(260)
  }
  await a.wait(400)
  await a.move({ at: 'cut-1', x: 0.55, y: 0.45 })
  await a.wait(3200)
}

export default function TaleDemo({ theme }: { theme: Theme }) {
  return (
    <Stage<S>
      width={1080}
      height={680}
      compact={{ below: 720, width: 358, height: 640 }}
      theme={theme}
      initial={initial}
      poster={poster}
      script={script}
      play="once"
      cursor={{ at: { wide: { x: 980, y: 590 }, compact: { x: 330, y: 610 } } }}
      className="td"
    >
      {(s, _rect, layout) =>
        layout === 'compact' ? (
          <Window title="비 오는 정류장" className="td-win td-win--compact">
            <div className="td-chat td-chat--compact">
              <Thread s={s} compact />
            </div>
          </Window>
        ) : (
          <Window title="비 오는 정류장" className="td-win" sidebarWidth={176} sidebar={<Side step={s.step} />}>
            <div className="td-body">
              <main className="td-main">
                <div className="td-head">
                  <div className="td-title">작업 화면</div>
                  <span className="td-stepchip" data-step={STEPS[s.step]!.k}>
                    <i />
                    {STEPS[s.step]!.name}
                  </span>
                </div>
                <Prose s={s} />
                <Cuts s={s} />
              </main>
              <aside className="td-chat">
                <div className="td-chathead">
                  <img src={lumiSrc} alt="" className="td-lumi" />
                  <span>Lumi</span>
                </div>
                <Thread s={s} />
              </aside>
            </div>
          </Window>
        )
      }
    </Stage>
  )
}

function Side({ step }: { step: number }) {
  return (
    <nav className="td-side">
      <div className="td-side__label">이야기 만들기</div>
      {STEPS.map((p, i) => (
        <span key={p.k} className="td-step" data-step={p.k} data-on={i === step || undefined} data-done={i < step || undefined}>
          <i className="td-step__dot" />
          <span className="td-step__name">{p.name}</span>
          <span className="td-step__check">
            <Check on={i < step} size={14} />
          </span>
          {i === 2 ? <span className="td-side__rule" /> : null}
        </span>
      ))}
      <div className="td-side__fill">
        <Bar w={92} h={6} tone={1} />
        <Bar w={68} h={6} tone={1} />
      </div>
    </nav>
  )
}

function Prose({ s }: { s: S }) {
  const on = s.phase === 'writing' || s.phase === 'cuts'
  return (
    <section className="td-prose" data-on={on || undefined}>
      <div className="td-prose__title">
        {on ? <Text>{TITLE}</Text> : <Bar w={120} h={10} tone={2} />}
      </div>
      <div className="td-prose__body">
        {on ? (
          <Stream className="td-stream" text={PROSE} count={s.words} />
        ) : (
          <div className="td-prose__empty">
            <Bar w="92%" h={8} tone={1} />
            <Bar w="84%" h={8} tone={1} />
            <Bar w="58%" h={8} tone={1} />
          </div>
        )}
      </div>
    </section>
  )
}

function Cuts({ s, compact }: { s: S; compact?: boolean }) {
  return (
    <section className="td-cuts" data-compact={compact || undefined}>
      {!compact && <div className="td-cuts__label">스토리보드</div>}
      <div className="td-cuts__grid">
        {CUTS.map((c, i) => (
          <div key={c.n} className="td-cut" data-target={`cut-${i}`} data-on={i < s.cuts || undefined}>
            <div className={`td-cut__img td-cut__img--${c.tone}`}>
              <span className="td-cut__rain" />
              <span className="td-cut__n">{c.n}</span>
            </div>
            <div className="td-cut__meta">
              <span>{c.shot}</span>
              <span className="td-cut__cam">{c.cam}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

function Thread({ s, compact }: { s: S; compact?: boolean }) {
  const answered = s.genre !== null
  return (
    <>
      <div className="td-thread">
        <div className="td-past">
          <Bar w="78%" h={8} r={4} tone={1} />
          <Bar w="52%" h={8} r={4} tone={1} />
        </div>
        <Collapse open={s.sent} reveal="drop" from="below">
          <div className="td-q">
            <Text>{IDEA}</Text>
          </div>
        </Collapse>
        <Collapse open={s.phase === 'thinking'}>
          <div className="td-a">
            <Text className="td-thinking">아이디어를 읽는 중</Text>
          </div>
        </Collapse>
        <Collapse open={s.phase === 'ask' || s.phase === 'writing' || s.phase === 'cuts'} reveal="drop">
          <div className="td-a">
            <Text className="td-line">좋아요. 어떤 결로 풀어 볼까요?</Text>
            <div className="td-choices" data-answered={answered || undefined}>
              {GENRES.map((g, i) => (
                <span key={g} className="td-choice" data-target={`genre-${i}`} data-cursor="pointer" data-on={s.genre === i || undefined}>
                  <span className="td-choice__mark">
                    <Check on={s.genre === i} size={14} />
                  </span>
                  {g}
                </span>
              ))}
            </div>
          </div>
        </Collapse>
        <Collapse open={s.phase === 'writing' || s.phase === 'cuts'} reveal="drop">
          <div className="td-a">
            <Text className="td-line">{compact ? '산문을 썼어요.' : '산문을 쓰고 있어요. 왼쪽에서 바로 볼 수 있어요.'}</Text>
            {compact && (
              <div className="td-card">
                <div className="td-prose__title">
                  <Text>{TITLE}</Text>
                </div>
                <Stream className="td-stream" text={PROSE} count={s.words} />
              </div>
            )}
          </div>
        </Collapse>
        <Collapse open={s.phase === 'cuts'} reveal="drop">
          <div className="td-a">
            <Text className="td-line">컷 4개로 나눴어요. 영상으로 만들기 전에 확인해 보세요.</Text>
            {compact && <Cuts s={s} compact />}
          </div>
        </Collapse>
      </div>
      <div className="td-composer">
        <Field
          className="td-field"
          value={s.draft}
          placeholder="이야기 한 줄을 적어 주세요"
          focused={!s.sent && s.draft.length > 0}
          box={{ 'data-target': 'composer', 'data-cursor': 'ibeam' }}
          trailing={
            <span className="td-send" data-target="send" data-cursor="pointer" data-ready={s.draft.length > 0 || undefined}>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                <path d="M8 2.5a.9.9 0 0 1 .64.26l4.2 4.2a.9.9 0 1 1-1.28 1.28L9 5.67V13a1 1 0 1 1-2 0V5.67L4.44 8.24a.9.9 0 1 1-1.28-1.28l4.2-4.2A.9.9 0 0 1 8 2.5Z" />
              </svg>
            </span>
          }
        />
      </div>
    </>
  )
}
