/*
 * LumiImage — 원본 Lumi 이미지(고해상도)를 그대로 쓰는 컴포넌트
 *
 *   <LumiImage size={40} />                          채팅 아바타
 *   <LumiImage size={220} state="creating" />        생성 로딩
 *   <LumiImage size={320} glow />                    어두운 화면: 원본의 흰 빛 번짐까지
 *
 * 그림은 바꾸지 않는다. 둥실거림 · 미세한 기울기 · 뒤쪽 발광만 CSS 로 더한다(lumi-image.css).
 * state 는 이미지 전체에만 적용된다. 눈 깜빡임 · 꼬리만 움직이기는 레이어 에셋이 있어야 한다(README).
 *
 *   state : idle | listening | thinking | creating | complete | error
 *   glow  : true 면 원본의 바깥 빛 번짐이 들어간 이미지 (어두운 배경용)
 *   onDone: complete · error 가 끝나면 호출 → 보통 idle 로
 */
import React from 'react';
import lumi1x from './assets/lumi.webp';          // 320px
import lumi2x from './assets/lumi@2x.webp';       // 640px
import lumiHd from './assets/lumi-hd.webp';       // 1126px (원본 크기)
import lumiGlow from './assets/lumi-glow@2x.webp'; // 빛 번짐 포함

// --- core start
var LUMI_IMG_DONE_MS = { complete: 1400, error: 1300 };
var LUMI_IMG_RATIO = 1126 / 834;
// 빛 번짐 이미지는 캔버스가 더 넓다. 몸 위치가 겹치도록 맞춘 값(원본 좌표 기준).
var LUMI_GLOW_BOX = { left: -(174 - 115) / 1126, top: -(99 - 32) / 834, width: 1248 / 1126, height: 968 / 834 };

function LumiImage(props) {
  var e = React.createElement;
  var state = props.state || 'idle';
  var size = props.size || 160;
  var onDone = props.onDone;
  var S = props.sources || LUMI_IMG_SRC;

  React.useEffect(function () {
    if (!LUMI_IMG_DONE_MS[state] || !onDone) return undefined;
    var t = setTimeout(onDone, LUMI_IMG_DONE_MS[state]);
    return function () { clearTimeout(t); };
  }, [state, onDone]);

  var img = props.glow
    ? e('img', { src: S.glow, alt: '', draggable: false, decoding: 'async', className: 'lumi-i__glowimg',
        style: { left: LUMI_GLOW_BOX.left * 100 + '%', top: LUMI_GLOW_BOX.top * 100 + '%', width: LUMI_GLOW_BOX.width * 100 + '%', height: LUMI_GLOW_BOX.height * 100 + '%' } })
    : e('img', { src: S.x1, srcSet: S.x1 + ' 320w, ' + S.x2 + ' 640w, ' + S.hd + ' 1126w', sizes: size + 'px', alt: '', draggable: false, decoding: 'async' });

  return e('span', {
      className: 'lumi-i', 'data-state': state, 'data-small': size < 64 ? '1' : undefined, 'data-glow': props.glow ? '1' : undefined,
      style: { width: size, maxWidth: '100%', aspectRatio: String(LUMI_IMG_RATIO) },
      role: 'img', 'aria-label': props.label || 'Lumi'
    },
    e('span', { className: 'lumi-i__glow', 'aria-hidden': true }),
    e('span', { className: 'lumi-i__shadow', 'aria-hidden': true }),
    e('span', { className: 'lumi-i__float' }, img));
}
// --- core end

var LUMI_IMG_SRC = { x1: lumi1x, x2: lumi2x, hd: lumiHd, glow: lumiGlow };

export default LumiImage;
