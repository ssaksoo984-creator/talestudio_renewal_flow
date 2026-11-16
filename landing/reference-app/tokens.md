# Tale Studio 앱 실제 토큰 (talestudio.art, 2026-11-16 캡처)

출처: 앱이 쓰는 스타일시트 `/_next/static/chunks/829de4a04ede8412.css` 의 `:root` · `[data-stage=*]` 변수를 그대로 옮김.
글꼴은 `/_next/static/chunks/1a664b232923fa36.css` (Pretendard Variable 45–920, Inter 100–900).
간격 · 글자 크기 · 모서리 중 변수로 없는 값은 같은 CSS의 Tailwind 유틸리티(`--spacing: .25rem` 기준)와 캡처(1568×762 뷰포트)를 맞대어 읽은 값이다.

> 확인 방법 메모: 앱 페이지에서 JavaScript 실행이 막혀 있어 `getComputedStyle`은 못 썼다. 대신 CSS 파일 원문을 읽었다.

## 1. 표면 (배경)

| 토큰 | 값 | 쓰임 |
|---|---|---|
| `--lobby` | `#141312` | 프로젝트 목록 · 로딩 화면 바탕 |
| `--shell` (= `--background`) | `#262624` | 스튜디오 본문 바탕 |
| `--side` (= `--sidebar`, `--chat-bg`, `--chat-summary`) | `#1f1e1d` | 왼쪽 사이드바 · 오른쪽 Lumi 패널 · 요약 카드 |
| `--canvas-bg` | `#1a1918` | Director 노드 캔버스 |
| `--card` (= `--muted`, `--chat-input`) | `#30302e` | 카드 · 입력창 |
| `--side-raised` (= `--chat-summary-cell`) | `#2a2927` | 요약 표 칸 |
| `--chip` (= `--accent`, `--border`, `--input`) | `#3a3936` | 칩 · 기본 테두리 |
| `--tab-selected` | `#34332f` | 선택된 탭 |
| `--sidebar-accent` (= `--border-subtle`) | `#2f2e2b` | 사이드바 선택 항목 |
| `--surface-elevated` | `#45443f` | 떠 있는 표면 |
| `--border-strong` | `#4d4b46` | 강한 테두리 |
| `--panel` | `#1e1b1c` | 패널 |
| `--landing` | `#0b0b0b` | 랜딩 |

## 2. 글자색

| 토큰 | 값 |
|---|---|
| `--foreground` | `#f5f4ee` |
| `--muted-foreground` | `#c2c0b6` |
| `--subtle-foreground` | `#8e8b82` |
| `--faint-foreground` | `#5c5a55` |
| `--primary` (크림 버튼) | `#edeae0` |
| `--primary-foreground` / `--on-stage` | `#1f1e1d` / `#141312` |
| `--lock-note` (비율 잠금 안내 글자) | `#d9967c` |
| `--mention` (산문 속 인물 이름) | `#8eb2ff` |

## 3. 채팅

| 토큰 | 값 | 쓰임 |
|---|---|---|
| `--chat-lumi-bubble` | `#2a2927` | 오른쪽 패널 Lumi 말풍선 |
| `--chat-my-bubble` | `#34332f` | 오른쪽 패널 내 말풍선 |
| `--chat-center-lumi-bubble` | `#34332f` | Producer 가운데 채팅 Lumi 말풍선 |
| `--chat-center-my-bubble` / `--chat-center-chip` | `#45443f` | Producer 가운데 채팅 내 말풍선 · 칩 |
| `--chat-send` | `#edeae0` | 보내기 버튼 |

## 4. 단계 색

