/* Tale Studio 리뉴얼 프로토타입 — 동작하는 화면 목업
 * 화면 키는 flow.js 노드 ID와 같다.
 * PROTO.mount(root, { onNavigate(id) }) · PROTO.show(id) · PROTO.reset()
 * 화면 안에서: data-go="ID" 이동 · data-act="이름" 동작 · data-bind="경로" 입력/선택 저장
 * 예시 작품: "자판기의 반란" (민호, 팀장, 회사 복도 자판기) */
(function () {
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var clone = function (o) { return JSON.parse(JSON.stringify(o)); };

  /* ── 고정 데이터 ── */
  var RATIOS = [['16:9', '가로'], ['9:16', '세로 · 숏폼'], ['1:1', '정방형'], ['2.39:1', '시네마']];
  var RUNTIMES = [['15초 이하', '숏폼', 15], ['15~60초', '광고·티저', 60], ['1~5분', 'MV·웹드라마', 300], ['5~20분', '단편', 1200]];
  var MOODS = ['코미디', '드라마', '로맨스', '스릴러', '호러'];
  var AMOUNTS = ['조금만 다듬기', '표현을 새로', '아이디어부터 다시'];
  var TONES = ['작품 기본', '코미디', '호러', '로맨스', '따뜻하게'];
  var CAMS = ['와이드 · 고정', '미디엄 · 고정', '클로즈업', '와이드 · 틸트 다운', '미디엄 · 팬'];
  var STYLES = [['실사', '#5b6470,#22262c'], ['애니메이션', '#ffb4a2,#8aa6ff'], ['웹툰', '#fff3c4,#ffd0e0'], ['3D', '#9be1d4,#5f7fd9'], ['수채화', '#d9ecf5,#f4d9c6'], ['견본 이미지', '#c9c2b8,#8f8a83']];
  var KINDS = {
    '1-1': { name: '영상까지 고려된 대본', q: '대본을 어떻게 쓸까요?', o: [['그대로 영상화', '원본을 고치지 않고 바로 샷으로'], ['조금 다듬어서', '바뀐 부분만 새로 써요'], ['바탕으로 새로', '대본을 재료로 새 이야기']], keep: [0] },
    '1-2': { name: '일반 대본 (연극·고전 대본)', q: '대본을 어떻게 쓸까요?', o: [['그대로 영상화', '빠진 연출·인물·배경만 채워요'], ['조금 다듬어서', ''], ['바탕으로 새로', '']], keep: [0] },
    '1-3': { name: '아이디어 노트', q: '', o: [], keep: [] },
    '2-1': { name: '캐릭터 시트 · 컨셉 아트', q: '이 이미지는 무엇인가요?', o: [['인물', '인물 목록에 넣어요'], ['배경', '배경 목록에 넣어요']], keep: [], note: '이야기 글감이 필요해요. 아이디어 칸에 적어 주세요.' },
    '2-2': { name: '웹툰', q: '웹툰으로 무엇을 할까요?', o: [['그대로 영상화', '스토리·그림체 그대로'], ['다른 스타일로', '스토리만 가져와요'], ['그림체만', '다른 이야기를 이 그림체로'], ['아이디어로', '스토리를 바탕으로 대화']], keep: [0, 1], note: '"그대로"와 "다른 스타일로"는 러닝타임을 지정할 수 없어요.' },
    '2-3': { name: '참조용 사진', q: '사진으로 무엇을 할까요?', o: [['이 느낌의 영상', '그림체·스타일을 가져와요'], ['아이디어로', 'AI가 사진을 읽고 대화']], keep: [] },
  };
  var SAMPLE_FILES = [['1-1', '자판기_촬영대본.docx'], ['1-2', '자판기_연극대본.pdf'], ['1-3', '아이디어_메모.txt'], ['2-1', '민호_캐릭터시트.png'], ['2-2', '자판기_웹툰_1화.png'], ['2-3', '복도_참조사진.jpg']];
  var EXTRA_PEOPLE = [['경비원', '50대. 남색 경비 제복, 무전기.'], ['청소부', '60대. 하늘색 작업복, 밀대.'], ['신입', '20대 초반. 사원증을 목에 건 신입 사원.'], ['고양이', '회색 길고양이. 꼬리가 짧다.']];
  var EXTRA_PLACES = [['옥상', '해 질 녘 회사 옥상, 난간과 물탱크.'], ['편의점', '1층 편의점 계산대 앞.'], ['회의실', '유리벽 회의실, 화이트보드.']];

  function initial() {
    return {
      idea: '회사 복도 자판기가 고장 나서 캔이 우르르 쏟아지는 코미디. 주인공 민호는 하나도 못 먹는다.',
      file: null, kind: '1-3', level: 0, ratio: '9:16', ratioLocked: false,
      title: '자판기의 반란',
      prose: [
        '회사 복도, 오후 세 시. 민호가 자판기 버튼을 누르지만 아무것도 나오지 않는다. 동전 반환 레버를 당겨 봐도 조용하다. 민호는 자판기를 툭 친다.',
        '자판기가 덜컹거리더니 캔이 우르르 쏟아진다. 지나가던 팀장이 하나를 집어 들고 "고마워" 하고 간다. 바닥에 굴러다니는 캔 사이에서 민호는 멍하니 서 있다.',
      ],
      draft: [], runtime: 0, mood: 0, amount: 0, request: '', variants: [], vpick: 0,
      proseLocked: false, back: '', descEdit: -1,
      chars: [
        { n: '민호', d: '20대 후반 직장인. 흰 셔츠, 느슨한 넥타이, 피곤한 눈.', states: ['기본: 흰 셔츠', '파생: 셔츠에 콜라 얼룩 (S2)'], tone: 0, note: '' },
        { n: '팀장', d: '40대. 회색 정장, 단정한 머리, 무표정.', states: ['기본: 회색 정장'], tone: 0, note: '' },
      ],
      bgs: [{ n: '회사 복도 자판기 앞', d: '낮, 형광등, 리놀륨 바닥, 빨간 자판기 한 대.', tone: 0 }],
      newItems: [],
      style: 1, styleLocked: false, generated: false,
      target: 0, toneDraft: 0, tweak: '',
      shots: [
        { sc: 1, len: 3, cam: 0, desc: '민호가 버튼을 누른다', who: [0], lines: [] },
        { sc: 1, len: 2, cam: 2, desc: '반환 레버', who: [0], lines: [] },
        { sc: 1, len: 2, cam: 1, desc: '자판기를 툭', who: [0], lines: [{ w: 0, t: '…또 안 나와?', lang: '한' }] },
        { sc: 2, len: 4, cam: 3, desc: '캔이 쏟아진다', who: [0], lines: [] },
        { sc: 2, len: 3, cam: 1, desc: '팀장이 캔을 집는다', who: [1], lines: [{ w: 1, t: '고마워.', lang: '한' }] },
        { sc: 2, len: 2, cam: 2, desc: '멍한 민호', who: [0], lines: [] },
      ],
      shotSel: 4, shotDraft: null, dlgLang: 0,
      add: { pos: 4, who: 0, bg: 0, desc: '' },
      stateAdd: { who: 0, text: '10년 뒤, 머리가 희끗한 민호' },
      chatDraft: '',
      chat: {
        Producer: [['Producer', '씬 두 개로 산문을 썼어요. 길이나 분위기를 바꾸고 싶으면 "AI 다시 쓰기"에서 골라 주세요.']],
        Artist: [['Artist', '인물 2명, 배경 1곳이에요. 민호는 S2에서 얼룩진 셔츠 상태가 하나 더 있어요.']],
        Storyboard: [['Storyboard', '씬 2개를 샷 6개로 나눴어요.']],
      },
      pending: null, busyStep: 0,
    };
  }
  var st = initial();

  /* ── 부품 ── */
  var STAGES = ['Producer', 'Artist', 'Storyboard', 'Director', 'Editor'];
  function rail(on) {
    var i = STAGES.indexOf(on);
    return '<nav class="w-rail" aria-label="단계">' + STAGES.map(function (s, k) {
      return '<span class="' + (k === i ? 'on' : k < i ? 'done' : '') + '">' + s + '</span>';
    }).join('') + '</nav>';
  }
  function bar(on) {
    return '<header class="w-bar"><b class="w-logo">Tale Studio</b>' + (on ? rail(on) : '<span style="flex:1"></span>') +
      '<span class="w-meta">' + (st.ratioLocked ? '<span class="w-lock">🔒 ' + esc(st.ratio) + '</span>' : '') + '<span>한국어 · 사이트 언어</span></span></header>';
  }
  function studio(on, main, o) {
    o = o || {};
    var msgs = st.chat[on] || [];
    var chat = '<aside class="w-chat' + (o.chatLocked ? ' is-locked' : '') + '"><div class="w-chat-h">에이전트 채팅</div><div class="w-chat-b">' +
      msgs.map(function (m) { return '<div class="w-msg' + (m[0] === '나' ? ' me' : '') + '"><b>' + esc(m[0]) + '</b>' + esc(m[1]) + '</div>'; }).join('') +
      '</div><div class="w-chat-in">' + (o.chatLocked || o.noChat
        ? '<span class="w-mut">' + (o.chatLocked ? '팝업을 닫으면 다시 쓸 수 있어요' : '여기서는 채팅으로 고칠 수 없어요') + '</span>'
        : '<input id="chat-in" data-bind="chatDraft" data-enter="send" value="' + esc(st.chatDraft) + '" placeholder="' + esc(o.ph || '말해주세요…') + '" aria-label="채팅 입력">' +
          '<button class="w-btn pri" data-act="send" data-need="chatDraft">보내기</button>') + '</div></aside>';
    return bar(on) + '<div class="w-studio"><main class="w-main">' + main + '</main>' + chat + '</div>';
  }
  function modal(title, body, acts, wide) {
    return '<div class="w-back"><div class="w-modal' + (wide ? ' wide' : '') + '" role="dialog" aria-modal="true" aria-label="' + esc(title) + '"><h4>' + esc(title) + '</h4>' + body + '<div class="w-acts">' + acts + '</div></div></div>';
  }
  function list(rows) { return '<dl class="w-list">' + rows.map(function (r) { return '<div><dt>' + r[0] + '</dt><dd>' + r[1] + '</dd></div>'; }).join('') + '</dl>'; }
  // 선택지: bind 경로에 i(번호) 또는 값을 저장
  function opts(bind, arr, cur, rec) {
    return '<div class="w-opts" role="radiogroup">' + arr.map(function (o, i) {
      var t = Array.isArray(o) ? o : [o, ''];
      return '<button class="w-opt' + (i === cur ? ' on' : '') + '" role="radio" aria-checked="' + (i === cur) + '" data-bind="' + bind + '" data-val="' + i + '">' + (i === rec ? '<em>추천</em>' : '') + esc(t[0]) + (t[1] ? '<small>' + esc(t[1]) + '</small>' : '') + '</button>';
    }).join('') + '</div>';
  }
  function B(label, go, cls, extra) { return '<button class="w-btn ' + (cls || '') + '"' + (go ? ' data-go="' + go + '"' : '') + (extra || '') + '>' + label + '</button>'; }
  function A(label, act, cls, extra) { return '<button class="w-btn ' + (cls || '') + '" data-act="' + act + '"' + (extra || '') + '>' + label + '</button>'; }
  function busy(title, steps) {
    var cur = st.busyStep;
    return '<div class="w-busy" role="status" aria-live="polite"><div class="w-busy-card"><span class="w-spin" aria-hidden="true"></span><h4>' + esc(title) + '</h4>' +
      '<p>AI가 작업하는 동안은 화면 전체가 잠겨요. 끝나면 고칠 수 있어요.</p>' +
      (steps ? '<ol class="w-steps">' + steps.map(function (s, i) { return '<li class="' + (i < cur ? 'done' : i === cur ? 'cur' : '') + '">' + esc(s) + '</li>'; }).join('') + '</ol>' : '<div class="w-prog"><i style="width:' + Math.min(100, cur * 34) + '%"></i></div>') +
      '<button class="w-btn ghost" data-act="skip">기다리지 않고 넘기기 →</button></div></div>';
  }
  var styleBg = function (i) { return 'linear-gradient(135deg,' + STYLES[i][1] + ')'; };
  var target = function () { var n = st.chars.length; return st.target < n ? st.chars[st.target] : st.bgs[st.target - n]; };
  var shotLabel = function (i) { var s = st.shots[i], k = 0; for (var j = 0; j <= i; j++) if (st.shots[j].sc === s.sc) k++; return 'S' + s.sc + '-' + k; };
  var total = function () { return st.shots.reduce(function (a, s) { return a + s.len; }, 0); };
  function say(stage, who, text) { st.chat[stage].push([who, text]); }

  /* ── 진입 ── */
  function E1() {
    var f = st.file;
    var can = st.idea.trim() || f;
    return bar('') + '<div class="w-entry"><h3>무엇을 만들어 볼까요?</h3>' +
      '<textarea class="w-ta" id="idea" data-bind="idea" aria-label="아이디어" placeholder="아이디어를 적거나 파일을 올려 주세요">' + esc(st.idea) + '</textarea>' +
      '<div class="w-file">' + (f ? '<span class="w-chip">📎 ' + esc(f.name) + '<button class="w-x" data-act="clearFile" aria-label="파일 빼기">×</button></span>'
        : '<span class="w-mut">대본 · 기획 메모 · 캐릭터 시트 · 웹툰 · 사진</span>') +
        '<label class="w-btn">파일 첨부<input type="file" id="file-in" hidden></label></div>' +
      '<div class="w-samples"><span class="w-mut">목업: 예시 파일로 해 보기</span>' + SAMPLE_FILES.map(function (s) { return '<button class="w-tab" data-act="sample" data-arg="' + s[0] + '">' + s[0] + ' ' + esc(s[1].split('.').pop()) + '</button>'; }).join('') + '</div>' +
      '<div class="w-q"><div class="w-q-t">화면 비율 <small>시작하면 바꿀 수 없어요</small></div>' + opts('ratio', RATIOS, RATIOS.map(function (r) { return r[0]; }).indexOf(st.ratio), 1) + '</div>' +
      '<div class="w-foot"><span class="w-mut">채팅은 사이트 언어(한국어)로 진행해요.</span>' + A('시작', 'start', 'pri', can ? ' data-need="idea|file"' : ' data-need="idea|file" disabled') + '</div></div>';
  }
  function E1m() {
    return E1() + modal('이미지를 쓸 권리가 있나요?', '<p>올린 이미지를 생성에 참조해요. 직접 만들었거나 쓸 권리가 있는 이미지만 올려 주세요.</p>' +
      '<span class="w-chip">📎 ' + esc(st.file ? st.file.name : '이미지') + '</span>',
      A('아니오 · 이미지 빼기', 'denyImage') + B('예, 동의해요', 'E2', 'pri'));
  }
  function E2() { return E1() + busy('자료를 읽고 있어요', ['파일 열기', '글인지 이미지인지 보기', '종류 판별']); }
  function E3() {
    var k = KINDS[st.kind];
    if (!k.o.length) return E4();
    return E1() + modal('이렇게 읽었어요',
      '<div class="w-read"><span class="w-chip">📎 ' + esc(st.file ? st.file.name : '') + '</span><b>' + esc(st.kind + ' ' + k.name) + '</b>' + A('종류가 달라요', 'cycleKind', 'w-link') + '</div>' +
      '<div class="w-q"><div class="w-q-t">' + esc(k.q) + '</div>' + opts('level', k.o, st.level, 0) + '</div>' + (k.note ? '<p class="w-note">' + esc(k.note) + '</p>' : ''),
      B('이전', 'E1') + B('시작', 'E4', 'pri'));
  }
  function E4() {
    var k = KINDS[st.kind];
    var src = st.file ? esc(st.file.name) + (k.o.length ? ' · ' + esc(k.o[st.level][0]) : '') : '아이디어 글만';
    return E1() + modal('이대로 시작할까요?', list([['🔒 화면 비율', esc(st.ratio) + ' · 시작하면 끝까지 바꿀 수 없어요'], ['채팅 언어', '한국어 (사이트 언어)'], ['자료', src]]),
      B('아니오, 고칠래요', 'E1') + A('예, 시작', 'confirmStart', 'pri'));
  }
  function E5() { return P1() + busy('산문 초안을 쓰고 있어요', ['자료 정리', '이야기 뼈대', '씬 스토리 쓰기']); }

  /* ── Producer ── */
  function proseHtml() { return st.prose.map(function (p, i) { return '<p><span>S' + (i + 1) + '</span>' + esc(p) + '</p>'; }).join(''); }
  function proseMain(ro) {
    return '<div class="w-title"><h3>' + esc(st.title) + '</h3>' + B('브레이크다운하기 →', 'P6', 'pri') + '</div>' +
      (st.back ? '<div class="w-banner warn">' + esc(st.back) + '에서 돌아왔어요. 새 인물·배경을 산문에 넣고 다시 브레이크다운해 주세요. <span class="w-mut">(목업: "경비원", "옥상" 같은 말을 넣어 보세요)</span></div>' : '') +
      (ro ? '<div class="w-banner">대본을 그대로 쓰는 프로젝트예요. 산문을 고칠 수 없고, 확인한 뒤 브레이크다운만 할 수 있어요.</div>' : '') +
      '<div class="w-prose-tools">' + B('✦ AI 다시 쓰기', 'P3', 'acc', ro ? ' disabled' : '') + A('직접 작성', 'openDirect', '', ro ? ' disabled' : '') +
      '<span class="w-mut">' + esc(RUNTIMES[st.runtime][0]) + ' · ' + esc(MOODS[st.mood]) + ' 기준으로 쓴 산문</span></div>' +
      '<article class="w-prose">' + proseHtml() + '</article>';
  }
  function P1() { return studio('Producer', proseMain(false), { ph: '예: 팀장을 더 얄밉게' }); }
  function P1r() { return studio('Producer', proseMain(true), { noChat: true }); }
  function P3() {
    return P1() + modal('AI 다시 쓰기', '<p class="w-mut">이 값들은 산문을 쓰는 재료예요. 산문을 확정하면 여기서 끝나요.</p>' +
      '<div class="w-q"><div class="w-q-t">러닝타임</div>' + opts('runtime', RUNTIMES, st.runtime) + '</div>' +
      '<div class="w-q"><div class="w-q-t">글의 분위기 <small>이전 이름: 장르·톤</small></div>' + opts('mood', MOODS, st.mood) + '</div>' +
      '<div class="w-q"><div class="w-q-t">얼마나 바꿀까요?</div>' + opts('amount', AMOUNTS, st.amount) + '</div>',
      B('취소', 'P1') + A('다시 쓰기', 'rewrite', 'acc'), true);
  }
  function P2() { return P1() + busy('산문을 고치고 있어요', ['요청 읽기', '세 가지 안 쓰기']); }
  function P4() {
    if (!st.variants.length) makeVariants('');
    return P1() + modal('세 가지 안', '<p class="w-mut">' + esc(st.request ? '요청: ' + st.request : RUNTIMES[st.runtime][0] + ' · ' + MOODS[st.mood] + ' · ' + AMOUNTS[st.amount]) + '</p>' +
      '<div class="w-variants" role="radiogroup">' + st.variants.map(function (v, i) {
        return '<button class="w-var' + (i === st.vpick ? ' on' : '') + '" role="radio" aria-checked="' + (i === st.vpick) + '" data-bind="vpick" data-val="' + i + '"><b>안 ' + (i + 1) + '</b>' + esc(v[0]) + '</button>';
      }).join('') + '</div>',
      A('버리기', 'dropVariant') + A('이 안 적용', 'applyVariant', 'pri'), true);
  }
  function P5() {
    return studio('Producer', proseMain(false), { chatLocked: true }) +
      modal('직접 작성', '<p class="w-mut">팝업이 열려 있는 동안 에이전트 채팅은 잠겨요.</p>' +
        '<div class="w-q"><div class="w-q-t">제목</div><input class="w-in" data-bind="titleDraft" value="' + esc(st.titleDraft || st.title) + '" aria-label="제목"></div>' +
        st.draft.map(function (p, i) { return '<div class="w-q"><div class="w-q-t">S' + (i + 1) + '</div><textarea class="w-ta sm" rows="3" data-bind="draft.' + i + '" aria-label="씬 ' + (i + 1) + '">' + esc(p) + '</textarea></div>'; }).join('') +
        A('＋ 씬 추가', 'addScene', 'sm'),
        B('취소', 'P1') + A('저장', 'saveDirect', 'pri'), true);
  }
  function P6() {
    return P1() + modal('산문을 확정하고 브레이크다운할까요?', list([['🔒 산문', '확정하면 잠겨요'], ['다음', 'AI가 인물·배경을 글로 뽑아요'], ['나중에 인물·배경을 늘리려면', '여기 산문으로 돌아와야 해요']]),
      B('아니오', st.proseLocked ? 'P1r' : 'P1') + A('예, 브레이크다운', 'breakdown', 'pri'));
  }

  /* ── Artist ── */
  function card(x, i, isBg, img) {
    var idx = isBg ? st.chars.length + i : i;
    var tone = TONES[x.tone];
    var isNew = st.newItems.indexOf(x.n) >= 0;
    var h = '<div class="w-card' + (isNew ? ' is-new' : '') + '">';
    if (img) h += '<div class="w-img' + (isBg ? ' bg' : '') + (x.tone === 2 ? ' horror' : '') + '" style="background:' + (x.tone === 2 ? 'linear-gradient(135deg,#3a2b4a,#8a1f2e)' : styleBg(st.style)) + '">' + esc(x.n) + '</div>';
    h += '<b>' + esc(x.n) + ' <small>' + (isBg ? '배경' : '인물') + (isNew ? ' · 새로' : '') + '</small></b>';
    if (!img && st.descEdit === idx) h += '<textarea class="w-ta sm" rows="3" data-bind="' + (isBg ? 'bgs.' + i : 'chars.' + i) + '.d" aria-label="설명">' + esc(x.d) + '</textarea>';
    else h += '<p>' + esc(x.d) + '</p>';
    if (!isBg) h += '<ul class="w-states">' + x.states.map(function (s) { return '<li>' + esc(s) + '</li>'; }).join('') + '</ul>';
    if (img && (x.tone || x.note)) h += '<p class="w-tone">톤 ' + esc(tone) + (x.note ? ' · ' + esc(x.note) : '') + '</p>';
    h += '<div class="w-card-acts">';
    if (img) h += A('톤: ' + esc(tone) + ' ▾', 'openTone', 'sm', ' data-arg="' + idx + '"') + A('AI로 고치기', 'openTone', 'sm', ' data-arg="' + idx + '"');
    else h += (st.descEdit === idx ? A('완료', 'descDone', 'sm pri') : A('설명 고치기', 'descEdit', 'sm', ' data-arg="' + idx + '"')) + (isBg ? '' : '<button class="w-btn sm" disabled title="Storyboard에서 추가해요">상태 추가</button>');
    return h + '</div></div>';
  }
  function cards(img) {
    return '<div class="w-cards">' + st.chars.map(function (x, i) { return card(x, i, false, img); }).join('') + st.bgs.map(function (x, i) { return card(x, i, true, img); }).join('') + '</div>';
  }
  function A1() {
    var unnamed = /사람들|누군가|행인/.test(st.prose.join(' '));
    var main = '<div class="w-title"><h3>Artist · 브레이크다운</h3><span class="w-mut">확정 산문에서 뽑은 인물 ' + st.chars.length + ' · 배경 ' + st.bgs.length + '</span></div>' +
      '<div class="w-diag"><b>AI 진단</b>' + (st.newItems.length ? '새로 들어온 것: ' + esc(st.newItems.join(', ')) + '. ' : '산문의 인물과 장소를 모두 찾았어요. ') +
      (unnamed ? '"지나가던 사람들"처럼 이름 없는 인물은 따로 뽑지 않았어요. 필요하면 산문에서 이름을 붙여 주세요.' : '') + '</div>' +
      cards(false) + '<p class="w-note">상태 추가(씬마다 다른 옷·나이)는 Storyboard 단계에서 할 수 있어요.</p>' +
      '<div class="w-foot">' + B('빠진 인물·배경이 있어요', 'R1') + B('목록이 맞아요 · 스타일 고르기 →', 'A2', 'pri') + '</div>';
    return studio('Artist', main, { noChat: true });
  }
  function A0() { return A1() + busy('인물·배경을 뽑고 있어요', ['산문 읽기', '인물 · 배경 찾기', '인물별 상태 세분화']); }
  function rollbackModal(from, lose, no) {
    return modal('산문으로 돌아갈까요?', '<p>인물·배경은 산문에서 나와요. 산문에 넣어야 목록에 생겨요.</p>' + list(lose), B('아니오', no) + A('예, 산문으로', 'rollback', 'warn', ' data-arg="' + from + '"'));
  }
  function R1() { return A1() + rollbackModal('Artist', [['잃는 것', '없음 (아직 그림이 없어요)'], ['다음', 'Producer 산문이 다시 열려요 → 고치고 다시 브레이크다운']], 'A1'); }
  function A2() {
    var main = '<div class="w-title"><h3>Artist · 스타일</h3><span class="w-mut">이 작품의 스타일은 하나예요</span></div>' +
      '<div class="w-styles" role="radiogroup">' + STYLES.map(function (s, i) {
        return '<button class="w-sty' + (i === st.style ? ' on' : '') + '" role="radio" aria-checked="' + (i === st.style) + '" data-bind="style" data-val="' + i + '"><i style="background:' + styleBg(i) + '"></i>' + esc(s[0]) + '</button>';
      }).join('') + '</div>' + cards(false) +
      '<div class="w-foot"><span class="w-mut">인물 ' + st.chars.length + ' · 배경 ' + st.bgs.length + ' · 예상 크레딧 표시 자리</span>' + B(esc(STYLES[st.style][0]) + ' 스타일로 전체 생성', 'A3', 'acc') + '</div>';
    return studio('Artist', main, { noChat: true });
  }
  function A3() {
    var n = st.chars.reduce(function (a, c) { return a + c.states.length; }, 0);
    return A2() + modal(STYLES[st.style][0] + ' 스타일로 만들까요?', list([['만드는 것', '인물 시트 ' + st.chars.length + ' (상태 ' + n + ') · 배경 ' + st.bgs.length], ['🔒 스타일', esc(STYLES[st.style][0]) + '으로 잠겨요. 바꾸면 전체를 다시 만들어요'], ['예상 크레딧', '표시 자리']]),
      B('아니오', 'A2') + A('예, 만들기', 'generate', 'acc'));
  }
  function A4() { return A2() + busy('그림을 만들고 있어요', st.chars.map(function (c) { return c.n + ' 시트'; }).concat(st.bgs.map(function (b) { return b.n; }))); }
  function A5() {
    var main = '<div class="w-title"><h3>Artist</h3>' + B('다음: Storyboard로 →', 'A9', 'pri') + '</div>' +
      '<div class="w-stybar"><i style="background:' + styleBg(st.style) + '"></i><b>' + esc(STYLES[st.style][0]) + '</b><span class="w-lock">🔒 스타일</span>' + B('스타일 바꾸기', 'A6', 'warn sm') + '</div>' +
      cards(true) + '<div class="w-foot">' + B('＋ 인물·배경 추가', 'R2') + '</div>';
    return studio('Artist', main, { ph: '예: 민호 넥타이를 더 느슨하게' });
  }
  function A6() {
    return A5() + modal('스타일을 바꾸면 전체를 다시 만들어요', list([['다시 만드는 것', '인물 시트 ' + st.chars.length + ' · 배경 ' + st.bgs.length], ['그대로인 것', '객체별 톤'], ['예상 크레딧', '표시 자리']]),
      B('아니오', 'A5') + A('예, 스타일 다시 고르기', 'unlockStyle', 'warn'));
  }
  function A7() {
    var t = target();
    return A5() + modal(t.n + '의 톤', '<p>이 객체에만 적용돼요. 스타일(' + esc(STYLES[st.style][0]) + ' 🔒)과 다른 객체는 그대로예요.</p>' +
      opts('toneDraft', TONES, st.toneDraft) +
      '<div class="w-q"><div class="w-q-t">AI에게 고칠 점 <small>선택</small></div><input class="w-in" data-bind="tweak" value="' + esc(st.tweak) + '" placeholder="예: 넥타이를 더 느슨하게" aria-label="고칠 점"></div>' +
      list([['다시 만드는 것', esc(t.n) + ' 1장'], ['예상 크레딧', '표시 자리']]),
      B('취소', 'A5') + A(esc(t.n) + '만 다시 만들기', 'applyTone', 'acc'));
  }
  function A8() { return A5() + busy(target().n + '을(를) 다시 만들고 있어요'); }
  function R2() { return A5() + rollbackModal('Artist', [['그대로인 것', '바뀌지 않은 인물·배경 그림 (제안 · 개발 확인)'], ['다시 하는 것', '산문 확정 → 브레이크다운 → 새 객체 그림'], ['🔒 스타일', esc(STYLES[st.style][0]) + ' 유지']], 'A5'); }
  function A9() {
    return A5() + modal('Storyboard로 넘길까요?', list([['넘어가는 것', '확정 산문 · 인물 ' + st.chars.length + ' · 배경 ' + st.bgs.length + ' · 🔒 ' + esc(STYLES[st.style][0])], ['다음', 'AI가 씬·샷을 나누고 러프를 그려요'], ['나중에 인물·배경을 늘리려면', '산문으로 롤백해야 해요. 상태는 Storyboard에서 추가할 수 있어요']]),
      B('아니오', 'A5') + A('예, 넘기기', 'toBoard', 'pri'));
  }

  /* ── Storyboard ── */
  function S1() {
    var tt = total(), target = RUNTIMES[st.runtime][2], pct = Math.min(100, Math.round(tt / target * 100));
    var over = tt > target;
    var main = '<div class="w-title"><h3>Storyboard <small class="w-tbd">이름 미정</small></h3>' + B('다음: Director로 →', 'S7', 'pri') + '</div>' +
      '<div class="w-rt' + (over ? ' over' : '') + '"><div class="w-rt-h"><span>러닝타임</span><b>' + tt + '초</b><span class="w-mut">/ 목표 ' + esc(RUNTIMES[st.runtime][0]) + '</span>' + (over ? '<span class="w-warn-t">목표보다 길어요</span>' : '') + '</div>' +
      '<div class="w-rt-bar"><i style="width:' + pct + '%"></i></div><small class="w-mut">샷 길이의 합이에요. 고치는 칸이 아니라 지표예요. 샷 길이를 바꾸면 같이 바뀌어요.</small></div>' +
      '<div class="w-tools">' + B('＋ 샷 추가', 'S4') + B('＋ 인물·배경 상태 추가', 'S5') +
      '<label class="w-mut">대사 언어 <select data-bind="dlgLang" aria-label="대사 언어"><option value="0"' + (st.dlgLang == 0 ? ' selected' : '') + '>한국어</option><option value="1"' + (st.dlgLang == 1 ? ' selected' : '') + '>English</option><option value="2"' + (st.dlgLang == 2 ? ' selected' : '') + '>대사마다 따로</option></select></label></div>' +
      '<div class="w-shots">' + st.shots.map(function (s, i) {
        return '<div class="w-shot' + (s.fresh ? ' is-new' : '') + '"><div class="w-fr' + (s.redrawn ? ' drawn' : '') + '"><i></i><i></i><i></i></div><div class="w-shot-c"><b>' + shotLabel(i) + '</b><span>' + s.len + '초</span></div>' +
          '<small>' + esc(CAMS[s.cam]) + ' · ' + esc(s.desc) + '</small>' +
          (s.lines.length ? '<small class="w-dl">' + s.lines.map(function (l) { return esc(st.chars[l.w] ? st.chars[l.w].n : '') + ' "' + esc(l.t) + '" ' + (st.dlgLang == 2 ? '[' + l.lang + ']' : ''); }).join('<br>') + '</small>' : '') +
          '<div class="w-card-acts">' + A('고치기', 'editShot', 'sm', ' data-arg="' + i + '"') + A('다시 그리기', 'redraw', 'sm', ' data-arg="' + i + '"') + '</div></div>';
      }).join('') + '</div><p class="w-note">END 샷은 없어요. 마지막 샷이 끝이에요.</p>';
    return studio('Storyboard', main, { ph: '예: S2를 더 빠르게' });
  }
  function S0() { return S1() + busy('씬·샷을 나누고 러프를 그리고 있어요', ['씬 촬영 계획', '샷 나누기', '샷 설계 · 대사', '러프 그리기']); }
  function S2() {
    if (!st.shotDraft) st.shotDraft = clone(st.shots[st.shotSel]);
    var d = st.shotDraft;
    return S1() + modal(shotLabel(st.shotSel) + ' 고치기',
      '<div class="w-q"><div class="w-q-t">길이</div>' + opts('shotDraft.len', ['1초', '2초', '3초', '4초', '5초', '6초'].map(function (x) { return x; }), d.len - 1) + '</div>' +
      '<div class="w-q"><div class="w-q-t">카메라</div>' + opts('shotDraft.cam', CAMS, d.cam) + '</div>' +
      '<div class="w-q"><div class="w-q-t">무엇이 보이나</div><input class="w-in" data-bind="shotDraft.desc" value="' + esc(d.desc) + '" aria-label="샷 설명"></div>' +
      '<div class="w-q"><div class="w-q-t">대사 <small>직접 쓴 대사는 그대로 보존돼요</small></div>' +
      d.lines.map(function (l, i) {
        return '<div class="w-line"><select data-bind="shotDraft.lines.' + i + '.w" aria-label="누가">' + st.chars.map(function (c, k) { return '<option value="' + k + '"' + (k == l.w ? ' selected' : '') + '>' + esc(c.n) + '</option>'; }).join('') + '</select>' +
          '<input class="w-in" data-bind="shotDraft.lines.' + i + '.t" value="' + esc(l.t) + '" aria-label="대사">' +
          '<span class="w-opts">' + ['한', '영'].map(function (g) { return '<button class="w-opt sm' + (l.lang === g ? ' on' : '') + '" data-bind="shotDraft.lines.' + i + '.lang" data-sval="' + g + '">' + g + '</button>'; }).join('') + '</span>' +
          '<button class="w-x" data-act="delLine" data-arg="' + i + '" aria-label="대사 지우기">×</button></div>';
      }).join('') + A('＋ 대사', 'addLine', 'sm') + '</div>',
      A('취소', 'cancelShot') + A('적용하고 다시 그리기', 'applyShot', 'acc'), true);
  }
  function S3() { return S1() + busy('샷을 다시 그리고 있어요'); }
  function S4() {
    var a = st.add;
    var people = []; st.chars.forEach(function (c, i) { c.states.forEach(function (s) { people.push([c.n, s.replace(/^(기본|파생): /, ''), i]); }); });
    return S1() + modal('샷 추가', '<div class="w-q"><div class="w-q-t">어디에</div>' + opts('add.pos', st.shots.map(function (s, i) { return shotLabel(i) + ' 뒤'; }), a.pos) + '</div>' +
      '<div class="w-q"><div class="w-q-t">인물 <small>지금 목록에서만 골라요</small></div>' + opts('add.who', people.map(function (p) { return [p[0], p[1]]; }), a.who) + '</div>' +
      '<div class="w-q"><div class="w-q-t">배경</div>' + opts('add.bg', st.bgs.map(function (b) { return b.n; }), a.bg) + '</div>' +
      '<div class="w-q"><div class="w-q-t">무엇이 보이나</div><input class="w-in" data-bind="add.desc" value="' + esc(a.desc) + '" placeholder="예: 민호가 캔 하나를 겨우 줍는다" aria-label="새 샷 설명"></div>' +
      B('목록에 없는 인물·배경이 필요해요', 'S4q', 'w-link'),
      B('취소', 'S1') + A('추가하고 그리기', 'addShot', 'acc'), true);
  }
  function R3() { return S1() + rollbackModal('Storyboard', [['영향받는 것', '샷 ' + st.shots.length + ' · 러프 ' + st.shots.length * 3 + '장 (개발 확인: 바뀌지 않은 샷 유지 여부)'], ['그대로인 것', '🔒 화면 비율 · 🔒 스타일'], ['예상 크레딧', '표시 자리']], 'S4'); }
  function S5() {
    var who = st.chars.map(function (c) { return c.n; }).concat(st.bgs.map(function (b) { return b.n; }));
    return S1() + modal('상태 추가', '<p>기본 모습에서 파생된 상태를 더해요. 롤백 없이 돼요.</p>' +
      '<div class="w-q"><div class="w-q-t">누구 · 어디</div>' + opts('stateAdd.who', who, st.stateAdd.who) + '</div>' +
      '<div class="w-q"><div class="w-q-t">어떤 상태</div><input class="w-in" data-bind="stateAdd.text" value="' + esc(st.stateAdd.text) + '" aria-label="상태"></div>',
      B('취소', 'S1') + A('상태 만들기', 'addState', 'acc', ' data-need="stateAdd.text"'), true);
  }
  function S6() { return S1() + busy('상태 시트를 만들고 있어요'); }
  function S7() {
    return S1() + modal('Director로 넘길까요?', list([['넘어가는 것', '샷 ' + st.shots.length + ' · 러프 · 인물 시트 · 배경'], ['러닝타임', total() + '초'], ['다음', 'Director가 시트를 참조해 실사 컷을 만들어요']]),
      B('아니오', 'S1') + B('예, 넘기기', 'D1', 'pri'));
  }
  function D1() {
    return bar('Director') + '<div class="w-entry"><h3>Director → Editor</h3><p class="w-mut">이번 축소 범위 밖이에요. 기존 화면을 그대로 써요.</p>' +
      '<p class="w-note">함께 확인: Director가 Artist 인물 시트를 참조하는지 (오류 13), 러프 마네킹이 인물로 이어지지 않는지 (오류 12).</p>' + A('처음부터 다시', 'reset') + '</div>';
  }

  var SCREENS = { E1: E1, E1m: E1m, E2: E2, E3: E3, E4: E4, E5: E5, P1: P1, P1r: P1r, P2: P2, P3: P3, P4: P4, P5: P5, P6: P6,
    A0: A0, A1: A1, R1: R1, A2: A2, A3: A3, A4: A4, A5: A5, A6: A6, A7: A7, A8: A8, R2: R2, A9: A9,
    S0: S0, S1: S1, S2: S2, S3: S3, S4: S4, R3: R3, S5: S5, S6: S6, S7: S7, D1: D1 };
  // 갈림 노드는 그 갈림을 묻는 화면으로
  var DECISION_SCREEN = { E1q: 'E1', E1mq: 'E1m', E2q: 'E3', E5q: 'E4', P1q: 'P1', A1q: 'A1', A5q: 'A5', S1q: 'S1', S4q: 'S4' };
  // AI 작업이 끝나면 가는 곳
  var BUSY_NEXT = {
    E2: function () { return !st.file || !KINDS[st.kind].o.length ? 'E4' : 'E3'; },
    E5: 'P1', P2: 'P4', A0: 'A1', A4: 'A5', A8: 'A5', S0: 'S1', S3: 'S1', S6: 'S1',
  };
  var preserve = function () { return st.file && KINDS[st.kind].keep.indexOf(st.level) >= 0; };

  /* ── 동작 ── */
  function makeVariants(req) {
    var rt = RUNTIMES[st.runtime][0], md = MOODS[st.mood];
    var base = req ? '"' + req + '" 반영: ' : rt + ' · ' + md + ' · ' + AMOUNTS[st.amount] + ': ';
    var M = {
      '코미디': ['민호가 자판기를 발로 차자 캔이 쏟아지고, 팀장이 "고마워" 하고 하나를 가져간다.', '민호가 마지막 동전을 넣는다. 캔은 안 나오고, 팀장이 오자 우르르 쏟아진다.', '자판기가 민호만 무시한다. 팀장 앞에서는 캔을 선물하듯 내민다.'],
      '드라마': ['야근 중인 민호. 자판기마저 응답이 없다. 팀장이 말없이 캔 하나를 건넨다.', '민호의 마지막 동전. 자판기는 멈추고, 복도엔 형광등 소리만 남는다.', '쏟아진 캔을 줍는 민호와 팀장. 처음으로 둘이 웃는다.'],
      '로맨스': ['자판기 앞에서 마주친 민호와 신입. 쏟아진 캔을 같이 줍는다.', '민호가 누른 버튼에서 두 개가 나온다. 하나를 옆 사람에게 건넨다.', '고장 난 자판기 앞, 같은 음료를 고른 두 사람.'],
      '스릴러': ['복도 불이 깜박인다. 자판기에서 캔 대신 낯선 열쇠가 떨어진다.', '민호가 자판기를 치자 안쪽에서 누군가 두드린다.', '캔이 쏟아지는 순간 CCTV가 꺼진다.'],
      '호러': ['밤 열한 시. 자판기 불빛만 켜진 복도에서 캔이 저절로 굴러온다.', '민호가 버튼을 누르자 자판기 유리에 다른 얼굴이 비친다.', '쏟아진 캔이 모두 같은 날짜로 찍혀 있다. 오늘 밤.'],
    }[md];
    st.variants = M.map(function (t) { return [base + t, t]; });
    st.vpick = 0;
  }
  function detectNew() {
    var text = st.prose.join(' ');
    var added = [];
    EXTRA_PEOPLE.forEach(function (p) { if (text.indexOf(p[0]) >= 0 && !st.chars.some(function (c) { return c.n === p[0]; })) { st.chars.push({ n: p[0], d: p[1], states: ['기본'], tone: 0, note: '' }); added.push(p[0]); } });
    EXTRA_PLACES.forEach(function (p) { if (text.indexOf(p[0]) >= 0 && !st.bgs.some(function (b) { return b.n === p[0]; })) { st.bgs.push({ n: p[0], d: p[1], tone: 0 }); added.push(p[0]); } });
    st.newItems = added;
    if (added.length) st.generated = false;
  }
  var ACTS = {
    sample: function (k) { var f = SAMPLE_FILES.filter(function (s) { return s[0] === k; })[0]; st.file = { name: f[1], image: k.charAt(0) === '2' }; st.kind = k; st.level = 0; },
    clearFile: function () { st.file = null; st.kind = '1-3'; },
    start: function () { return st.file && st.file.image ? 'E1m' : 'E2'; },
    denyImage: function () { st.file = null; st.kind = '1-3'; return 'E1'; },
    cycleKind: function () { var ks = Object.keys(KINDS).filter(function (k) { return KINDS[k].o.length; }); st.kind = ks[(ks.indexOf(st.kind) + 1) % ks.length]; st.level = 0; },
    confirmStart: function () {
      st.ratioLocked = true;
      if (preserve()) { st.proseLocked = true; return 'P1r'; }
      st.pending = function () { if (st.idea.trim()) st.title = st.idea.trim().split(/[.\n]/)[0].slice(0, 18) || st.title; };
      return 'E5';
    },
    send: function () {
      var t = st.chatDraft.trim(); if (!t) return;
      st.chatDraft = '';
      var on = cur.charAt(0) === 'P' ? 'Producer' : cur.charAt(0) === 'A' ? 'Artist' : 'Storyboard';
      say(on, '나', t);
      if (on === 'Producer') { st.request = t; st.pending = function () { makeVariants(t); say('Producer', 'Producer', '요청대로 세 가지 안을 썼어요. 하나를 골라 주세요.'); }; return 'P2'; }
      if (on === 'Artist') { st.target = 0; var x = target(); st.pending = function () { x.note = t; say('Artist', 'Artist', x.n + '을(를) 다시 만들었어요.'); }; return 'A8'; }
      st.pending = function () { st.shots.forEach(function (s) { s.redrawn = true; }); say('Storyboard', 'Storyboard', '요청을 반영해 샷을 다시 그렸어요.'); };
      return 'S3';
    },
    rewrite: function () { st.request = ''; st.pending = function () { makeVariants(''); say('Producer', 'Producer', RUNTIMES[st.runtime][0] + ' · ' + MOODS[st.mood] + '으로 세 가지 안을 썼어요.'); }; return 'P2'; },
    applyVariant: function () {
      var v = st.variants[st.vpick]; if (!v) return 'P1';
      st.prose[0] = v[1]; st.variants = [];
      say('Producer', 'Producer', '안 ' + (st.vpick + 1) + '을(를) 적용했어요.');
      return 'P1';
    },
    dropVariant: function () { st.variants = []; say('Producer', 'Producer', '수정안을 버리고 원래 산문을 유지해요.'); return 'P1'; },
    openDirect: function () { st.draft = st.prose.slice(); st.titleDraft = st.title; return 'P5'; },
    addScene: function () { st.draft.push(''); },
    saveDirect: function () { st.prose = st.draft.filter(function (p) { return p.trim(); }); if (st.titleDraft && st.titleDraft.trim()) st.title = st.titleDraft.trim(); say('Producer', 'Producer', '직접 고친 산문을 저장했어요.'); return 'P1'; },
    breakdown: function () { st.proseLocked = true; st.back = ''; st.pending = detectNew; return 'A0'; },
    rollback: function (from) { st.proseLocked = false; st.back = from; st.ratioLocked = true; return 'P1'; },
    descEdit: function (i) { st.descEdit = +i; },
    descDone: function () { st.descEdit = -1; },
    generate: function () { st.styleLocked = true; st.pending = function () { st.generated = true; st.newItems = []; say('Artist', 'Artist', STYLES[st.style][0] + '으로 그림을 만들었어요. 특정 객체만 톤을 바꾸려면 카드의 톤을 눌러 주세요.'); }; return 'A4'; },
    unlockStyle: function () { st.styleLocked = false; st.generated = false; return 'A2'; },
    openTone: function (i) { st.target = +i; var t = target(); st.toneDraft = t.tone; st.tweak = t.note || ''; return 'A7'; },
    applyTone: function () { var t = target(), tone = st.toneDraft, tw = st.tweak; st.pending = function () { t.tone = tone; t.note = tw; say('Artist', 'Artist', t.n + '을(를) ' + TONES[tone] + ' 톤으로 다시 만들었어요.'); }; return 'A8'; },
    toBoard: function () { st.pending = function () { st.shots.forEach(function (s) { s.redrawn = false; s.fresh = false; }); say('Storyboard', 'Storyboard', '씬 ' + st.prose.length + '개를 샷 ' + st.shots.length + '개로 나눴어요. 지금 약 ' + total() + '초예요.'); }; return 'S0'; },
    editShot: function (i) { st.shotSel = +i; st.shotDraft = clone(st.shots[+i]); return 'S2'; },
    redraw: function (i) { var s = st.shots[+i]; st.pending = function () { s.redrawn = true; }; return 'S3'; },
    addLine: function () { st.shotDraft.lines.push({ w: 0, t: '', lang: st.dlgLang == 1 ? '영' : '한' }); },
    delLine: function (i) { st.shotDraft.lines.splice(+i, 1); },
    cancelShot: function () { st.shotDraft = null; return 'S1'; },
    applyShot: function () {
      var d = st.shotDraft, i = st.shotSel; st.shotDraft = null;
      d.len = +d.len; d.cam = +d.cam;
      d.lines = d.lines.filter(function (l) { return l.t.trim(); }).map(function (l) { l.w = +l.w; return l; });
      st.pending = function () { d.redrawn = true; st.shots[i] = d; say('Storyboard', 'Storyboard', shotLabel(i) + '을(를) 고쳐서 다시 그렸어요. 지금 ' + total() + '초예요.'); };
      return 'S3';
    },
    addShot: function () {
      var a = st.add, people = []; st.chars.forEach(function (c, i) { c.states.forEach(function () { people.push(i); }); });
      var after = st.shots[a.pos] || st.shots[st.shots.length - 1];
      var shot = { sc: after.sc, len: 2, cam: 1, desc: a.desc.trim() || (st.chars[people[a.who]] || st.chars[0]).n + ' · ' + st.bgs[a.bg].n, who: [people[a.who] || 0], lines: [], fresh: true, redrawn: true };
      var pos = a.pos;
      st.pending = function () { st.shots.splice(pos + 1, 0, shot); say('Storyboard', 'Storyboard', '샷을 하나 추가했어요. 지금 ' + total() + '초예요.'); };
      st.add.desc = '';
      return 'S3';
    },
    addState: function () {
      var w = st.stateAdd.who, text = st.stateAdd.text.trim(); if (!text) return;
      st.pending = function () {
        if (w < st.chars.length) st.chars[w].states.push('파생: ' + text);
        else st.bgs[w - st.chars.length].d += ' / 상태: ' + text;
        say('Storyboard', 'Storyboard', '"' + text + '" 상태 시트를 만들었어요. 샷 추가에서 고를 수 있어요.');
      };
      return 'S6';
    },
    skip: function () { return finishBusy(true); },
    reset: function () { st = initial(); return 'E1'; },
  };

  /* ── 엔진 ── */
  var root = null, cur = null, host = {}, timer = null;
  function setPath(obj, path, val) {
    var ks = path.split('.'), o = obj;
    for (var i = 0; i < ks.length - 1; i++) o = o[ks[i]];
    var last = ks[ks.length - 1];
    if (path === 'shotDraft.len') val = +val + 1;
    o[last] = val;
  }
  function getPath(obj, path) { return path.split('.').reduce(function (o, k) { return o == null ? o : o[k]; }, obj); }
  function screenFor(id) { return SCREENS[id] ? id : DECISION_SCREEN[id] || null; }
  function paint() {
    if (!root) return;
    var sid = screenFor(cur);
    var focusId = document.activeElement && root.contains(document.activeElement) ? document.activeElement.getAttribute('data-bind') : null;
    root.innerHTML = sid ? SCREENS[sid]() : '<div class="w-entry"><p class="w-mut">이 노드는 화면이 없어요.</p></div>';
    refresh();
    if (focusId) { var el = root.querySelector('[data-bind="' + focusId + '"]:not(.w-opt)'); if (el && el.focus) el.focus(); }
    var dlg = root.querySelector('.w-modal');
    if (dlg && !focusId) { var f = dlg.querySelector('input, textarea, .w-acts .w-btn:last-child'); if (f) f.focus({ preventScroll: true }); }
  }
  // 입력이 있으면 버튼을 켠다 (오류 #10)
  function refresh() {
    root.querySelectorAll('[data-need]').forEach(function (b) {
      var ok = b.getAttribute('data-need').split('|').some(function (p) { var v = getPath(st, p); return typeof v === 'string' ? v.trim() : !!v; });
      b.disabled = !ok;
    });
  }
  function startBusy() {
    clearInterval(timer);
    st.busyStep = 0;
    var steps = (root && root.querySelectorAll('.w-steps li').length) || 3;
    timer = setInterval(function () {
      st.busyStep++;
      if (st.busyStep > steps) { finishBusy(); return; }
      paint();
    }, 650);
  }
  function finishBusy(manual) {
    clearInterval(timer); timer = null;
    var nx = BUSY_NEXT[cur]; if (typeof nx === 'function') nx = nx();
    if (st.pending) { var p = st.pending; st.pending = null; p(); }
    if (nx) { if (manual) return nx; go(nx); }
  }
  function show(id) {
    clearInterval(timer); timer = null;
    cur = id;
    if (id === 'P1' && st.proseLocked) st.proseLocked = false;
    paint();
    if (BUSY_NEXT[id]) startBusy();
  }
  function go(id) { show(id); if (host.onNavigate) host.onNavigate(id); }
  function run(act, arg) {
    var fn = ACTS[act]; if (!fn) return;
    var to = fn(arg);
    if (to) go(to); else paint();
  }

  function mount(el, h) {
    root = el; host = h || {};
    el.addEventListener('click', function (e) {
      var t = e.target;
      var b = t.closest('[data-act]');
      if (b && !b.disabled) { e.preventDefault(); run(b.getAttribute('data-act'), b.getAttribute('data-arg')); return; }
      var g = t.closest('[data-go]');
      if (g && !g.disabled) { e.preventDefault(); go(g.getAttribute('data-go')); return; }
      var o = t.closest('button[data-bind]');
      if (o) {
        var v = o.hasAttribute('data-sval') ? o.getAttribute('data-sval') : +o.getAttribute('data-val');
        var p = o.getAttribute('data-bind');
        if (p === 'ratio') v = RATIOS[v][0];
        setPath(st, p, v); paint();
      }
    });
    el.addEventListener('input', function (e) {
      var t = e.target, p = t.getAttribute && t.getAttribute('data-bind');
      if (!p || t.tagName === 'BUTTON') return;
      setPath(st, p, t.tagName === 'SELECT' ? +t.value : t.value);
      refresh();
    });
    el.addEventListener('change', function (e) {
      var t = e.target;
      if (t.id === 'file-in' && t.files && t.files[0]) {
        var f = t.files[0], img = /^image\//.test(f.type);
        st.file = { name: f.name, image: img }; st.kind = img ? '2-3' : '1-1'; st.level = 0; paint();
      } else if (t.tagName === 'SELECT' && t.getAttribute('data-bind') === 'dlgLang') paint();
    });
    el.addEventListener('keydown', function (e) {
      var t = e.target;
      if (e.key === 'Enter' && !e.isComposing && t.getAttribute && t.getAttribute('data-enter')) { e.preventDefault(); run(t.getAttribute('data-enter')); }
      if (e.key === 'Escape') { var c = root.querySelector('.w-acts .w-btn'); if (c) c.click(); }
    });
  }

  window.PROTO = {
    mount: mount, show: show,
    has: function (id) { return !!screenFor(id); },
    screenFor: screenFor,
    reset: function () { st = initial(); show(cur); },
    current: function () { return cur; },
  };
})();
