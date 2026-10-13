/* 플로우차트 그리기 — index.html(프로토타입)과 flow.html(플로우 문서)이 함께 쓴다.
 * FlowView.mount(box, { onSelect(id) }) → 단계마다 Mermaid로 그린다.
 * FlowView.mark(id) → 그 노드를 빨간 그라데이션 실선으로 표시.
 * FlowView.setPlan('A'|'B') → 그 안의 노드·엣지만 그린다. */
(function () {
  var F = window.FLOW;
  var byId = {}; F.nodes.forEach(function (n) { byId[n.id] = n; });
  var stageName = {}; F.stages.forEach(function (s) { stageName[s.id] = s.name; });
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  function css(v) { return getComputedStyle(document.documentElement).getPropertyValue(v).trim(); }

  // 빨간 그라데이션: 모든 SVG가 같은 문서 안이라 url(#hl-red)로 함께 쓴다
  function ensureGradient() {
    var g = document.getElementById('hl-defs');
    if (!g) {
      g = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      g.id = 'hl-defs'; g.setAttribute('width', '0'); g.setAttribute('height', '0'); g.setAttribute('aria-hidden', 'true');
      g.style.position = 'absolute';
      document.body.appendChild(g);
    }
    g.innerHTML = '<defs><linearGradient id="hl-red" x1="0" y1="0" x2="1" y2="1">' +
      '<stop offset="0" stop-color="' + css('--hl') + '"/><stop offset=".5" stop-color="' + css('--hl2') + '"/><stop offset="1" stop-color="' + css('--hl') + '"/></linearGradient></defs>';
  }

  function lbl(n) {
    var t = n.label + (n.lock ? '<br/>🔒 ' + n.lock : '');
    if (n.type === 'ai') t = '⏳ ' + t;
    if (n.type === 'error') t = '⚠ ' + t;
    return '"' + n.id + ' · ' + t.replace(/"/g, '#quot;') + '"';
  }
  function shape(n) {
    var L = lbl(n);
    switch (n.type) {
      case 'decision': return n.id + '{' + L + '}';
      case 'ai': return n.id + '{{' + L + '}}';
      case 'modal': return n.id + '[[' + L + ']]';
      case 'ext': return n.id + '[/' + L + '/]';
      case 'error': return n.id + '>' + L + ']';
      default: return n.id + '[' + L + ']';
    }
  }
  function classDefs() {
    var ink = css('--ink'), surf = css('--surface');
    return [
      'classDef screen fill:' + surf + ',stroke:' + css('--mut') + ',color:' + ink,
      'classDef modal fill:' + surf + ',stroke:' + css('--mut') + ',color:' + ink,
      'classDef decision fill:' + css('--accent-soft') + ',stroke:' + css('--accent') + ',color:' + ink,
      'classDef ai fill:' + surf + ',stroke:' + css('--ai') + ',stroke-width:2px,color:' + css('--ai'),
      'classDef error fill:' + css('--surface') + ',stroke:' + css('--back') + ',stroke-width:2px,color:' + css('--back'),
      'classDef ext fill:' + css('--bg') + ',stroke:' + css('--line') + ',color:' + css('--mut'),
      'classDef stub fill:' + css('--bg') + ',stroke:' + css('--line') + ',color:' + css('--mut') + ',stroke-dasharray:2 2',
      'classDef stubback fill:' + css('--bg') + ',stroke:' + css('--back') + ',color:' + css('--back') + ',stroke-dasharray:2 2',
      'classDef isnew stroke:' + css('--new') + ',stroke-dasharray:5 3,stroke-width:2px'
    ];
  }
  // 단계마다 따로 그린다. 다른 단계로 가는 선과, 같은 단계 안에서 앞 노드로 되돌아가는 선은
  // 길게 돌아가는 대신 "→ ID" / "↩ ID" 작은 상자로 끝낸다. 그래야 선이 엉키지 않는다.
  function definition(stage) {
    var d = ['flowchart TB'], styles = [], k = 0;
    var mine = F.nodes.filter(function (n) { return n.stage === stage.id && inPlan(n.plan); });
    var ids = {}, order = {}; mine.forEach(function (n, i) { ids[n.id] = 1; order[n.id] = i; d.push('  ' + shape(n)); });
    F.edges.forEach(function (e) {
      if (!ids[e[0]] || !inPlan(e[4]) || !byId[e[1]] || !inPlan(byId[e[1]].plan)) return;
      var to = e[1], t = byId[to];
      var cross = !ids[to], back = !cross && order[to] <= order[e[0]];
      if (cross || back) {
        to = 'go__' + e[1] + '__' + k;
        var ret = back || e[3] === 'back';
        d.push('  ' + to + '(["' + (ret ? '↩ ' : '→ ') + e[1] + ' ' + t.label.replace(/"/g, '#quot;') + (cross && e[3] !== 'back' ? ' · ' + stageName[t.stage] : '') + '"])');
        d.push('class ' + to + ' ' + (e[3] === 'back' ? 'stubback' : 'stub'));
      }
      var arrow = e[3] === 'back' || e[3] === 'no' ? '-.->' : '-->';
      d.push(e[0] + ' ' + arrow + (e[2] ? '|"' + e[2] + '"|' : '') + ' ' + to);
      if (e[3] === 'back') styles.push('linkStyle ' + k + ' interpolate ' + CURVE + ' stroke:' + css('--back') + ',stroke-width:2px');
      if (e[3] === 'yes') styles.push('linkStyle ' + k + ' interpolate ' + CURVE + ' stroke:' + css('--yes') + ',stroke-width:1.6px');
      k++;
    });
    if (k) styles.unshift('linkStyle default interpolate ' + CURVE);
    d = d.concat(classDefs());
    mine.forEach(function (n) { d.push('class ' + n.id + ' ' + n.type + (n.vs === 'new' ? ',isnew' : '')); });
    return d.concat(styles).join('\n');
  }

  var CURVE = 'stepAfter'; // 직각으로 꺾이는 선
  var box = null, opts = {}, cur = null, zoom = 1, gen = 0, plan = 'A';
  function inPlan(p) { return !p || p === plan; }
  function render() {
    if (!box) return Promise.resolve();
    ensureGradient();
    if (!window.mermaid) { box.innerHTML = '<div class="loading">플로우 그리기 도구를 불러오지 못했어요. 네트워크를 확인하고 새로고침해 주세요.</div>'; return Promise.resolve(); }
    mermaid.initialize({ startOnLoad: false, theme: 'base', securityLevel: 'strict', flowchart: { htmlLabels: true, curve: CURVE, nodeSpacing: 26, rankSpacing: 36, padding: 8 },
      themeVariables: { fontFamily: css('--font'), fontSize: '13px', primaryColor: css('--surface'), primaryTextColor: css('--ink'), primaryBorderColor: css('--mut'), lineColor: css('--mut'), edgeLabelBackground: css('--surface'), titleColor: css('--ink') } });
    var g0 = ++gen;
    box.innerHTML = F.stages.map(function (s) {
      return '<section class="stage" id="st-' + s.id + '"><h3>' + esc(s.name) + (s.tbd ? ' <span class="tbd">이름 미정</span>' : '') + ' <small>' + esc(s.sub) + '</small></h3><div class="stage-svg"></div></section>';
    }).join('');
    return F.stages.reduce(function (p, s) {
      return p.then(function () {
        if (g0 !== gen) return;
        return mermaid.render('fs' + g0 + s.id, definition(s)).then(function (r) {
          var host = box.querySelector('#st-' + s.id + ' .stage-svg');
          if (!host) return;
          host.innerHTML = r.svg;
          var svg = host.querySelector('svg');
          svg.dataset.w = svg.viewBox.baseVal.width;
          host.querySelectorAll('g.node').forEach(function (g) {
            var m = g.id.match(/flowchart-(.+)-\d+$/); if (!m) return;
            var id = m[1].indexOf('go__') === 0 ? m[1].split('__')[1] : m[1];
            if (!byId[id]) return;
            g.dataset.node = id; if (id !== m[1]) g.dataset.stub = '1';
            g.setAttribute('tabindex', '0'); g.setAttribute('role', 'button');
            g.setAttribute('aria-label', (id !== m[1] ? '이동: ' : '') + id + ' ' + byId[id].label);
          });
        });
      });
    }, Promise.resolve()).then(function () { applyZoom(); mark(cur); })
      .catch(function (err) { box.insertAdjacentHTML('afterbegin', '<div class="loading">플로우를 그리지 못했어요: ' + esc(err.message || err) + '</div>'); });
  }
  function applyZoom() {
    if (!box) return;
    box.querySelectorAll('.stage-svg svg').forEach(function (svg) { svg.style.width = (svg.dataset.w * zoom) + 'px'; });
  }
  function fit() {
    var w = 0; box.querySelectorAll('.stage-svg svg').forEach(function (s) { w = Math.max(w, +s.dataset.w); });
    if (w) { zoom = Math.max(.35, (box.clientWidth - 32) / w); applyZoom(); }
  }
  function mark(id, scroll) {
    cur = id;
    if (!box) return;
    var hit = null;
    box.querySelectorAll('g.node[data-node]').forEach(function (g) {
      var on = g.dataset.node === id && !g.dataset.stub;
      g.classList.toggle('is-sel', on);
      if (on) hit = g;
    });
    if (scroll && hit) scrollTo(hit);
  }
  // 플로우 상자 안에서만 스크롤한다 (페이지 전체는 움직이지 않게)
  function scrollTo(g) {
    var b = box.getBoundingClientRect(), r = g.getBoundingClientRect();
    var top = box.scrollTop + (r.top - b.top) - b.height / 2 + r.height / 2;
    var left = box.scrollLeft + (r.left - b.left) - b.width / 2 + r.width / 2;
    var smooth = !(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    box.scrollTo({ top: top, left: left, behavior: smooth ? 'smooth' : 'auto' });
  }

  window.FlowView = {
    byId: byId, stageName: stageName, esc: esc,
    mount: function (el, o) {
      box = el; opts = o || {};
      el.addEventListener('click', function (e) {
        var g = e.target.closest('g.node[data-node]');
        if (g && opts.onSelect) opts.onSelect(g.dataset.node);
      });
      el.addEventListener('keydown', function (e) {
        if ((e.key === 'Enter' || e.key === ' ') && e.target.matches && e.target.matches('g.node[data-node]')) { e.preventDefault(); opts.onSelect && opts.onSelect(e.target.dataset.node); }
      });
      var mq = window.matchMedia('(prefers-color-scheme: dark)');
      if (mq.addEventListener) mq.addEventListener('change', render);
      new MutationObserver(render).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
      return render();
    },
    mark: mark,
    setPlan: function (p) { if (p === plan) return Promise.resolve(); plan = p; return render(); },
    plan: function () { return plan; },
    visible: function (id) { var n = byId[id]; return !!n && inPlan(n.plan); },
    setZoom: function (z) { zoom = z; applyZoom(); },
    zoomIn: function () { zoom = Math.min(2, zoom + .15); applyZoom(); },
    zoomOut: function () { zoom = Math.max(.35, zoom - .15); applyZoom(); },
    fit: fit,
  };
})();
