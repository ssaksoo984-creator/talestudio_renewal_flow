# Tale Studio 메인 페이지 · 이미지 / 영상 제작 계획

이 문서는 메인 페이지 두 시안에 있는 **이미지 자리**에 무엇을 채울지, Claude에게 **어떻게 시키면 되는지** 정리한 거예요.
- 밝은 버전 `dist/TaleStudio_메인_밝은.html` (원본 `landing/index.html`) — Runway 결
- 어두운 버전 `dist/TaleStudio_메인_어두운.html` (원본 `landing/dark.html` · `src/dark.css` · `src/dark.js`) — Artlist · OpenArt 결, 구성이 달라요. stageshow · React 없이 손으로 만든 페이지예요
  - 어두운 버전은 이미지 대신 직접 그린 SVG 장면(비 오는 정류장, `dark.html` 맨 위 `#world`)을 히어로 · 데모 컷 · 콘티에 써요. 실제 이미지가 생기면 `<svg>…</svg>` 자리를 `<img src="./assets/img/IMG-C1.webp">`로 바꾸면 돼요
  - 작품은 글자 포스터로 대신했어요. IMG-S1~S6이 생기면 포스터 배경으로 넣어요

두 페이지는 같은 ID를 같이 써요. 한 번 만들면 양쪽에 다 들어가요.
페이지 안의 회색 자리마다 오른쪽 위에 `IMG-xx` 표시가 붙어 있어요. 아래 표의 ID와 같아요.

> 이번에는 이미지 · 영상을 만들지 않았어요. 자리와 프롬프트만 준비했어요.

---

## 0. 한 가지 이야기로 통일하기 (가장 중요)

페이지 전체가 **같은 이야기 하나**를 보여 줘야 "한 줄 → 산문 → 인물 → 콘티 → 영상" 흐름이 믿어져요. 그래서 모든 이미지는 이 이야기 하나로 만들어요.

- **한 줄**: 우산 하나를 같이 쓴 두 사람
- **산문**: 막차를 놓친 서윤은 정류장 지붕 끝에 서서 비를 피했다. 옆자리 남자가 말없이 우산을 기울였다. 둘의 어깨가 한 뼘쯤 젖었을 때, 서윤은 그가 같은 회사 신입이라는 걸 알아챘다.
- **인물**
  - 서윤 — 29세 한국인 여성, 팀장. 어깨 길이 흑발 단발, 베이지 트렌치코트, 회사원 사원증 끈, 지친 듯 단단한 눈매
  - 도현 — 26세 한국인 남성, 신입. 짧은 흑발, 네이비 니트 + 검정 코트, 투명 비닐 우산, 수줍은 미소
- **배경**: 서울 외곽 버스 정류장, 밤, 비. 노란 가로등, 젖은 아스팔트에 번지는 불빛, 반투명 정류장 지붕
- **화풍(고정)**: 시네마틱 프리비즈 스틸, 35mm 필름 느낌, 차가운 남색 밤 + 따뜻한 나트륨 가로등, 얕은 심도, 은은한 필름 그레인. 글자 · 로고 · 워터마크 없음

모든 프롬프트 끝에 이 **스타일 꼬리**를 그대로 붙여요.

```
cinematic previs still, 35mm film look, cool navy night with warm sodium streetlight, light rain, wet asphalt reflections, shallow depth of field, subtle film grain, muted color grade, no text, no logo, no watermark
```

---

## 1. 이미지 목록

### A. 결과물 부채꼴 (섹션 2 · "한 줄이 이렇게 돼요")

| ID | 내용 | 비율 · 크기 | 프롬프트 (영문) |
|---|---|---|---|
| IMG-F1 | 서윤 인물 카드 | 3:4 · 900×1200 | `character portrait of Seoyun, 29-year-old Korean woman team leader, shoulder-length black bob, beige trench coat, lanyard, tired but firm eyes, standing under a bus stop roof at night, waist-up, looking slightly off camera` + 스타일 꼬리 |
| IMG-F2 | 도현 인물 카드 | 3:4 · 900×1200 | `character portrait of Dohyun, 26-year-old Korean man, new employee, short black hair, navy knit sweater under black coat, holding a clear vinyl umbrella, shy smile, waist-up, night rain` + 스타일 꼬리 |
| IMG-F3 | 배경 · 버스 정류장 | 16:9 · 1600×900 | `empty suburban Seoul bus stop at night in the rain, translucent roof, yellow streetlight, bus timetable panel glowing, wet asphalt reflections, no people, establishing shot` + 스타일 꼬리 |

