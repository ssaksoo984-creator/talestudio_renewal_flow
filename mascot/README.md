# Lumi — Tale Studio AI 마스코트

## 최종: 원본 이미지 그대로 쓰기 (`LumiImage`)

받은 고해상도 Lumi(1536×1024, 검은 배경)에서 배경만 투명하게 뺀 에셋을 써요. 얼굴 · 비율 · 실루엣 · 색 · 질감은 원본 픽셀 그대로예요.

| 파일 | 크기 | 쓰는 곳 |
|---|---|---|
| `assets/lumi.webp` | 320×237 · 13KB | 채팅 아이콘 · 작은 자리 |
| `assets/lumi@2x.webp` | 640×474 · 33KB | 로딩 화면 · 레티나 |
| `assets/lumi-hd.webp` | 1126×834 · 53KB | 큰 화면 · 원본 크기 |
| `assets/lumi-glow@2x.webp` | 709×550 · 47KB | 어두운 배경, 원본의 흰 빛 번짐 포함 (`glow`) |

| 코드 | 내용 |
|---|---|
| `LumiImage.js` | 이미지를 감싸는 React 컴포넌트. 화면 크기에 맞는 파일을 `srcset`으로 골라요 |
| `lumi-image.css` | 둥실거림 · ±1.6도 기울기 · 뒤쪽 발광, 상태별 빛 세기 · 튀어 오름 · 흔들림 |
| `lumi-original.html` | 확인용 페이지 |

```js
import LumiImage from './mascot/LumiImage';
import './mascot/lumi-image.css';

<LumiImage size={40} state={state} onDone={() => setState('idle')} />  // 채팅 아바타
<LumiImage size={220} state="creating" />                               // 생성 로딩
<LumiImage size={320} glow />                                           // 어두운 화면
```

- `state`: `idle` · `listening` · `thinking` · `creating` · `complete` · `error`. 상태는 이미지 전체에만 적용돼요.
- `.webp` import는 웹팩 · Vite 기본 설정으로 동작해요.

### 눈 · 꼬리를 따로 움직이려면

지금 에셋은 한 장이라서 눈 깜빡임이나 꼬리만 흔들기는 할 수 없어요. 아래 레이어를 **같은 캔버스 크기 · 같은 위치**의 투명 PNG/WebP로 나눠야 해요.

1. **몸 (눈 없음)**: 눈 자리를 몸 그라데이션으로 메운 것
2. **왼쪽 눈 · 오른쪽 눈**: 각각 따로
3. **빛의 꼬리**: 몸 뒤로 숨는 뿌리까지. 몸 레이어에서는 꼬리를 지우고 가장자리를 다시 그림
4. **안쪽 빛 (선택)**: 생각 중 · 생성 중에 빛을 흐르게 할 때

가장 좋은 방법은 원본을 만든 도구에서 레이어별로 다시 뽑는 거예요. 차선은 포토샵 리터치예요.

---

## 참고: SVG로 다시 그린 버전 (`Lumi`)

레퍼런스의 **A. Core Design**을 기준으로 만든 챗봇 마스코트 컴포넌트예요.

- 머리와 몸이 하나인 말랑한 젤리 형태예요. 몸의 왼쪽 아래가 빛의 꼬리로 이어져요.
- 얼굴은 작은 세로 타원 눈 두 개뿐이에요.

| 파일 | 내용 |
|---|---|
| `Lumi.js` | React 컴포넌트. React 18 이상이면 되고, JSX 변환 없이 동작해요 |
| `lumi.css` | 레이어별 애니메이션 · 상태 · 움직임 줄이기 |

## 쓰는 법

```js
import Lumi from './mascot/Lumi';
import './mascot/lumi.css';

<Lumi state="idle" size={40} />                        // 채팅 아바타
<Lumi state="creating" size={200} />                   // 생성 로딩 화면
<Lumi state={state} onDone={() => setState('idle')} /> // complete · error 뒤 idle 로
```