| 단계 | `--stage-*` | 배지 그라데이션 `--stage-badge-*` | 배지 글자 |
|---|---|---|---|
| Producer | `#f2a33a` | `linear-gradient(90deg,#ea8a2c,#ffb84f)` | `#1f1e1d` |
| Writer | `#e8606f` | `linear-gradient(90deg,#b54b57,#ea707d)` | `#fff` |
| Artist | `#8b63e8` | `linear-gradient(90deg,#6c4db5,#9773ea)` | `#fff` |
| Storyboard | `#5a6ae6` | `linear-gradient(90deg,#4653b3,#6b79e8)` | `#fff` |
| Director | `#3e9be0` | `linear-gradient(90deg,#3079af,#51a5e3)` | `#fff` |
| Editor | `#2db39a` | `linear-gradient(90deg,#238c78,#42bba4)` | `#fff` |

`--pearl-vivid: linear-gradient(90deg,#f2a33a 0%,#e8606f 20%,#8b63e8 40%,#5a6ae6 60%,#3e9be0 80%,#2db39a 100%)`

## 5. 상태

| 토큰 | 값 |
|---|---|
| `--success` | `#14ae5c` |
| `--warning` | `#ffcd29` (Storyboard '연출 점검' 띠는 이 색을 옅게 깐 노란 띠) |
| `--info` / `--ring` | `#0d99ff` |
| `--destructive` | `#f24822` |
| `--state-video` | `#8f7ae0` |
| `--progress-track` | `#ffffff14` |
| `--edge-default` (노드 연결선) | `#fff3` |
| `--edge-selected` | `var(--stage-director)` |

## 6. 모서리 · 간격 · 글자

- `--radius: .75rem` (12px). `rounded-md` 10px · `rounded-lg` 12px · `rounded-xl` 16px · `rounded-2xl` 20px. 그 밖에 `rounded-[14px] [16px] [18px] [20px] [22px] [26px]`, 칩 · 배지 `rounded-full`.
- `--spacing: .25rem` (4px 단위). 자주 보이는 간격 `gap-1.5`(6px) · `gap-2`(8px) · `gap-3`(12px) · `p-4`(16px).
- 글자: `--text-xs` 12px · `--text-sm` 14px · `--text-base` 16px · `--text-2xl` 24px · `--text-3xl` 30px. 굵기 400 / 500 / 600 / 700.
- 기본 글꼴 `var(--font-pretendard)`, 숫자 · 영문 보조 `var(--font-inter)`.

## 7. 화면별로 캡처에서 읽은 배치 (1440 설계 기준으로 환산)

