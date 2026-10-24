/*
 * Lumi — Tale Studio AI 마스코트 (React 컴포넌트, JSX 없이 동작)
 *
 *   <Lumi state="idle" size={160} />
 *   state : idle | listening | thinking | creating | complete | error
 *   size  : 가로 px (세로는 3/4). 56 미만이면 아이콘 모드(입자 숨김 · 눈 조금 크게)
 *   angle : front | tilt (약간 기울어진 각도)
 *   ground: light | dark (그림자 · 바깥 빛 색)
 *   onDone: complete · error 가 끝났을 때 호출 → 보통 idle 로 되돌린다
 *
 * 레이어는 모두 따로 움직이도록 나눠 두었다(그림자 · 바깥 빛 · 꼬리 · 몸 · 내부 빛 · 하이라이트 · 눈 · 입자).
 * 디자이너가 레이어별 PNG/WebP 를 만들면 같은 클래스 이름의 레이어만 이미지로 바꿔 끼우면 된다. 스타일은 lumi.css.
 */
import React from 'react';

// --- core start
var LUMI_BODY = 'M120 112 C118 70 160 44 200 46 C246 48 268 84 266 122 C264 160 236 190 194 192 C150 194 122 160 120 112 Z';
var LUMI_TAIL = 'M176 184 C140 182 96 176 62 160 C42 150 30 134 38 120 C46 132 62 140 84 138 C106 136 118 126 124 100 C130 130 150 160 176 184 Z';
var LUMI_TAIL_EDGE = 'M40 124 C48 134 62 140 84 138 C98 137 108 133 114 126';
var LUMI_DONE_MS = { complete: 1400, error: 1700 };

function lumiSpark(cx, cy, r) {
  var k = r * 0.18;
  return 'M' + cx + ' ' + (cy - r) + ' C' + (cx + k) + ' ' + (cy - k) + ' ' + (cx + k) + ' ' + (cy - k) + ' ' + (cx + r) + ' ' + cy +
    ' C' + (cx + k) + ' ' + (cy + k) + ' ' + (cx + k) + ' ' + (cy + k) + ' ' + cx + ' ' + (cy + r) +
    ' C' + (cx - k) + ' ' + (cy + k) + ' ' + (cx - k) + ' ' + (cy + k) + ' ' + (cx - r) + ' ' + cy +
    ' C' + (cx - k) + ' ' + (cy - k) + ' ' + (cx - k) + ' ' + (cy - k) + ' ' + cx + ' ' + (cy - r) + ' Z';
}

