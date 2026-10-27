# Tale Studio 리뉴얼 — 새 세션 인계

이 문서만 읽으면 이어서 작업할 수 있게 정리했어요.

## 다음 할 일
**W1 Writer 작업 화면을 Figma에 편집 가능한 레이어로 만들기.** 대표 화면 하나를 먼저 완성하고, 그 컴포넌트로 나머지 화면에 반영해요.

1. Figma 새 파일 "Tale Studio 리뉴얼"을 만들어요. 팀은 "싹수의 일상의 팀"이에요.
2. Variables(색 · 글자 · 간격 · 모서리)를 만들어요. 어두운 모드가 기본이에요.
3. 컴포넌트를 만들어요.
   - 버튼 3단계
   - 칩 · 선택 카드: 선택 표시는 하나로 통일
   - 단계 표시줄: 지난 단계는 ✓ 완료
   - 채팅: 말풍선 · 입력창 · Lumi 아바타
   - 산문 카드
4. W1 화면을 조립하고, 같이 보면서 다듬어요.
5. 확정되면 Producer → Artist → Storyboard 순서로 반영해요.

## 저장소
- 브랜치 `claude/cool-goodall-wury8h`
- `flow.html` · `index.html` · `src/`: 플로우와 프로토타입. 화면 ID는 E1 · W1 · A1 · S1 … 이에요.
- `src/screens.js`: 화면 구성과 문구의 원본
- `mascot/`: Lumi 캐릭터 에셋과 컴포넌트. `README.md`를 보면 돼요.
- `dist/`: 전달용 단일 HTML

## 정해진 것
- **단계**
  - Producer → Writer → Artist → Storyboard 순서로 넘어가요.
  - 지난 단계는 잠금이 아니라 "완료"예요. 앞 단계로 다시 동기화하지 않아요.
  - Artist ⇄ Storyboard는 오가며 고쳐요.
- **디자인 방향**: B안 크리에이티브 툴형이에요. 어두운 작업대 위에 결과물이 떠 있고, 강조는 레드 그라데이션이에요.
  - 작업대 `#0C0A0B` · 패널 `#151213` · 카드 `#1D191A` · 글자 `#F5EEEE` · 보조 글자 `#A0938F`
  - 레드 `#F0303F` · 코랄(선택 표시) `#FF6B57` · 메인 버튼 그라데이션 `#FF7A5C → #F0303F → #B0123C`
  - 메인(레드) 버튼은 한 화면에 하나만 써요. 다음 단계로 가는 버튼이에요.
  - 선택 표시는 모든 화면에서 같아요: 코랄 테두리 + 옅은 레드 바탕
  - 글자: 제목 Archivo ExtraBold, 본문 IBM Plex Sans KR, 산문은 16px · 행간 1.85
- **로고**: 타이포 "Tale Studio" 옆에 심볼을 둬요. 심볼은 책 모양(높이가 다른 아치 두 개)에 레드 그라데이션을 입히고, 몸통 오른쪽을 AI 별 모양으로 뚫어요. 가장자리는 살짝 번져요.
- **캐릭터 Lumi**: 받은 고해상도 이미지를 그대로 써요. 에셋은 `mascot/assets/`에 있어요. 다른 작업에서 캐릭터 md가 오면 그쪽을 우선해요.
- **Lumi 상태**
  - 공통: 기본 · 듣는 중 · 생각 중 · 완료 · 오류
  - 단계별 생성 중: 읽는 중(E2) · 쓰는 중(E5) · 고치는 중(W2) · 그리는 중(A4) · 연출 중(S0)
  - 특별한 순간: 인사 · 제안 · 물어보기 · 찾는 중 · 되돌리기 · 다음 단계로 · 살짝 알림
  - 1차로 만들 것: 공통 5개 + 쓰는 중 + 연출 중

## 아직 정할 것
- 채팅 위치: 왼쪽 / 오른쪽. 시안은 왼쪽이고 프로토타입은 오른쪽이에요.
- Producer · Writer 1안(화면에서 고르기) / 2안(채팅으로 만들기) 중 무엇으로 갈지
- Lumi 눈 · 꼬리를 따로 움직일 레이어 에셋, 그리고 3D(Spline) 제작 여부