| 화면 | 관찰 |
|---|---|
| 사이드바 | 폭 약 74px, 위 8px · 왼쪽 8px 띄움, 모서리 16px, `--side`. 위에서 Producer · Writer · Artist · Storyboard · Director · Editor, 아래에 Takes(∞ 배지) · Share · Export · Help · 아바타. 지난 단계 아이콘 오른쪽 위에 흰 체크 동그라미. 선택 항목 배경 `#2f2e2b`, 모서리 12px. |
| 위쪽 바 | 단계 배지(그라데이션, 둥근 알약, 12px 600) + 작품 제목(14–15px 500) + 연필 아이콘. |
| Producer | 가운데 채팅(폭 약 510px). 맨 위 '지금까지 정한 것' 알약 줄: 장르와 분위기 · 길이 · 바꿀 정도 · 🔒 화면 비율, 묻는 항목은 단계색 테두리. 길이 · 비율 질문은 칩이 아닌 4칸 카드(제목 15px 700 + 설명 12px), 추천 카드에 'Recommended' 배지. 비율 질문에 '🔒 한 번 고르면 끝까지 못 바꿔요'(`--lock-note`). 마지막 요약 카드(`--side` 바탕, 줄 구분선)와 버튼 두 개 '네, 산문 쓰기'(크림) · '아니요, 더 고칠래요'. 오른쪽 위 '화면에서 고르기 / 채팅으로 만들기' 토글. |
| Writer | 제목 'Prose' 28px 700 + 'Scenes 2'. 버튼 '직접 쓰기' · 'AI 다시 쓰기' · 크림 'Run breakdown →'. 아래 '현재 산문 조건' 알약(길이 · 장르 · 원본 아이디어). 산문 카드 `--side`, 문단 번호 'S1 · S2', 본문 16px/1.75. 문단을 누르면 단계색 테두리(모서리 12px). AI 수정안은 원문에 취소선 + 아래 단계색 테두리 상자 '✦ AI proposal', 버튼 'Discard' · 크림 'Apply'. 오른쪽 패널 'Prose with Lumi', 입력창은 단계색 테두리. |
| Artist | 브레이크다운 목록(이름 + 'Person/Background' 칩 + 설명 + 'Reference +' 칸 + 'Edit description'). 스타일 고르기 모달: 4열 썸네일 격자, 아래 '이미지는 Take를 쓰지 않아요', 버튼 'Draw it in Live Action'. 결과: 'Characters · backgrounds' 제목, 탭 'All 3 · Characters 2 · Backgrounds 1', 인물 카드는 캐릭터 시트(얼굴 · 전신 앞옆뒤 · 디테일) + 'v1' 배지, 선택 카드 단계색 테두리. 버튼 크림 'Complete · to Storyboard →'. |
| Storyboard | 제목 'Storyboard' + 'Scenes 2 · Shots 4 · 15s'. 탭 'Rough storyboard · Dialogue', '+ Add scene', '+ Add shot'. 노란 '연출 점검: 검토할 4가지' 띠. 씬 머리 'Scene 1 · Outskirts bus stop · Night'. 샷 카드(약 316px 폭): 'Scene 1 · Shot 1 · 4s', 연필 러프(마네킹 스케치), 설명 13.5px, 대사 한 줄, 칩 'WS · Eye-level · Static · 5500K'. 그리는 중 카드: Lumi + 'Drawing the rough'. |
| Director | 위 '스토리보드 · 노드' 토글, 'Rough · Real' 토글, 'The Set', 'N videos · about N min · N Takes' 알약, 크림 '▶ Make videos · N'. 'Every shot here already has an image.' |
| Director 노드 | 캔버스 `--canvas-bg`, 노드 `--background` + `--border`. 이미지 노드 이미지 왼쪽 위 'Live-action' 표, 아래 상태줄(Image needed · Image ready · Making video · Video done). 영상 만드는 중인 노드는 보라 테두리(`--state-video #8f7ae0`), 영상 노드는 Lumi + 'Making the video · Shot 1 · 4s · Up next: Shot 4 · ■ Stop making'. 끝나면 초록 테두리(`--success`)와 '✓ Complete' 파란 배지, 재생 시간 '▶ 0:04'. 고른 노드의 연결선은 파란 점선(`--stage-director`). |
| Editor | 'Edit · Export' 탭, 'Sequence 01 · 00:00:15:00 · 1280×720 · 30fps'. 왼쪽 위 Source/Effect controls, 오른쪽 위 Program 모니터(재생 바 · 타임코드), 아래 Project 목록(Director shots · 4), 도구(선택 · 자르기 · 글자), V1–V3 · A 트랙 타임라인(클립에 WS · MS · CU · 2S 표). 내보내기는 'Video file · Draft Render'와 'Shot ZIP'. |

## 8. 문구 (앱 영어 UI 그대로 → 랜딩 한국어)

| 앱 | 랜딩에서 쓰는 말 |
|---|---|
| What we have decided so far | 지금까지 정한 것 |
| Genre and mood / Length / Change level / Screen ratio | 장르와 분위기 / 길이 / 바꿀 정도 / 화면 비율 |
| Yes, write the prose / No, I want to edit more | 네, 산문 쓰기 / 아니요, 더 고칠래요 |
| Prose · Write directly · AI rewrite · Run breakdown | 산문 · 직접 쓰기 · AI 다시 쓰기 · 브레이크다운 |
| AI proposal · Discard · Apply | AI 수정안 · 버리기 · 적용 |
| Which style should we draw it in? · Images do not use Takes. | 어떤 스타일로 그릴까요? · 이미지는 Take를 쓰지 않아요 |
| Complete · to Storyboard | 완료 · Storyboard로 |
| Drawing the rough | 러프를 그리고 있어요 |
| Make videos | 영상 만들기 |