| prop | 값 | 설명 |
|---|---|---|
| `state` | `idle` · `listening` · `thinking` · `creating` · `complete` · `error` | 상태 |
| `size` | 가로 px, 기본 160 | 세로는 3/4. 56 미만이면 아이콘 모드예요. 입자를 숨기고 눈을 1.35배로 키워요 |
| `angle` | `front` · `tilt` | 정면 · 약간 기울인 각도 |
| `ground` | `light` · `dark` | 배경에 맞춰 그림자와 바깥 빛 색이 바뀌어요 |
| `onDone` | 함수 | `complete` 1.4초, `error` 1.7초 뒤에 불러요 |

## 챗봇 이벤트와 상태

| 이벤트 | 상태 |
|---|---|
| 입력칸 포커스 · 타이핑 | `listening` |
| 메시지 보냄 · 첫 응답 대기 | `thinking` |
| 산문 초안 · 그림 · 스토리보드 생성 중 | `creating` |
| 생성 끝 | `complete` → `idle` |
| 요청 실패 · 읽기 실패 | `error` → `idle` |

리뉴얼 프로토타입에서 쓰이는 자리는 이래요.

- 에이전트 채팅 머리글과 말풍선 아바타: 40px
- 생성 로딩 화면(E5 · W2 · A4 · S0): `creating`, 200px
- 오류 안내(E2e 등): `error`

## 레이어와 원본 질감

지금 Lumi는 레퍼런스를 보고 **SVG로 다시 그린 벡터 버전**이에요. 형태, 색, 움직임은 맞췄어요. 하지만 레퍼런스 이미지의 렌더링 질감과 픽셀 단위로 같지는 않아요. 빛이 안에서 퍼지는 질감이나 젤리 굴절 같은 부분이에요.

원본 질감이 필요하면 아래 레이어를 따로 렌더해야 해요. 투명 PNG/WebP를 2배 해상도로 만들고, 같은 클래스의 SVG 레이어 자리에 `<image>`로 넣으면 돼요. 움직임 CSS는 그대로 써요.

| 레이어 | 클래스 | 움직임 | 원본 질감으로 바꾸려면 |
|---|---|---|---|
| 바닥 그림자 | `.lumi-shadow` | 고정 | SVG 그대로 |
| 바깥 빛 | `.lumi-aura` | 오류 때 약해짐 | SVG 그대로 |
| 빛의 꼬리 | `.lumi-tail` | 흔들림 · creating 때 넓어짐 | PNG 한 장 (몸과 겹치는 부분 포함) |
| 몸 바탕 | `.lumi-body` | 젤리 눌림 · 숨쉬기 | 눈 · 하이라이트 · 내부 빛을 뺀 몸 PNG |
| 내부 빛 | `.lumi-core` | thinking 흐름 · creating 순환 | 빛 덩어리 PNG, 몸 마스크 안에서 회전 |
| 하이라이트 | 몸 안 흰 타원 | 고정 | 반투명 PNG 한 장 |
| 눈 | `.lumi-eye-l` · `.lumi-eye-r` | 깜빡임 · 시선 · 오류 | SVG 그대로 쓰는 걸 권해요 |
| 입자 · 반짝임 | `.lumi-orbit` · `.lumi-burst` | thinking 회전 · complete 터짐 | SVG 그대로 |

레퍼런스 이미지 한 장을 잘라 쓰면 레이어가 한 덩어리라서 눈, 꼬리, 빛을 따로 움직일 수 없어요.

상태 전환을 디자이너가 직접 조율하려면 Rive를 쓸 수 있어요. Rive 에디터에서 같은 레이어로 State Machine을 따로 만들어야 해요.

## 접근성 · 성능

- 라이브러리 없이 SVG와 CSS만 써요. 몇 KB예요.
- `prefers-reduced-motion`을 따르고, 애니메이션이 멈춰도 기본 상태 그림이 그대로 보여요.
- `role="img"`와 `aria-label`이 붙어 있어요. 기본값은 "Lumi"예요.