### B. 콘티 컷 (섹션 2 카드 + 섹션 3 제품 데모의 컷 카드)

같은 4장을 두 곳에 같이 써요. **F1 · F2 · F3을 참고 이미지로 넣고** 만들어야 얼굴이 이어져요.

| ID | 샷 | 비율 · 크기 | 프롬프트 |
|---|---|---|---|
| IMG-C1 | 컷 1 · 와이드 · 아이레벨 | 16:9 · 1280×720 | `wide shot, eye level: Seoyun alone at the edge of a bus stop roof, rain pouring, the last bus tail lights leaving in the distance` + 스타일 꼬리 |
| IMG-C2 | 컷 2 · 미디엄 · 옆에서 | 16:9 · 1280×720 | `medium side shot: Dohyun silently tilts his clear umbrella over Seoyun, both facing the street, streetlight behind them` + 스타일 꼬리 |
| IMG-C3 | 컷 3 · 클로즈업 · 로우앵글 | 16:9 · 1280×720 | `close-up from a low angle: Seoyun's face, surprised recognition, rain drops on the umbrella edge in the foreground, warm light on her cheek` + 스타일 꼬리 |
| IMG-C4 | 컷 4 · 투샷 · 뒤에서 | 16:9 · 1280×720 | `two-shot from behind: the two share one umbrella, shoulders wet, looking at the empty road, streetlights stretching away` + 스타일 꼬리 |

### C. 인물 일관성 벤토 (섹션 6)

| ID | 내용 | 비율 | 프롬프트 |
|---|---|---|---|
| IMG-B1 | 서윤 정면 | 1:1 · 800×800 | `character sheet tile, front view of Seoyun, neutral expression, plain warm gray studio background, soft key light` (스타일 꼬리 중 night/rain 부분은 빼요) |
| IMG-B2 | 서윤 측면 | 1:1 | 같은 문장에서 `front view` → `side profile view` |
| IMG-B3 | 서윤 표정 | 1:1 | `three expressions of Seoyun side by side: surprised, smiling, annoyed, same outfit` |

### D. 영상 생성 타일 (섹션 6)

| ID | 내용 | 비율 | 메모 |
|---|---|---|---|
| IMG-V1 | 컷 3 영상 첫 프레임 | 16:9 | 지금은 IMG-C3을 그대로 써요. 나중에 짧은 반복 영상(`<video autoplay muted loop playsinline>`)으로 바꿔요 |

### E. 작품 쇼케이스 (섹션 7)

작품마다 **대표 스틸 1장**. 이야기가 서로 다르게 보이도록 장르 · 색을 나눠요.

| ID | 제목 · 장르 | 비율 | 프롬프트 |
|---|---|---|---|
| IMG-S1 | 우산 하나 · 로맨틱 코미디 (큰 칸) | 1:1 · 1400×1400 | IMG-C4를 정사각으로 다시 뽑기 |
| IMG-S2 | 마지막 배달 · 드라마 (세로) | 3:4 · 900×1200 | `delivery rider on a scooter stopped at a hillside alley in Seoul at dawn, holding a small cake box, blue hour` + 화풍 문장 |
| IMG-S3 | 404호의 소리 · 미스터리 | 4:3 · 1000×750 | `dim apartment corridor, door 404 slightly open, cold fluorescent light flickering, a single slipper on the floor` |
| IMG-S4 | 작은 우주선 · 애니메이션 | 4:3 | `stylized 3D animation still, a kid's cardboard rocket in a backyard at night, real stars above, warm window light` |
| IMG-S5 | 새벽 편의점 · 숏폼 | 4:3 | `convenience store at 4am, a part-timer and a regular customer laughing at the counter, vertical-friendly composition` |
| IMG-S6 | 첫 무대 · 뮤직비디오 (가로 2칸) | 2:1 · 1600×800 | `small indie stage seen from the back of the crowd, singer in a single spotlight, haze, colored backlights` |

> 실제 Tale로 만든 결과물이 생기면 그걸로 바꾸는 게 가장 좋아요. 쇼케이스는 "만든 것"이어야 믿어져요.

