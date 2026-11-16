# reference-app — 실제 앱 캡처 (2026-11-16)

talestudio.art에서 새 프로젝트 **Under the Same Umbrella**(16:9 · 15초 이하 · 로맨스 · 실사)를 처음부터 만들며 찍은 화면이다.
랜딩의 `src/appsim.*`(한 줄의 여정)와 `src/vignette.*`(왜 Tale)를 이 캡처와 `tokens.md` 값에 맞췄다. 캡처 이미지는 페이지에 넣지 않는다.

- 화면 크기: 1440×900으로 창 크기를 바꿨지만 브라우저가 따르지 않아, 실제 캡처는 뷰포트 1680×816을 1568×762로 줄인 것이다.
- 형식: 확장 프로그램 스크린샷(JPEG)을 PNG로 옮겨 저장했다. 화면에 이메일 · 계정 정보는 보이지 않았다(아바타 'A'만 보임).
- GIF(`producer-8-산문쓰기.gif`, `writer-8-AI에게쓰기.gif`, `storyboard-9-다시그리기.gif`, `storyboard-10-프레임다시그리기.gif`)는 Chrome 다운로드로만 내보낼 수 있어 Mac의 다운로드 폴더에 있다.

## 단계별 파일

| 단계 | 파일 |
|---|---|
| Producer | 채팅 첫 화면 → 분석 중 → 장르 칩 → 길이 카드 → 바꿀 정도 → 비율 카드 → 요약 카드 (`producer-1` … `producer-7`) |
| Writer | 산문 쓰는 중 → 산문 → 전체 수정안 → 문단 선택 → 문단 수정 중 → AI 수정안 적용 전 · 후 → 산문 확정 (`writer-1` … `writer-9`) |
| Artist | 브레이크다운 목록 → 산문 재확인 → 목록 정리 → 인물 · 배경 목록 → 스타일 고르기 → 그리는 중 → 인물 시트 → 배경 (`artist-1` … `artist-8`) |
| Storyboard | 러프 그리는 중 → 2컷 → 4컷으로 정리 → 다시 그리는 중 → 컷 그리드 → 컷 편집 (`storyboard-1` … `storyboard-6`) |
| Director | 넘어가기(비용 안내) → 노드 화면(오류) → 노드 화면 + Lumi → 이미지 만드는 중 (`director-1` … `director-4`) |

## 막힌 곳

1. **Director 이미지 생성 실패**: Storyboard → Director로 넘어가자 `Character appearance contract error: shot sh_01_01 character_appearance_keys does not match its characters` 토스트가 뜨고, '이미지 만들기'(상단 버튼 · Lumi 칩 · 샷 하나만 골라서)를 세 번 눌러도 0/4에서 다시 '이미지 필요'로 돌아온다. Artist에서 'Young Man → Dohyun', 'Young Woman → Seoyun'으로 합친(merge) 별칭이 원인으로 보인다. 이미지가 없어 '영상 만들기'가 꺼져 있으므로 영상 · Editor 단계는 진행하지 못했다.
2. Producer에서 '로맨틱 코미디'를 글로 쓰면 '일상(Slice of life)'으로 잡혀, 위 칩에서 '로맨스'로 직접 바꿨다(코미디 + 로맨스를 함께 고를 수는 없다).
3. 첫 산문이 한 줄 아이디어만 보고 영어로, 인물 이름 없이 나왔다. 채팅으로 인물 · 배경 · 4문단을 주고 다시 쓰게 했다(UI 언어가 English라 산문도 영어).
4. Writer에서 S2 한 문단만 골라 '조금 더 설레게'를 했는데 수정안은 S1 · S2 둘 다 바뀌었다.
5. Artist 브레이크다운에 옛 산문의 인물 · 배경(Young Man, Young Woman, Splash Hazard Boundary, Umbrella Canopy Microcosm)이 남았고, 오른쪽 Lumi는 "목록이 비어 있다"고 답했다. '빠졌거나 겹친 항목' 재확인 창에서 합쳐 정리했다.
6. Storyboard가 처음엔 2샷(8초 + 7초)으로 나와, 채팅으로 4샷(4 · 4 · 3 · 4초)으로 다시 나눴다. 새 샷은 러프 없이 추가돼 '러프 다시 그리기'를 따로 눌러야 했다.

## Take

쓴 Take는 0이다. 앱 안내 기준 이미지 · 러프는 Take를 쓰지 않고, 영상은 샷당 5 Takes(4샷이면 20 Takes)다.