## W1에서 이미 찾은 디자인 문제 (Figma에서 같이 고치기)
1. 산문 · 채팅 영역이 화면 끝까지 차지 않아요.
2. 문단 골라 고치기(WC3)에서 보내기 버튼이 잘려요.
3. 상단 버튼 세 개가 경쟁해요. 브레이크다운하기만 강조해야 해요.
4. "지금 산문 조건" 줄이 약해요. 칩으로 정리해야 해요.
5. 선택 표시가 화면마다 달라요.
6. 칩 높이가 들쭉날쭉해요.
7. 채팅 버튼이 가로 · 세로로 섞여 있어요.
8. 수정안 비교(W4)에서 바뀐 부분이 안 보여요.

## Figma 진행 (2026-10-26)
- 파일: https://www.figma.com/design/X3F0vvX6w4ZLARa0DyLspr (팀 "싹수의 일상의 팀")
- 페이지: Components · **Producer v2**(1안 E1~E5, 2안 EB1~EB7) · **Writer v2**(W1 · W1r · W2~W6 · WC2 · WC3 · WP · WN) · **Artist v2**(A0~A9 · WT · WTm · R1 · R2 · AC2 · AC3 · AX · AY · AR · AV) · **Storyboard v2**(S0~S8 · S3c · SG · SM · R3 · S7) · W1 Writer · v2 시안 · Producer 진입(v1 참고용)
- 정한 것
  - 배치: 왼쪽 사이드바(홈 → 단계 진행 → 도구) → 작업 화면(대시보드) → 채팅(오른쪽)
  - 사이드바 아이콘은 Tale 전용 채움(Filled) 아이콘. 지금 단계만 Lumi 그라데이션(코랄 → 라벤더), 지난 단계는 ✓ 완료 배지
  - 일반 카드 · 칩에는 테두리를 쓰지 않아요. 구분선도 여백으로 대신해요
  - **선택 · 강조는 다크 그레이 바탕(bg/select = ink/750 #2A2425) + 레드 그라데이션 선(Stroke/Select: 코랄 #F2A08A 35% → 레드 #DC4B55 90%)**. 레드 바탕은 쓰지 않아요. Lumi 질문 카드와 강조 띠도 같은 방식. 사이드바 현재 단계는 예외로 카드 바탕(bg/raised)만
  - 레드는 메인 버튼(한 화면에 하나)과 보내기 버튼에만 남겨요. 내 말풍선은 회색(ink/800)
  - 레드 채도를 낮췄어요: 레드 #DC4B55 · 코랄 #EC8676 · 그라데이션 #EE9078 → #DC4B55 → #9E3348. 라벤더 #B9A3F0 추가
  - 배경에 Lumi 색이 은은하게 번지는 분위기, 큰 입력 카드, 예시 카드
  - Lumi는 빛 번짐 없는 밝은 버전을 써요. 채팅 아바타 28px
- 남은 것
  - 글꼴: 한글 · 영문 모두 Pretendard, 숫자는 Inter(Number/Tag · Number/Meta) — 모든 페이지에 적용됨
  - 로고 미정(임시 컴포넌트), Lumi 상태 17종 컴포넌트화(키 포즈 PNG는 Lumi 상태 17종 아티팩트의 keyposes/)
  - Director · Editor 단계
  - 공통 컴포넌트(Components 페이지의 v2/…): Badge · Choice Chip · Option Card · Chat · Me · Chat · Lumi · Chat · Lumi Ask · Loading Card · Art Placeholder. 화면의 칩 · 선택 카드 · 말풍선은 이 인스턴스로 바꿔 둠

## 참고 링크 (owner만 열림)
- 플로우 · 프로토타입: https://claude.ai/artifact/C5xmoMhBQq9Juh3AeTP4Z2
- 디자인 시안(로고 · 캐릭터 · W1 시안 · 기준): https://claude.ai/artifact/SXpdWww154q9pB9HMStn8w
- Lumi 원본 에셋: https://claude.ai/artifact/MpbM4C24A8nLUN1m9zt9ZN