### F. (이전 어두운 시안용 · 지금 버전에서는 안 씀)

| ID | 어디 | 비율 · 크기 | 프롬프트 |
|---|---|---|---|
| IMG-T1 | 도구 벤토 큰 칸 "글을 써 줘요" (위에 산문 UI가 떠 있음) | 1:1 · 1400×1400 | `top-down view of a writer's desk at night, open notebook with handwritten Korean lines, a phone showing a bus stop photo, rain on the window, warm desk lamp` + 화풍 문장. 위쪽 절반은 어둡고 단순하게(UI가 올라감) |
| IMG-T2 | 도구 벤토 세로 칸 "아이디어를 넓혀 줘요" | 1:2 · 800×1600 | `a single clear umbrella standing open on wet asphalt at night, three diverging puddle reflections in different colors (warm pink, soft blue, cold violet)` + 스타일 꼬리. 위쪽에 칩이 올라가니 위는 어둡게 |
| IMG-T3 | 도구 벤토 "컷마다 카메라 · 조명" | 4:3 · 1000×750 | `behind-the-scenes previs: a small film camera on a slider pointed at the bus stop set, one soft key light, rain machine mist` + 스타일 꼬리 |
| IMG-H1 | "콘티 먼저" 섹션의 큰 와이드 스틸 | 21:9 · 2100×900 | IMG-C3 장면을 21:9로 다시 뽑기. 아래 1/4은 컷 카드가 덮으니 중요한 건 위 3/4에 |

> 어두운 버전 히어로는 일부러 이미지 없이 글자 + 빛만 썼어요(Artlist 첫 화면 결). 나중에 바꾸고 싶으면 `IMG-C4`를 아주 어둡게 깔고 그 위에 헤드라인을 올리는 걸 추천해요.

---

## 2. 서비스 화면 캡처 (있으면 좋은 화면)

지금 페이지의 제품 화면은 stageshow로 그린 **간략화 버전**이에요. 실제 앱 화면이 준비되면 아래 화면을 1440×900, 2배율(2880×1800)로 캡처해 두세요. 섹션 4 "왜 Tale인가요"의 세 그림이나 섹션 3 데모 옆 보조 이미지로 쓸 수 있어요.

| 우선 | 화면 | 어디에 쓰나 | 보여야 할 것 |
|---|---|---|---|
| 1 | **Writer W1 · 산문 + 채팅** | 섹션 4-01 "글을 써 줘요" | 산문 가운데, 오른쪽 Lumi 채팅, 고치는 문단 선택 상태, @인물 태그 |
| 2 | **Producer · 장르 · 길이 · 비율 추천 카드** | 섹션 4-02 "아이디어를 넓혀 줘요" | 한 줄 입력 → Lumi가 3갈래 제안, 하나 선택된 상태 |
| 3 | **Storyboard 컷 그리드 + 컷 상세** | 섹션 4-03, 섹션 3 | 컷 카드 6~8장, 한 컷의 카메라 · 조명 패널 열림, "다시 그리기 · 무료" |
| 4 | **Artist 인물 카드 · 모습 목록** | 섹션 6 인물 일관성 | 인물 첫 모습 크게 + 다른 모습 작게, "+ 모습 추가" |
| 5 | **생성 전 비용 확인 팝업** | 섹션 9 요금 옆 | "이 컷 생성 · 5 Take" 확인 창 (Take를 미리 보여 준다는 약속) |
| 6 | **마스터 시트 내보내기 미리보기** | 섹션 6 | 컷 · 샷 · 대사 표 한 장 |

캡처 팁: 더미 데이터는 위 "우산 하나" 이야기로 맞추기, 개인 정보 · 실제 이메일 지우기, 브라우저 주소창 없이 앱 창만.

---

## 3. Claude에게 이미지 만들라고 할 때 (복사해서 쓰기)

이 세션에는 OpenArt 연결(이미지 · 영상 생성)이 붙어 있어요. 다음 대화에서 이렇게 시키면 돼요.

