/*
 * LumiImage — 레퍼런스 원본에서 분리한 Lumi 이미지를 그대로 쓰는 컴포넌트
 *
 *   <LumiImage size={40} />                         채팅 아바타
 *   <LumiImage size={220} state="creating" />       생성 로딩
 *
 * 그림은 바꾸지 않는다. 둥실거림 · 미세한 기울기 · 뒤쪽 발광만 CSS 로 더한다(lumi-image.css).
 * state 는 이미지 전체에만 적용된다(빛 세기 · 속도 · 튀어 오름 · 흔들림). 눈 깜빡임이나 꼬리만 움직이기는
 * 레이어가 나뉜 에셋이 있어야 한다(README 참고).
 *
 *   state : idle | listening | thinking | creating | complete | error
 *   onDone: complete · error 가 끝나면 호출 → 보통 idle 로
 */
import React from 'react';
import lumi1x from './assets/lumi.png';
import lumi2x from './assets/lumi@2x.png';

// --- core start
var LUMI_IMG_DONE_MS = { complete: 1400, error: 1300 };
var LUMI_IMG_RATIO = 281 / 214;

function LumiImage(props) {
  var e = React.createElement;
  var state = props.state || 'idle';
  var size = props.size || 160;
  var onDone = props.onDone;
  var src = props.src || LUMI_IMG_SRC[0];
  var src2 = props.src2x || LUMI_IMG_SRC[1];

  React.useEffect(function () {
    if (!LUMI_IMG_DONE_MS[state] || !onDone) return undefined;
    var t = setTimeout(onDone, LUMI_IMG_DONE_MS[state]);
    return function () { clearTimeout(t); };
  }, [state, onDone]);

  return e('span', {
      className: 'lumi-i', 'data-state': state, 'data-small': size < 64 ? '1' : undefined,
      style: { width: size, maxWidth: '100%', aspectRatio: String(LUMI_IMG_RATIO) },
      role: 'img', 'aria-label': props.label || 'Lumi'
    },
    e('span', { className: 'lumi-i__glow', 'aria-hidden': true }),
    e('span', { className: 'lumi-i__shadow', 'aria-hidden': true }),
    e('span', { className: 'lumi-i__float' },
      e('img', { src: src, srcSet: src2 ? src + ' 1x, ' + src2 + ' 2x' : undefined, alt: '', draggable: false, decoding: 'async' })));
}
// --- core end

var LUMI_IMG_SRC = [lumi1x, lumi2x];

export default LumiImage;
