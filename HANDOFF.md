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
  - 레드 `#F0303F` · 코랄(선택 표시) `#FF6B57` · 메인 버튼 그라데이션 `#FF6A4D → #F0303F → #B0123C`
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
- 페이지: Components · **Producer v2**(1안 E1~E5, 2안 EB1~EB7) · **Writer v2**(W1 · W1r · W2 · W4~W6 · W1 채팅 접힘, W3 다시 쓰기 옵션은 뺌 · WC2 · WC3 · WP · WN) · **Artist v2**(A0~A9 · WT · WTm · R1 · R2 · AC2 · AC3 · AX · AY · AR · AV) · **Storyboard v2**(S0~S8 · S3c · SG · SM · R3 · S7) · v2 시안(이전 참고용). W1 Writer · Producer 진입 페이지는 삭제(2026-10-27)
- 정한 것
  - 배치: 왼쪽 사이드바(홈 → 단계 진행 → 도구) → 작업 화면(대시보드) → 채팅(오른쪽)
  - **패널 분리**: 바깥 bg/shell(#040303). 가운데 작업 화면은 따로 상자 없이 바탕 그대로. 왼쪽 사이드바는 bg/side 둥근 패널(여백 8 · 모서리 16). 오른쪽 채팅은 위 · 아래 · 오른쪽 여백 없이 화면 끝까지 꽉 차고, 작업 화면과는 왼쪽 8 틈 + 왼쪽 모서리만 16
  - **포인트 변수 나눔**: 레드 = 메인 버튼 · 선택 / 사이드바 현재 단계 바탕 = bg/nav-active(흰색 5%) / Lumi 이름 · ✦ 판단 근거 = text/lumi(라벤더 #B9A3F0) / @인물 · 씬 번호 = text/ref(스카이 #8EC3F0) / 경고(🔒 · 바꿀 수 없어요)는 코랄 그대로
  - 채팅 패널 머리 오른쪽에 접기 버튼(v2/Chat Toggle, » 접기 / « 펼치기). 접으면 56px 레일에 펼치기 버튼 + Lumi 아바타 + 새 메시지 점(예시: Writer v2 'W1 · 채팅 접힘')
  - **채팅 층 구분**: 패널 bg/side #181415 → Lumi 말풍선 bg/bubble #211B1D → 채팅 안 칩 · 버튼 bg/chat-chip #342C2F / 내 말풍선 bg/mine #3A3134 / 입력창 bg/input #0F0C0D(패널보다 어둡게). Lumi 아바타는 바탕 빛 없이 이미지만
  - Lumi 말풍선 앞에는 항상 Lumi 아바타(v2/Lumi Avatar 28px). v2/Chat · Lumi · Lumi Ask 컴포넌트에 포함
  - **보라 포인트(로고 색)**: 상단 단계 배지(Producer · Writer …)는 Gradient/Stage(#8A3E86 → #5B4BB0) + 흰 글자. S1 · S2 · @인물 태그는 text/ref = 로고 보라(#9B7CE8). 나머지 포인트는 레드 그대로
  - 사이드바 홈 자리는 T 이니셜(t + 별), 흰색 100% → 60% 세로 그라데이션(Gradient/Icon Current · White). 현재 단계 아이콘도 같은 그라데이션, 현재 단계 바탕 bg/nav-active = 흰색 5%. 지난 단계 완료 배지는 Gradient/Done(#FF5C66 → #E0303F)
  - 연필 · 화면에서 고르기 · 채팅으로 만들기 아이콘은 채움 아이콘(icon-fill/pencil · list · chat). 직접 작성 · 직접 고치기는 icon-fill/draw(손글씨 펜), 버튼은 Secondary 바탕
  - 아이콘은 선 없이 채움만. 공유 · 내보내기는 통통한 화살표 + 알약 받침으로 다시 그림(마스터 시트 버튼도 같은 아이콘)
  - 사이드바 아이콘은 Tale 전용 채움(Filled) 아이콘. 지금 단계만 Lumi 그라데이션(코랄 → 라벤더), 지난 단계는 ✓ 완료 배지
  - 일반 카드 · 칩에는 테두리를 쓰지 않아요. 구분선도 여백으로 대신해요
  - **포인트(단계 배지 · 스텝퍼 현재 단계)는 더 진한 bg/point = red/800.** **모드 토글 켜진 쪽(화면에서 고르기 · 채팅으로 만들기)은 bg/toggle-on = 흰색 20%(white/a20), Light는 black/a08.** **대시보드 선택 · 강조는 다크 레드 바탕(bg/select → red/900 #4A1F27) + 레드 그라데이션 선(Stroke/Select: 코랄 #F2A08A 60% → 레드 #DC4B55 100%). 선택 안 된 칩 · 카드는 #2B2526 40%**. '추천' · '지금' 배지는 레드 그라데이션 바탕(Gradient/Primary) + 흰 글자. **테두리 선은 선택된 칩 · 선택 카드(W4 세 가지 안 포함)에만** 쓰고, 단계 알약 · 머리 배지 · 진행 표시줄 · Lumi 질문 카드 · 안내 띠 · 강조 줄은 바탕색만 써요. 사이드바 현재 단계는 카드 바탕(bg/raised)만
  - 레드 그라데이션은 메인 버튼(한 화면에 하나) · 보내기 버튼 · 추천 배지에만 써요. 내 말풍선은 회색(ink/800)
  - 레드 채도를 낮췄어요: 레드 #DC4B55 · 코랄 #EC8676 · 그라데이션 #EE9078 → #DC4B55 → #9E3348. 라벤더 #B9A3F0 추가
  - 배경에 Lumi 색이 은은하게 번지는 분위기, 큰 입력 카드, 예시 카드
  - Lumi는 빛 번짐 없는 밝은 버전을 써요. 채팅 아바타 28px
- 남은 것
  - 글꼴: 한글 · 영문 모두 Pretendard, 숫자는 Inter(Number/Tag · Number/Meta) — 모든 페이지에 적용됨
  - 로고 미정(임시 컴포넌트), Lumi 상태 17종 컴포넌트화(키 포즈 PNG는 Lumi 상태 17종 아티팩트의 keyposes/)
  - Director · Editor 단계
  - Components 페이지는 섹션 8개(Logo · Icons 채움 · Icons 선 · Navigation · Controls · Chat · Content · 보관)로 정리, 이름은 그룹/이름(Control/Choice Chip, Chat/Lumi …). 안 쓰는 이전 컴포넌트 26개 삭제
  - 개발 공유 가이드(Claude Docs): https://claude.ai/artifact/DZQeNYVBJdM8t98sPPq5B6

## 참고 링크 (owner만 열림)
- 플로우 · 프로토타입: https://claude.ai/artifact/C5xmoMhBQq9Juh3AeTP4Z2
- 디자인 시안(로고 · 캐릭터 · W1 시안 · 기준): https://claude.ai/artifact/SXpdWww154q9pB9HMStn8w
- Lumi 원본 에셋: https://claude.ai/artifact/MpbM4C24A8nLUN1m9zt9ZN
- **Lumi 상태 · 움직임(기준)**: https://claude.ai/artifact/LbhbVTNxmxQLcq8WyPzAc1

## v3 시안 (2026-10-29, 진행 중)
- 방향: 레드 포인트를 걷어내고 Claude처럼 톤다운된 따뜻한 무채색. 눈이 덜 피로하게
- Figma 페이지 "v3 시안 (Claude 톤)": E3 · W1 · A5 · S1 복사본 + v3 Palette 보드. v2 페이지는 그대로
- 변수: Color 컬렉션에 모드 "Dark v3" 추가(바탕 #262624 · 사이드 #1F1E1D · 카드 #30302E · 글자 #F5F4EE). 새 컬렉션 "Stage"(모드 Producer · Writer · Artist · Storyboard · Director · Editor)에 stage/accent · tint · tint-strong · on-accent
- 메인 버튼 · 보내기는 크림 #EDEAE0(v3/Fill/Primary · Cream) + 진한 글자. 선택 = stage/tint 바탕 + stage/accent 테두리. 단계 배지 · 추천 배지 · 현재 단계 아이콘 = stage/accent
- Lumi는 무채색(이미지 채도 -100). 단계마다 페르소나 색: Producer 앰버 #D4A35F · Writer 세이지 #93B48B · Artist 클레이 #D98E7E · Storyboard 페리윙클 #8EA5D8 · Director 라일락 #A898D8 · Editor 틸 #6DB2AB
- 그림 자리는 무채색 그라데이션(#4D4B46 → #2E2D2A)으로 임시
- **브랜드 색 = 완성된 Lumi의 진주빛(Pearl Vivid)**: #FFB547 → #FF6A4D → #A066FF → #4F86FF → #22C3B5 → #3DCB7A. 검정 위 로고 · 홈 헤드라인 · 앱 아이콘 · 완성 순간에만. 광택 버전은 위 45%에 흰색 45% → 0% 겹침(v3/Gradient/Pearl Vivid · 광택). 앱 안 기능 색은 크림 + 단계 페르소나 색(톤다운)
- v3 페이지: v3 · Logo Study(워드마크 2종 · 앱 아이콘 2종), v3 · Home 예시(talestudio.art 히어로에 적용)
- **로고 확정(v3)**: 심볼 `Logo/Tale Symbol`(리본 두 겹이 책 두 권처럼 쌓인 모양. 모든 모서리 완전히 둥글게. 위 책 = Producer · Writer · Artist #FFA600 → #FF3D5A → #7B2FFF, 아래 책 = Storyboard · Director · Editor #2F45FF → #0096FF → #00C9A7(둘 다 사선 흐름), 두 책이 겹치는 곳 = 빛 섞임(위 책 색 스크린 90%, 핑크 · 마젠타로 빛남) — 최종 확정 2026-11-03. 비교안은 v3 페이지 보드에) + 흰 글자 "tale studio" = `Logo/Tale Lockup`. 사이드바 홈 자리 · 홈 예시 로고 교체. SVG · 설명: brand/ (README.md에 도출 과정 · 색 이유). 밝은 바탕용 Theme=Light 추가, 다른 로고 시안은 모두 삭제(2026-11-02)
- **단계 포인트 색(선명, Pearl 순서와 일치 · Figma · Google식 2026-11-01)**: Producer #F2A33A · Writer #E8606F · Artist #8B63E8 · Storyboard #5A6AE6 · Director #3E9BE0 · Editor #2DB39A (어두운 화면용으로 채도를 누른 UI 색, 2026-11-03. 로고는 딥 디지털 그대로). 단계별 그라데이션 스타일 v3/Stage/<단계>
- **시스템 색(Claude · Figma처럼 담백)**: 무채색 바탕 · 크림 메인 버튼 + 상태 Info #0D99FF · Success #14AE5C · Warning #FFCD29 · Danger #F24822 (변수 system/*)
- v3 페이지 "Brand Guide v3" 보드: 로고 변형 설명 · 브랜드 그라데이션 · 단계 색 · 시스템 색 · 쓰는 규칙
- **Lumi 페르소나 브리프**: mascot/LUMI_PERSONA_BRIEF.md (Claude Docs: https://claude.ai/artifact/QZ7SKMMCXcxoizU2WngSD8). 화이트 펄 → 단계별 색 · 소품 → 완성 컬러 진주빛 Lumi, 채팅창 가이드 포함
- **v3 페이지 정리(2026-11-02)**: 섹션 01 브랜드 가이드(로고 구조 카드 4장 · 로고 쓰는 법 · 브랜드 그라데이션 · 단계 색 · 시스템 색 · 규칙) / 02 화면 시안(홈 + E3 · W1 · A5 · S1) / 03 로고 · 색 작업 과정(비교안 아카이브)
- **메인(랜딩) 시안 2종(2026-11-03)**: v3 페이지 섹션 04. A = 제품이 주인공(Ponder형: 왼쪽 정렬 큰 헤드라인 + 실제 앱 창 + 여섯 단계 + 마지막 CTA), B = 바로 만들기(Seedance형 입력창 히어로 + WowMade형 결과 카드 부채꼴 + 단계별 Lumi 타임라인). 레퍼런스: wowmade.ai · ponder.ai · seedance25ai.im
- **포인트 색 최소화(2026-11-03)**: 단계 색은 ① 상단 단계 배지 · 지금 단계 스텝퍼(그라데이션 v3/Stage Badge/<단계>, 흰 글자) ② 사이드바 현재 단계 아이콘 ③ 선택 칩 · 카드 테두리에만. 완료 ✓ · 체크는 흰색(#F5F4EE), S1 · S2 씬 번호는 text/primary 흰색, @인물 태그(text/ref)는 밝은 파랑 #8EB2FF
- **메인(랜딩) HTML 제작 가이드**: LANDING_BRIEF.md (새 채팅에서 코드로 제작할 때 읽기)
- **Producer 그라데이션 정리(2026-11-03)**: 갈색으로 탁하던 어두운 끝을 맑은 주황으로. `v3/Stage/Producer` #E98B2A → #F2A33A → #FFC36B, `v3/Stage Badge/Producer` #EA8A2C → #FFB84F (대표 색 #F2A33A는 그대로)
- **Director · Editor 대표 화면 추가(2026-11-03, v3 페이지 "02 화면 시안")**: `v3 · D1 · Director 노드 캔버스 (The Set)`(221:222) — 점 격자 캔버스에 인물 · 배경 · 샷 · 영상 노드, 입력 포트(프롬프트 · 이미지), 연결선(선택 노드만 Director 색), 줌 · 미니맵, 툴바(노드/스토리보드 · 스토리보드 생성 · 영상 생성 · 안 쓴 에셋 · 자동 정렬 · 프롬프트 노드). `v3 · ED1 · Editor 타임라인`(224:222) — 소스(영상 7 · 오디오 0) · 미리보기(영상 없는 컷은 설명 카드) · 타임라인(선택/자르기 · 타이틀 카드 · 재생 · 줌 · 전체 보기 · 샷 ZIP · 초안 렌더, 영상 · 오디오 트랙). 둘 다 S1을 복제해 사이드바 · 헤더 · Lumi 채팅 틀을 그대로 씀
- **D1 Director 전체 화면으로 다듬음(2026-11-03)**: 채팅 패널을 접고(캔버스 오른쪽 위 "Lumi" 알약으로) 노드 캔버스를 화면 끝까지 넓힘. 툴바는 캔버스 위에 떠 있는 알약(왼쪽 노드/스토리보드 · The Set, 가운데 생성 버튼, 오른쪽 에셋 · 정렬 · 프롬프트 노드 · Lumi), "다음: Editor로"는 헤더 오른쪽. 노드 9개(인물 2 · 배경 1 · 샷 4 · 영상 2) 4열 배치, 줌은 왼쪽 아래 가로 알약, 미니맵은 실제 노드 위치 반영
- **단계별 Lumi 적용(2026-11-03)**: Lumi 성장 흐름 아티팩트(https://claude.ai/artifact/LJEHRV9HcAzUsrJhbhVsrd)에서 몸 + 눈을 합쳐 8장 추출 → `mascot/personas/lumi-<단계>.png`(640×495 투명). Figma v3 페이지에 보드 "Lumi 페르소나 · 단계별", E3 · W1 · A5 · S1 · D1 · ED1의 Lumi 자리(채팅 머리 · 아바타 · D1 Lumi 버튼)를 그 단계 Lumi로 바꾸고 흑백 필터 제거. 주의: 아티팩트의 Director(청록) · Editor(초록) 색이 UI 단계 색(#3E9BE0 · #2DB39A)과 다름, 소품 없음
- 채팅 보내기 버튼 화살표가 크림 바탕에 흰색이라 안 보이던 것 → #141312로
- **로고 뜻 바로잡음(2026-11-03, 사용자 설명)**: "리본 · 책 두 권"이 아니라 **반쪽 T + 이야기 꼬리**. Tale = tail(소리가 같음) → 이야기의 꼬리를 잡아 시작한다. Lumi도 같은 꼬리를 가진 AI로 생성됨. T = 앞 세 단계, 꼬리 = 뒤 세 단계, 겹친 곳 = T가 꼬리로 이어지는 자리. brand/README.md · LANDING_BRIEF.md · LUMI_PERSONA_BRIEF.md · Figma 브랜드 가이드(157:680 · 199:722 단계 카드 · 색 설명) 모두 수정
- **헤드라인 글자 그라데이션(2026-11-03)**: Home 예시 "Pre-visualization." 무지개(브랜드 6색) → 기본 그라데이션 `v3/Gradient/Text · 기본`(#FFFFFF → #9E9B92). LANDING_BRIEF에 `--text-gradient`로 반영
- **로고 변형 시안(2026-11-04)**: Components 페이지 위쪽 보드 2개 — "T + 꼬리 하나로"(A ⊏ · B ㅁ · C 둥근 네모 · D 원형), "책 (사용자 스케치 정리)"(E 정사각 · 끝 반원 · 왼쪽 아래 물방울 / F 바깥 모서리 덜 둥글게 / G 모든 모서리 작게). 확정 로고는 그대로. 사용자 스케치 원본은 Components 페이지 "현재 확정"(285:256)
- **1104 리뷰 반영 (리뷰 PDF 1–7쪽)** — v3 페이지 섹션 "04 1104 리뷰 반영": R1 로그인 · R2 프로젝트 목록 · R3 새 프로젝트(화이트 Lumi가 묻는 팝업 → "처음부터 만들기"면 바로 P1) · R4 이어 만들 화 고르기 · R5 불러오는 중 · R6 확인 · P1 Producer 첫 화면(채팅 가운데, Producer Lumi) · P2 대화 → 요약 → 공통 버튼 · WL Writer 고치는 중(Lumi 로딩 카드) · WS Writer AI 수정안(포인트 색 Writer 하나, 되돌리기/적용 버튼 통일) · AS Artist 스타일 팝업(Artist Lumi가 묻는 형식) · AR 다시 그리는 중(카드 상태 + Lumi 알림)
- **공통 컴포넌트(Components 페이지 "Stage Actions · AI 아이콘")**: `Control/Stage Confirm`(Stage=Producer…Editor, "좋아요, ○○로" + "아니요, 더 고칠래요"), `icon-fill/ai`(Lumi 실루엣, ✦ 대신), `icon-fill/ai-rewrite`(Lumi + 다시 하기 화살표)
- **로고 최종 확정(2026-11-04): 책 1번(E)** — 정사각 하나에 반쪽 T(위 · 왼쪽)와 꼬리(아래)가 절반씩, 끝은 모두 반원, 왼쪽 아래 물방울(screen 90%). Components의 `Logo/Tale Symbol`(Dark · Light)을 교체 → Lockup · 모든 화면 자동 반영(옛 레이어는 지울 수 없어 "(구버전 · 숨김)"으로 숨김). brand/ SVG 4개 · 미리보기 · README 갱신
- **팝업 시스템(2026-11-04, 사용자 R3 수정값 기준)**: 팝업 너비 520(넓은 것 748) · 여백 위아래 50 · 양옆 30 · 블록 간격 20 · 제목 묶음 15 · 모서리 22 · X 24px(위 13 · 오른쪽 23) · 간격 10 → 15. 로딩 팝업(WL 기준): 너비 372 · 여백 50/30 · 간격 15 · 모서리 20 · Lumi → 제목 → 설명 → 단계 → 진행 막대. Lumi 크기 XL 150 · L 100 · M 78 · S 56 · XS 36. 섹션 04의 "SYS · 팝업 · 로딩 · Lumi 크기 규칙" 보드
- 적용: R4 · R6 · AS · 로그인 카드 = 팝업 기준, R5 · AR = 로딩 카드, R2 = 검색 + 정렬(최신순 · 오래된순 · 이름순 · 단계순), **DG Director 영상 만드는 중**(영상 생성 버튼 Director 그라데이션 활성 · 한 번에 한 노드만 노드 위 로딩 · 다 된 노드 "✓ 완성" 배지 + 재생 썸네일 · 나머지는 그대로)
- **여백 · 행간 넓힘(2026-11-04)**: 같은 묶음 글자 사이 4~5 → 9, 본문 글(16px 이하 · 긴 문장) 행간 155%, 채팅 말풍선 여백 22/18(내 말풍선 20/14) · 메시지 사이 20~28 · 칩 16/10 · 입력창 64, 팝업 선택 줄 20/18 · 목록 줄 16/14 · 요약 줄 11. R3~R6 배경을 최신 R2(검색 · 정렬)로 교체. P2는 대화가 입력창 위로 붙고 위쪽은 스크롤 흐림
- **DG 다듬음(2026-11-04)**: 샷 · 영상 노드 모두 240×264로 통일(그림 칸이 남는 높이를 채움, 새 샷은 점선 빈 칸) · 연결선 다시 그림. 완성 표시는 기존 "● 완료"로 통일하고, 다 된 영상 노드만 Director 색 테두리 + 네온 그림자로 강조. "영상 만드는 중 · 2/8" 버튼은 다른 버튼과 같은 크기, Director 그라데이션 + 네온 그림자. 만드는 중 로딩은 그 노드 크기 그대로 덮음
- **컴포넌트 원본 정리(2026-11-04)**: `Nav/Sidebar Item` 완료 배지 빨강 → 크림 #F5F4EE + 진한 체크, 현재 단계 아이콘 흰 그라데이션 → `stage/accent` 변수(화면의 Stage 모드 색을 따라감). 사이드바 컴포넌트 6종(Producer~Editor, Director · Editor 새로 추가) 상태 정리. `icon-fill/ai` · `icon-fill/ai-rewrite`를 24px로 다시 그려 "Icons · 채움"에 넣음(화면 안 인스턴스는 16px 유지). Chat/Lumi 말풍선 여백 22/18 · 간격 12
- **규칙 점검(2026-11-04)**: 섹션 02 · 04 · Components 전체 — 팝업 여백 · 간격 · 모서리, 로딩 카드 너비 372(R5 408 → 372), Lumi 크기(P1 170 → 150), 버튼 높이 34(D1 영상 생성 버튼 38 → 34, 행간 때문), 글자 묶음 간격 9, 본문 행간 155% 모두 확인. 노드 위 로딩(DG)만 규칙 S 크기 변형