```
landing/IMAGE_PLAN.md를 읽고 이미지를 만들어 줘.
1) 먼저 IMG-F1, F2, F3만 만들어서 보여 줘. 내가 고르면 그걸 기준 이미지로 써.
2) 고른 F1·F2·F3을 참고 이미지로 넣고 IMG-C1~C4를 만들어 줘. 얼굴·옷이 같아야 해.
3) 그다음 B1~B3, S1~S6, T1~T3, H1.
- 모든 프롬프트 끝에 문서의 '스타일 꼬리'를 붙여 줘.
- 만들기 전에 모델과 크레딧 비용을 먼저 알려 줘.
- 결과는 landing/assets/img/<ID>.webp 로 저장(긴 변 1600px 이하, 품질 82).
- 저장하면 index.html의 같은 data-img 자리에 <img>를 넣고 node build.mjs로 다시 빌드해 줘.
```

요령
- **한 번에 다 만들지 말고 F 세트부터.** 인물 얼굴이 정해져야 나머지가 흔들리지 않아요.
- 인물이 이어지려면 참고 이미지(image reference)를 지원하는 모델을 쓰라고 말하세요.
- 마음에 안 드는 것만 "IMG-C3만 다시, 표정을 덜 놀라게"처럼 ID로 짚어 고치면 빨라요.

### 이미지 넣는 방법 (빌드 구조)
- 페이지 원본: 밝은 `landing/index.html` + `src/page.css` / 어두운 `landing/dark.html` + `src/dark.css`, 데모 `landing/src/TaleDemo.tsx` · `demo.css`
- 자리에 넣기: `<figure class="ph" data-img="IMG-S1">` 안에 `<img src="./assets/img/IMG-S1.webp" alt="우산 하나 대표 장면">` 한 줄 추가 → `IMG-xx` 표시는 자동으로 사라져요
- 데모 컷 썸네일: `demo.css`의 `.td-cut[data-on] .td-cut__img--a ~ --d` 배경을 `background-image: url(../assets/img/IMG-C1.webp)` 처럼 바꾸고 `.td-cut__rain` 줄은 지우기
- 빌드: `cd landing && node build.mjs` → `dist/`에 두 HTML이 다시 생겨요. 이미지를 넣을 때는 index.html과 dark.html 양쪽 같은 ID 자리에 넣어 주세요 (이미지는 HTML 안에 들어가요. 총 용량은 10MB 안쪽으로)

---

## 4. 나중에 영상 만들 때 (이번엔 안 함)

영상은 **확정한 콘티 이미지에서 출발(I2V)** 하는 게 Tale의 이야기와도 맞아요. "콘티 먼저 → 확정 컷만 영상"을 페이지가 직접 보여 주는 셈이에요.

| ID | 출발 이미지 | 길이 | 움직임 프롬프트 |
|---|---|---|---|
| VID-C2 | IMG-C2 | 5초 | `slow push-in, the umbrella tilts toward her, rain keeps falling, subtle breathing, no cuts` |
| VID-C3 | IMG-C3 | 5초 | `static camera, her eyes widen slightly then soften into a small smile, rain drips from the umbrella edge` |
| VID-C4 | IMG-C4 | 5초 | `slow dolly back, the two stand still under one umbrella, a bus headlight passes and lights them` |
| VID-S1 | IMG-S1 | 6초, 반복 | 끝 프레임이 첫 프레임과 비슷하게 (`seamless loop`) |
| VID-HERO (선택) | C1→C4 이어 붙이기 | 15~20초 | 섹션 3 아래 "완성 영상" 자리 |

Claude에게 시킬 때

```
IMAGE_PLAN.md 4번 표대로 영상을 만들어 줘.
- I2V로, 출발 이미지는 landing/assets/img/<ID>.webp
- 720p로 먼저 1개(VID-C3)만 만들어 보여 줘. 괜찮으면 나머지.
- 생성 전에 모델과 비용을 먼저 알려 줘.
- 결과는 mp4(H.264, 무음) + 첫 프레임 webp로 저장하고,
  페이지에는 <video autoplay muted loop playsinline poster="..."> 로 넣어 줘.
- 영상은 HTML에 넣지 말고 같은 폴더 옆 파일로 둬(단일 HTML 용량 때문에).
```

주의
- 영상 안에 글자 · 로고가 생기면 다시 뽑기
- 쇼케이스 영상은 5~8초, 2MB 이하로 줄이기(`ffmpeg -crf 28 -an`)
- `prefers-reduced-motion`이면 첫 프레임만 보여 주기 (페이지에 이미 규칙 있음)