function Lumi(props) {
  var e = React.createElement;
  var state = props.state || 'idle';
  var size = props.size || 160;
  var tilt = props.angle === 'tilt';
  var ground = props.ground || 'light';
  var compact = size < 56;
  var onDone = props.onDone;
  var raw = React.useId ? React.useId() : 'x';
  var id = 'lumi' + String(raw).replace(/[^a-zA-Z0-9]/g, '');
  var u = function (k) { return 'url(#' + id + k + ')'; };

  React.useEffect(function () {
    if (!LUMI_DONE_MS[state] || !onDone) return undefined;
    var t = setTimeout(onDone, LUMI_DONE_MS[state]);
    return function () { clearTimeout(t); };
  }, [state, onDone]);

  // 정면: 몸 가운데보다 살짝 오른쪽을 본다. 기울임: 눈 사이가 좁아지고 오른쪽으로 더 돈다.
  var eyes = tilt ? [[193, 119, 4.5, 9], [222, 116, 5.2, 9.4]] : [[178, 118, 5.2, 9.4], [213, 116, 5.2, 9.4]];

  function stop(o, c, a) { return e('stop', { key: o + c, offset: o, stopColor: c, stopOpacity: a == null ? 1 : a }); }

  var defs = e('defs', null,
    e('linearGradient', { id: id + 'b', x1: '.15', y1: '0', x2: '.85', y2: '1' },
      stop(0, '#ff5d68'), stop(0.32, '#ff8d8d'), stop(0.6, '#ffc1cd'), stop(0.82, '#f0c4ee'), stop(1, '#d6b6ff')),
    e('radialGradient', { id: id + 'r', cx: '50%', cy: '50%', r: '50%' }, stop(0, '#ff4658', 0.9), stop(1, '#ff4658', 0)),
    e('radialGradient', { id: id + 'p', cx: '50%', cy: '50%', r: '50%' }, stop(0, '#ff9ab8', 0.8), stop(1, '#ff9ab8', 0)),
    e('radialGradient', { id: id + 'w', cx: '50%', cy: '50%', r: '50%' }, stop(0, '#ffffff', 0.85), stop(1, '#ffffff', 0)),
    e('linearGradient', { id: id + 'e', x1: '0', y1: '0', x2: '1', y2: '1' }, stop(0, '#b48cff', 0), stop(0.55, '#b48cff', 0.15), stop(1, '#9a74f0', 0.75)),
    e('linearGradient', { id: id + 't', gradientUnits: 'userSpaceOnUse', x1: '160', y1: '160', x2: '36', y2: '122' },
      stop(0, '#ffa0b0', 0.95), stop(0.4, '#f6b9df', 0.8), stop(1, '#d8b6ff', 0.3)),
    e('filter', { id: id + 'f1', x: '-50%', y: '-50%', width: '200%', height: '200%' }, e('feGaussianBlur', { stdDeviation: 1.4 })),
    e('filter', { id: id + 'f2', x: '-50%', y: '-50%', width: '200%', height: '200%' }, e('feGaussianBlur', { stdDeviation: 6 })),
    e('filter', { id: id + 'f3', x: '-50%', y: '-50%', width: '200%', height: '200%' }, e('feGaussianBlur', { stdDeviation: 16 })),
    e('clipPath', { id: id + 'c' }, e('path', { d: LUMI_BODY }))
  );

  var tail = e('g', { className: 'lumi-tail' },
    e('path', { d: LUMI_TAIL, fill: u('t'), filter: compact ? undefined : u('f1') }),
    e('path', { d: LUMI_TAIL_EDGE, fill: 'none', stroke: '#fff', strokeWidth: 2.2, strokeLinecap: 'round', opacity: 0.55 }));

  var body = e('g', { className: 'lumi-body' },
    e('path', { d: LUMI_BODY, fill: u('b') }),
    e('g', { clipPath: u('c') },
      e('g', { className: 'lumi-core lumi-light' },
        e('ellipse', { cx: 170, cy: 98, rx: 70, ry: 58, fill: u('r') }),
        e('ellipse', { cx: 226, cy: 150, rx: 44, ry: 40, fill: u('p') })),
      e('ellipse', { className: 'lumi-light', cx: 196, cy: 150, rx: 52, ry: 36, fill: u('w'), opacity: 0.75 }),
      e('path', { d: LUMI_BODY, fill: 'none', stroke: u('e'), strokeWidth: 18, filter: u('f2') })),
    e('path', { d: LUMI_BODY, fill: 'none', stroke: '#fff', strokeOpacity: 0.45, strokeWidth: 1.4 }),
    e('ellipse', { cx: 168, cy: 76, rx: 34, ry: 15, fill: u('w'), opacity: 0.9, transform: 'rotate(-22 168 76)' }),
    e('ellipse', { cx: 156, cy: 72, rx: 9, ry: 4, fill: '#fff', opacity: 0.75, transform: 'rotate(-22 156 72)', filter: compact ? undefined : u('f1') }));

  var eyeEls = e('g', { className: 'lumi-eyes' }, eyes.map(function (p, k) {
    return e('g', { key: k, className: 'lumi-eye ' + (k ? 'lumi-eye-r' : 'lumi-eye-l') },
      e('ellipse', { cx: p[0], cy: p[1], rx: p[2], ry: p[3], fill: '#2a1640' }));
  }));

  var extra = compact ? null : [
    e('g', { key: 'o', className: 'lumi-orbit' },
      e('circle', { cx: 300, cy: 120, r: 4, fill: '#ff8d8d' }),
      e('circle', { cx: 80, cy: 120, r: 3, fill: '#c7a6ff' }),
      e('circle', { cx: 190, cy: 22, r: 2.6, fill: '#ffb3b3' })),
    e('g', { key: 'w', className: 'lumi-waves', fill: 'none', stroke: '#ff8d8d', strokeWidth: 3, strokeLinecap: 'round' },
      e('path', { d: 'M282 104 q8 14 0 28' }), e('path', { d: 'M294 96 q12 22 0 44', opacity: 0.6 })),
    e('g', { key: 'b', className: 'lumi-burst' },
      e('path', { d: lumiSpark(84, 58, 10), fill: '#ff8d8d' }),
      e('path', { d: lumiSpark(288, 70, 8), fill: '#ffb3b3' }),
      e('path', { d: lumiSpark(276, 186, 6), fill: '#c7a6ff' }),
      e('path', { d: lumiSpark(112, 196, 5), fill: '#ff8d8d' }))
  ];

  return e('span', {
      className: 'lumi', 'data-state': state, 'data-ground': ground, 'data-compact': compact ? '1' : undefined,
      style: { width: size, maxWidth: '100%', aspectRatio: '4 / 3' }, role: 'img', 'aria-label': props.label || 'Lumi'
    },
    e('svg', { viewBox: '0 0 320 240', width: '100%', height: '100%', 'aria-hidden': true }, defs,
      e('ellipse', { className: 'lumi-shadow', cx: 196, cy: 224, rx: 64, ry: 8, filter: u('f2') }),
      e('g', { className: 'lumi-float' },
        e('g', { className: 'lumi-lean' },
          e('g', { transform: tilt ? 'rotate(-9 192 120)' : undefined },
            e('path', { className: 'lumi-aura', d: LUMI_BODY, filter: u('f3') }),
            tail, body, eyeEls))),
      extra));
}
// --- core end

export default Lumi;
