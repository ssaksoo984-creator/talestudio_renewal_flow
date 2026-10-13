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
  var MOODS = ['코미디', '드라마', '로맨스', '스릴러', '호러', '액션', 'SF·판타지', '미스터리', '휴먼·가족', '일상·잔잔'];
  var TONES = ['작품 기본', '코미디', '호러', '로맨스', '따뜻하게'];
  var CAMS = ['와이드 · 고정', '미디엄 · 고정', '클로즈업', '와이드 · 틸트 다운', '미디엄 · 팬'];
  var STYLES = [['실사', '#5b6470,#22262c'], ['애니메이션', '#ffb4a2,#8aa6ff'], ['웹툰', '#fff3c4,#ffd0e0'], ['3D', '#9be1d4,#5f7fd9'], ['수채화', '#d9ecf5,#f4d9c6'], ['견본 이미지', '#c9c2b8,#8f8a83']];
  // 바꿈 정도: AI가 내 글을 얼마나 바꾸는지. 단계마다 지키는 것과 바꾸는 것을 못박는다.
  var LEVELS = [
    { n: '그대로', s: '내 글을 그대로 써요', keep: '문장 · 대사 · 줄거리 · 결말', change: '장면 나누기와 빠진 연출만', need: true },
    { n: '다듬기', s: '재료는 두고 표현을 고쳐요', keep: '소재 · 인물 · 줄거리 · 결말', change: '문장 · 대사 · 장면 순서' },
    { n: '새롭게 키우기', s: '재료에서 출발해 아이디어를 더해요', keep: '소재 · 장르·분위기 · 길이', change: '줄거리 · 인물 · 결말에 새 아이디어' },
  ];
  // 지금 읽는 자료: 글 파일과 글이 담긴 이미지. 웹툰 · 캐릭터 시트 · 참조 사진은 v2.
  var KINDS = {
    '1-1': { name: '영상까지 고려된 대본', rec: 0, rt: 2 },
    '1-2': { name: '일반 대본 (연극·고전 대본)', rec: 0, rt: 2 },
    '1-3': { name: '아이디어 노트', rec: 2, rt: 1 },
    'img': { name: '글이 담긴 이미지 (사진 찍은 대본·메모)', rec: 1, rt: 1 },
  };
  // 대본 파일이면 유저 플로우 정리본(1-1 · 1-2)의 말로 묻는다: 바로 영상화 / 조금 다듬어서 / 완전 새롭게
  var SCRIPT_LEVELS = {
    '1-1': [{ n: '바로 영상화', s: '대본을 그대로 샷으로 나눠요', keep: '대본 전체', change: '샷 나누기만', need: true },
      { n: '조금 다듬어서', s: '바뀐 부분만 새로 써요', keep: '고치지 않은 장면 · 대사', change: '고친 부분만' },
      { n: '완전 새롭게', s: '대본을 바탕으로 새 영상을 만들어요', keep: '소재 · 인물 설정', change: '줄거리 · 장면 · 대사' }],
    '1-2': [{ n: '바로 영상화', s: '원본은 그대로, 영상에 빠진 것만 채워요', keep: '대본 전체', change: '빠진 연출 · 인물 · 배경만', need: true },
      { n: '조금 다듬어서', s: '바뀐 부분만 새로 써요', keep: '고치지 않은 장면 · 대사', change: '고친 부분만' },
      { n: '완전 새롭게', s: '대본을 바탕으로 새 영상을 만들어요', keep: '소재 · 인물 설정', change: '줄거리 · 장면 · 대사' }],
  };
  var isScript = function () { return !!(st.file && !st.file.noText && SCRIPT_LEVELS[st.kind]); };
  var LV = function () { return isScript() ? SCRIPT_LEVELS[st.kind] : LEVELS; };
  var LV_Q = function () { return isScript() ? '대본을 어떻게 쓸까요?' : 'AI가 내 글을 얼마나 바꿀까요?'; };
  var MIN_LEN = 20;
  var TEXT_EXT = ['txt', 'md', 'docx', 'pdf', 'hwp'], IMG_EXT = ['png', 'jpg', 'jpeg'];
  var OCR_LINE = '민호: "…또 안 나와?" / 팀장: "고마워." (사진에서 읽은 대본 첫 줄)';
  var ideaLen = function () { return st.idea.trim().length; };
  var hasText = function () { return (st.file && !st.file.noText) || ideaLen() >= 60; };
  var levelOk = function (i) { return !LV()[i].need || hasText(); };
  var recLevel = function () { if (st.file && !st.file.noText) return KINDS[st.kind].rec; return ideaLen() >= 60 ? 1 : 2; };
  // AI가 글을 읽고 고르는 추천 (목업용 간단한 규칙)
  function recommend() {
    var t = st.idea, mood = -1, why = '';
    MOODS.forEach(function (m, i) { if (mood < 0 && t.indexOf(m.split('·')[0]) >= 0) { mood = i; why = '글에 "' + m.split('·')[0] + '"라고 적혀 있어요'; } });
    var H = [[/고장|자판기|웃기|엉뚱/, 0, '엉뚱한 사건이라 코미디로 읽었어요'], [/귀신|무서|밤 열|CCTV/, 4, '무서운 장면이 있어 호러로 읽었어요'], [/사랑|설레|옥상에서 마주/, 2, '두 사람의 감정이 중심이라 로맨스로 읽었어요'], [/가족|아버지|엄마|딸|아들/, 8, '가족 이야기라 휴먼·가족으로 읽었어요'], [/로봇|우주|미래|시간/, 6, '상상 속 설정이라 SF·판타지로 읽었어요'], [/범인|단서|사라진/, 7, '숨은 비밀을 쫓는 이야기라 미스터리로 읽었어요']];
    if (mood < 0) H.some(function (h) { if (h[0].test(t)) { mood = h[1]; why = h[2]; return true; } });
    if (mood < 0 && st.file && !st.file.noText) { mood = 0; why = '대본 대사가 가벼워 코미디로 읽었어요'; }
    if (mood < 0) { mood = 1; why = '뚜렷한 장르가 없어 드라마로 골랐어요'; }
    var rt, rwhy, m = t.match(/(\d+)\s*(초|분)/);
    if (m) { var sec = +m[1] * (m[2] === '분' ? 60 : 1); rt = sec <= 15 ? 0 : sec <= 60 ? 1 : sec <= 300 ? 2 : 3; rwhy = '글에 "' + m[0] + '"이라고 적혀 있어요'; }
    else if (st.file && !st.file.noText) { rt = KINDS[st.kind].rt; rwhy = '대본 분량으로 짐작했어요'; }
    else { rt = ideaLen() < 60 ? 1 : 2; rwhy = ideaLen() < 60 ? '짧은 아이디어라 짧게 잡았어요' : '줄거리 분량으로 짐작했어요'; }
    var lv = recLevel();
    st.rec = { mood: mood, moodWhy: why, runtime: rt, runtimeWhy: rwhy, level: lv };
    st.mood = mood; st.runtime = rt; st.level = lv;
  }
  // 목업용 예시 파일: [종류, 이름]. bad = 확장자 오류, notext = 글 없는 이미지
  var SAMPLE_FILES = [['1-1', '자판기_촬영대본.docx'], ['1-2', '자판기_연극대본.hwp'], ['1-3', '아이디어_메모.txt'], ['img', '대본_사진.jpg'], ['notext', '복도_풍경.png'], ['bad', '예고편.mp4'], ['bad', '자료모음.zip']];
  var EXTRA_PEOPLE = [['경비원', '50대. 남색 경비 제복, 무전기.'], ['청소부', '60대. 하늘색 작업복, 밀대.'], ['신입', '20대 초반. 사원증을 목에 건 신입 사원.'], ['고양이', '회색 길고양이. 꼬리가 짧다.']];
  var EXTRA_PLACES = [['옥상', '해 질 녘 회사 옥상, 난간과 물탱크.'], ['편의점', '1층 편의점 계산대 앞.'], ['회의실', '유리벽 회의실, 화이트보드.']];

  function initial() {
    return {
      idea: '회사 복도 자판기가 고장 나서 캔이 우르르 쏟아지는 코미디. 주인공 민호는 하나도 못 먹는다.',
      file: null, kind: '1-3', level: 2, ratio: '9:16', ratioLocked: false, lenErr: false, fileErr: '', rec: null,
      title: '자판기의 반란',
      prose: [
        '회사 복도, 오후 세 시. 민호가 자판기 버튼을 누르지만 아무것도 나오지 않는다. 동전 반환 레버를 당겨 봐도 조용하다. 민호는 자판기를 툭 친다.',
        '자판기가 덜컹거리더니 캔이 우르르 쏟아진다. 지나가던 팀장이 하나를 집어 들고 "고마워" 하고 간다. 바닥에 굴러다니는 캔 사이에서 민호는 멍하니 서 있다.',
      ],
      plan: 'A', pop: null, showEx: false, exPage: 0, rw: null, bAns: {}, bPre: {}, bHint: '', bSent: false, draft: [], runtime: 0, mood: 0, seed: 0, request: '', variants: [], vpick: 0, vnote: '', parts: [], partNote: '', partMode: false,
      proseLocked: false, back: '', descEdit: -1,
      chars: [
        { n: '민호', d: '20대 후반 직장인. 흰 셔츠, 느슨한 넥타이, 피곤한 눈.', states: ['기본: 흰 셔츠', '파생: 셔츠에 콜라 얼룩 (S2)'], tone: 0, note: '' },
        { n: '팀장', d: '40대. 회색 정장, 단정한 머리, 무표정.', states: ['기본: 회색 정장'], tone: 0, note: '' },
      ],
      bgs: [{ n: '회사 복도 자판기 앞', d: '낮, 형광등, 리놀륨 바닥, 빨간 자판기 한 대.', tone: 0 }],
      newItems: [],
      style: 1, styleLocked: false, generated: false, versions: [], ver: 0, regenStyle: null, styleRefs: [], renaming: false, acMode: null, afilter: 'all', editMode: null, removed: null,
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
        Writer: [['Writer', '씬 두 개로 산문을 썼어요. 마음에 안 들면 "다시 써줘"라고 하거나 조건을 바꿔 다시 쓰게 해 주세요.']],
        Artist: [['Artist', '인물 2명, 배경 1곳이에요. 민호는 S2에서 얼룩진 셔츠 상태가 하나 더 있어요.']],
        Storyboard: [['Storyboard', '씬 2개를 샷 6개로 나눴어요.']],
      },
      pending: null, busyStep: 0,
    };
  }
  var st = initial();

  /* ── 부품 ── */
  var STAGES = ['Producer', 'Writer', 'Artist', 'Storyboard', 'Director', 'Editor'];
  function rail(on) {
    var i = STAGES.indexOf(on);
    return '<nav class="w-rail" aria-label="단계">' + STAGES.map(function (s, k) {
      return '<button class="' + (k === i ? 'on' : k < i ? 'done' : '') + '" data-act="jumpStage" data-arg="' + s + '"' + (k === i ? ' aria-current="step"' : '') + '>' + s + '</button>';
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
      msgs.map(function (m) { return '<div class="w-msg' + (m[0] === '나' ? ' me' : '') + '"><b>' + esc(m[0]) + '</b>' + esc(m[1]) + '</div>'; }).join('') + (o.card || '') +
      '</div>' + (o.suggest ? '<div class="w-sugg">' + o.suggest.map(function (t) { return '<button class="w-tab" data-act="send" data-arg="' + esc(t) + '">' + esc(t) + '</button>'; }).join('') + '</div>' : '') + (o.pick ? chatInput(o) : '<div class="w-chat-in">' + (o.chatLocked || o.noChat
        ? '<span class="w-mut">' + (o.chatLocked ? '팝업을 닫으면 다시 쓸 수 있어요' : '여기서는 채팅으로 고칠 수 없어요') + '</span>'
        : '<input id="chat-in" data-bind="chatDraft" data-enter="send" value="' + esc(st.chatDraft) + '" placeholder="' + esc(o.ph || '말해주세요…') + '" aria-label="채팅 입력">' +
          '<button class="w-btn pri" data-act="send" data-need="chatDraft">보내기</button>') + '</div>') + '</aside>';
    return bar(on) + '<div class="w-studio"><main class="w-main">' + main + '</main>' + chat + '</div>';
  }
  function chatInput(o) {
    if (o.pick) {
      var chips = st.parts.length ? st.parts.map(function (i) { return '<button class="w-chip pick" data-act="togglePart" data-arg="' + i + '" aria-label="S' + (i + 1) + ' 빼기">S' + (i + 1) + ' ×</button>'; }).join('') : '<span class="w-mut">위 산문에서 문단을 누르세요</span>';
      return '<div class="w-cin pick"><div class="w-cin-chips">' + chips + '</div><div class="w-cin-main"><input id="chat-in" data-bind="chatDraft" data-enter="sendPart" value="' + esc(st.chatDraft) + '" placeholder="어떻게 고칠까요? 예: 대사를 더 웃기게" aria-label="어떻게 고칠지">' +
        '<button class="w-btn pri" data-act="sendPart"' + (st.parts.length ? '' : ' disabled') + '>보내기</button></div></div>';
    }
    return null;
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
  var target = function () { return objs()[st.target] || objs()[0]; };
  var shotLabel = function (i) { var s = st.shots[i], k = 0; for (var j = 0; j <= i; j++) if (st.shots[j].sc === s.sc) k++; return 'S' + s.sc + '-' + k; };
  var total = function () { return st.shots.reduce(function (a, s) { return a + s.len; }, 0); };
  function say(stage, who, text) { st.chat[stage].push([who, text]); }

  /* ── Producer (진입) ── */
  var isB = function () { return st.plan === 'B'; };
  var entryId = function () { return isB() ? 'EB1' : 'E1'; };
  var entryBase = function () { return isB() ? EB1() : E1(); };
  function counter() { return '<span class="w-count" data-count aria-live="polite"></span>'; }
  function lenErrHtml() {
    return st.lenErr && !st.file && ideaLen() < MIN_LEN ? '<p class="w-err" data-lenerr role="alert">조금 더 적어 주세요. ' + MIN_LEN + '자 이상이면 AI가 이야기를 잡을 수 있어요. (지금 <b data-lennow>' + ideaLen() + '</b>자)</p>' : '';
  }
  function fileRow() {
    return '<div class="w-file">' + (st.file ? '<span class="w-chip">📎 ' + esc(st.file.name) + '<button class="w-x" data-act="clearFile" aria-label="파일 빼기">×</button></span>'
      : '<span class="w-mut">대본 · 메모 파일이나 글이 담긴 이미지를 올릴 수 있어요. 없어도 돼요.</span>') + B('파일 첨부', 'EF') + '</div>';
  }
  function stepper(n) {
    return '<ol class="w-stepper"><li class="' + (n === 1 ? 'on' : 'done') + '">① 이야기 재료</li><li class="' + (n === 2 ? 'on' : '') + '">② 설정</li></ol>';
  }
  function E1() {
    return bar('Producer') + '<div class="w-entry wide">' + stepper(1) + '<h3>무엇을 만들어 볼까요?</h3>' +
      '<div class="w-q"><div class="w-q-t">아이디어나 줄거리 ' + counter() + '</div>' +
      '<textarea class="w-ta" id="idea" data-bind="idea" aria-label="아이디어" placeholder="누가, 어디서, 무슨 일을 겪는지 적어 주세요">' + esc(st.idea) + '</textarea>' + lenErrHtml() + '</div>' +
      fileRow() +
      '<div class="w-foot"><span class="w-mut">다음 화면에서 AI가 장르·분위기와 길이를 추천해요.</span>' + A('다음 →', 'next1', 'pri') + '</div></div>';
  }
  function E1e() { st.lenErr = true; return entryBase(); }
  var ACCEPT = TEXT_EXT.concat(IMG_EXT).map(function (x) { return '.' + x; }).join(',');
  function EF() {
    return entryBase() + modal('파일 첨부',
      '<label class="w-drop"><input type="file" id="file-in" accept="' + ACCEPT + '" hidden><b>여기를 눌러 파일 고르기</b><span class="w-mut">파일 하나 · 10MB까지</span></label>' +
      '<dl class="w-list"><div><dt>글 파일</dt><dd>txt · md · docx · pdf · hwp</dd></div><div><dt>글이 담긴 이미지</dt><dd>png · jpg — 사진 찍은 대본, 메모 스크린샷</dd></div></dl>' +
      (st.fileErr ? '<p class="w-err" role="alert">' + esc(st.fileErr) + '</p>' : '') +
      '<p class="w-note">웹툰 · 캐릭터 시트 · 참조 사진은 다음 버전에서 읽어요.</p>' +
      '<div class="w-samples"><span class="w-mut">목업: 예시 파일 고르기</span>' + SAMPLE_FILES.map(function (x, i) { return '<button class="w-tab' + (x[0] === 'bad' ? ' bad' : '') + '" data-act="pickSample" data-arg="' + i + '">' + esc(x[1]) + '</button>'; }).join('') + '</div>',
      A('닫기', 'closeFile'));
  }
  function EFe() { if (!st.fileErr) st.fileErr = badExtMsg('예고편.mp4'); return EF(); }
  function E2() {
    var img = st.file && st.file.image;
    return entryBase() + busy(img ? '이미지에서 글을 읽고 있어요' : '글을 읽고 있어요', img ? ['파일 열기', '이미지에서 글자 읽기', '추천 설정 만들기'] : ['글 읽기', '이야기 종류 판단', '추천 설정 만들기']);
  }
  function E2e() {
    return entryBase() + modal('이미지에서 글을 찾지 못했어요', '<p>' + esc(st.file ? st.file.name : '이미지') + '에서 읽을 수 있는 글이 없어요. 글이 보이는 이미지나 글 파일을 올려 주세요.</p>' +
      '<p class="w-note">그림을 읽어 인물·배경으로 쓰는 기능은 다음 버전에서 열려요.</p>',
      A('파일 빼고 진행', 'dropFileGo') + A('다른 파일 올리기', 'retryFile', 'pri'));
  }
  function levelPicker() {
    var rec = recLevel(), L = LV()[st.level];
    return '<div class="w-q"><div class="w-q-t">' + LV_Q() + '</div>' + (st.file && !st.file.noText ? '<p class="w-why" style="margin:0">📎 ' + esc(st.file.name) + '을(를) ' + esc(KINDS[st.kind].name) + '(으)로 읽었어요</p>' : '') +
      '<div class="w-levels" role="radiogroup">' + LV().map(function (l, i) {
        return '<button class="w-lv' + (i === st.level ? ' on' : '') + '" role="radio" aria-checked="' + (i === st.level) + '" data-bind="level" data-val="' + i + '"' + (levelOk(i) ? '' : ' disabled') + '>' +
          '<span class="w-lv-n">' + (i + 1) + '</span><b>' + esc(l.n) + (i === rec ? ' <em>추천</em>' : '') + '</b><small>' + esc(l.s) + '</small></button>';
      }).join('') + '</div>' +
      '<div class="w-lv-d"><span><i>지켜요</i>' + esc(L.keep) + '</span><span><i>바꿔요</i>' + esc(L.change) + '</span></div>' +
      (hasText() ? '' : '<p class="w-note">"그대로"는 지킬 원문이 있어야 해요. 대본 파일을 올리거나 줄거리를 60자 넘게 적으면 열려요.</p>') + '</div>';
  }
  function why(t) { return t ? '<p class="w-why">✦ ' + esc(t) + '</p>' : ''; }
  function E3() {
    if (!st.rec) recommend();
    var r = st.rec;
    return bar('Producer') + '<div class="w-entry wide">' + stepper(2) + '<h3>이렇게 만들어 볼까요?</h3>' +
      '<p class="w-mut" style="margin:0">AI가 이야기 재료를 읽고 골라 뒀어요. 맞으면 그대로 진행하세요.</p>' +
      '<section class="w-grp"><div class="w-q"><div class="w-q-t">장르·분위기</div>' + opts('mood', MOODS, st.mood, r.mood) + why(r.moodWhy) + '</div>' +
      '<div class="w-q"><div class="w-q-t">길이</div>' + opts('runtime', RUNTIMES, st.runtime, r.runtime) + why(r.runtimeWhy) + '</div>' +
      levelPicker() + '</section>' +
      '<section class="w-grp lock"><div class="w-grp-h">🔒 화면 비율 <small>시작하면 끝까지 바꿀 수 없어요</small></div>' + opts('ratio', RATIOS, RATIOS.map(function (x) { return x[0]; }).indexOf(st.ratio), 1) + '</section>' +
      '<div class="w-foot">' + B('← 이야기 재료', 'E1') + B('AI로 진행', 'E4', 'acc') + '</div></div>';
  }
  function E4() {
    var L = LV()[st.level];
    return E3() + modal('이대로 시작할까요?', list([
      ['🔒 화면 비율', esc(st.ratio) + ' · 시작하면 끝까지 바꿀 수 없어요'],
      ['장르·분위기', esc(MOODS[st.mood])], ['길이', esc(RUNTIMES[st.runtime][0])],
      ['바꿈 정도', (st.level + 1) + ' ' + esc(L.n) + ' — ' + esc(L.s)],
      ['자료', st.file ? esc(st.file.name) : '아이디어 글만'], ['채팅 언어', '한국어 (사이트 언어)']]) + '<p class="w-note">장르·분위기와 길이는 Writer에서 다시 바꿀 수 있어요.</p>',
      B('아니오, 고칠래요', 'E3') + A('예, 시작', 'confirmStart', 'pri'));
  }

  /* ── Producer 2안: 채팅으로 만들기 ── */
  var BQ = ['mood', 'runtime', 'level', 'ratio'];
  var BQ_SCREEN = { file: 'EB2', mood: 'EB3', runtime: 'EB4', level: 'EB5', ratio: 'EB6', confirm: 'EB7' };
  var BQ_NAME = { mood: '장르·분위기', runtime: '길이', level: '바꿈 정도', ratio: '화면 비율' };
  var BQ_Q = { mood: '어떤 장르·분위기로 할까요?', runtime: '길이는 어느 정도로 할까요?', level: '내 글을 AI가 얼마나 바꿔도 될까요?', ratio: '화면 비율을 골라 주세요.' };
  var EXAMPLES = [['직장 코미디', '회사 복도 자판기가 고장 나서 캔이 우르르 쏟아지는데, 주인공 민호만 하나도 못 먹는 이야기'], ['가족 드라마', '10년 만에 고향 집에 돌아온 딸이 아버지의 낡은 카메라에서 찍다 만 필름을 발견한다'], ['짧은 호러', '야근하던 직원의 모니터에 회사 CCTV 화면이 뜨고, 화면 속 자기 뒤에 누가 서 있다'], ['로맨스', '매일 같은 시간 옥상에서 마주치는 두 사람이 서로의 이름을 모른 채 1년을 보낸다'], ['SF', '고장 난 배달 로봇이 길을 잃고, 집에 혼자 있는 아이를 따라 하루를 보낸다'], ['미스터리', '매주 금요일, 민호의 책상에 이름 없는 편지가 한 통씩 놓인다']];
  var GUIDES = ['누구 이야기: ', '어디서: ', '무슨 일이: ', '어떻게 끝나요: '];
  // 파일이 있으면 자료 확인 카드에서 "어떻게 쓸까요"를 먼저 묻고(바꿈 정도), 글만 있으면 장르부터 묻는다
  var bOrder = function () { return st.file ? ['file', 'mood', 'runtime', 'ratio'] : ['mood', 'runtime', 'level', 'ratio']; };
  function nextQ() { var o = bOrder(); for (var i = 0; i < o.length; i++) if (!st.bAns[o[i]]) return BQ_SCREEN[o[i]]; return 'EB7'; }
  function ansText(k) {
    if (k === 'mood') return MOODS[st.mood];
    if (k === 'runtime') return RUNTIMES[st.runtime][0];
    if (k === 'level') return (st.level + 1) + ' ' + LV()[st.level].n;
    if (k === 'ratio') return st.ratio;
    if (k === 'file') return KINDS[st.kind].name + ' · ' + LV()[st.level].n;
    return '';
  }
  // 말에서 장르·길이·바꿈 정도·비율을 읽는다 (목업용 간단한 규칙)
  function parseInto(t) {
    var got = [];
    MOODS.forEach(function (m, i) { if (t.indexOf(m.split('·')[0]) >= 0) { st.mood = i; got.push('mood'); } });
    var m = t.match(/(\d+)\s*(초|분)/);
    if (m) { var sec = +m[1] * (m[2] === '분' ? 60 : 1); st.runtime = sec <= 15 ? 0 : sec <= 60 ? 1 : sec <= 300 ? 2 : 3; got.push('runtime'); }
    else if (/숏폼|쇼츠/.test(t)) { st.runtime = 0; got.push('runtime'); } else if (/단편/.test(t)) { st.runtime = 3; got.push('runtime'); }
    if (/그대로/.test(t) && levelOk(0)) { st.level = 0; got.push('level'); } else if (/다듬/.test(t)) { st.level = 1; got.push('level'); } else if (/새롭게|키워|새로/.test(t)) { st.level = 2; got.push('level'); }
    var r = t.match(/16:9|9:16|1:1|2\.39:1/); if (r) { st.ratio = r[0]; got.push('ratio'); } else if (/세로/.test(t)) { st.ratio = '9:16'; got.push('ratio'); } else if (/가로/.test(t)) { st.ratio = '16:9'; got.push('ratio'); }
    got = got.filter(function (k, i) { return got.indexOf(k) === i; });
    got.forEach(function (k) { st.bAns[k] = true; });
    return got;
  }
  function bubble(who, html, me) { return '<div class="w-b' + (me ? ' me' : '') + '">' + (me ? '' : '<b>' + who + '</b>') + '<div>' + html + '</div></div>'; }
  function qr(key, arr, cur, rec) {
    return '<div class="w-qr">' + arr.map(function (o, i) {
      var t = Array.isArray(o) ? o : [o, ''];
      return '<button class="w-opt' + (i === cur ? ' on' : '') + '" data-act="bAnswer" data-arg="' + key + ':' + i + '">' + (i === rec ? '<em>추천</em>' : '') + esc(t[0]) + (t[1] ? '<small>' + esc(t[1]) + '</small>' : '') + '</button>';
    }).join('') + '</div>';
  }
  function levelButtons(key, rec) {
    return '<div class="w-qr col">' + LV().map(function (l, i) {
      return '<button class="w-opt lv" data-act="bAnswer" data-arg="' + key + ':' + i + '"' + (levelOk(i) ? '' : ' disabled') + '><b>' + (i + 1) + ' ' + esc(l.n) + (i === rec ? ' <em>추천</em>' : '') + '</b><small>지켜요 ' + esc(l.keep) + ' · 바꿔요 ' + esc(l.change) + '</small></button>';
    }).join('') + '</div>';
  }
  function bCard(key) {
    var r = st.rec || {};
    if (key === 'file') {
      var k = KINDS[st.kind];
      return bubble('Producer', '📎 <b>' + esc(st.file ? st.file.name : '') + '</b>을(를) <b>' + esc(k.name) + '</b>(으)로 읽었어요.' +
        (st.file && st.file.image ? '<p class="w-quote">' + esc(OCR_LINE) + '</p>' : '') +
        '<div class="w-q-t" style="margin-top:8px">' + LV_Q() + '</div>' + levelButtons('file', r.level));
    }
    if (key === 'mood') return bubble('Producer', BQ_Q.mood + qr('mood', MOODS, -1, r.mood) + why(r.moodWhy));
    if (key === 'runtime') return bubble('Producer', BQ_Q.runtime + qr('runtime', RUNTIMES, -1, r.runtime) + why(r.runtimeWhy));
    if (key === 'level') return bubble('Producer', BQ_Q.level + levelButtons('level', r.level) + (hasText() ? '' : '<p class="w-note">"그대로"는 지킬 원문이 있어야 해요. 지금은 다듬기나 새롭게 키우기를 골라 주세요.</p>'));
    if (key === 'ratio') return bubble('Producer', '화면 비율을 골라 주세요. <b class="w-lock">🔒 고르면 끝까지 바꿀 수 없어요.</b>' + qr('ratio', RATIOS, -1, 1));
    if (key === 'confirm') {
      return bubble('Producer', '이렇게 시작할게요.' + list([['장르·분위기', esc(ansText('mood'))], ['길이', esc(ansText('runtime'))], ['바꿈 정도', esc(ansText('level')) + ' — ' + esc(LV()[st.level].s)], ['🔒 화면 비율', esc(st.ratio) + ' · 끝까지 바꿀 수 없어요'], ['자료', st.file ? esc(st.file.name) : '아이디어 글만']]) +
        '<div class="w-qr">' + A('✎ Writer에게 써 달라고 하기', 'confirmStart', 'pri') + '</div><p class="w-note">🔒 누르면 화면 비율이 잠겨요. 고치고 싶으면 위쪽 항목을 누르거나 "길이는 1분으로"처럼 말해 주세요.</p>');
    }
    return '';
  }
  function chatStage(curKey) {
    var order = bOrder().concat(['confirm']);
    var h = bubble('Producer', '무엇을 만들까요? 자료가 있으면 올리거나 직접 적어 주세요. 아이디어가 아직 없으면 제가 여러 가지 예시를 들려드릴게요.' +
      (curKey || st.showEx ? '' : '<div class="w-qr">' + B('💡 예시 보여줘', 'EBX') + '</div>'));
    if (!curKey) {
      if (st.showEx) {
        var ex = EXAMPLES.slice(st.exPage * 3, st.exPage * 3 + 3);
        if (!ex.length) { st.exPage = 0; ex = EXAMPLES.slice(0, 3); }
        h += bubble('', '예시 보여줘', true) + bubble('Producer', '이런 건 어때요? 마음에 드는 걸 누르면 입력칸에 넣어 드려요. 고쳐서 보내도 돼요.' +
          '<div class="w-ex">' + ex.map(function (x) { var i = EXAMPLES.indexOf(x);
            return '<button class="w-ex-c" data-act="example" data-arg="' + i + '"><b>' + esc(x[0]) + '</b><span>' + esc(x[1]) + '</span></button>';
          }).join('') + '</div><div class="w-qr">' + A('다른 예시', 'moreEx', 'sm') + '</div>');
      }
      if (st.lenErr && !st.file && ideaLen() < MIN_LEN) h += '<div data-lenerr>' + bubble('Producer', '<span class="w-err-t">조금 더 적어 주세요. ' + MIN_LEN + '자 이상이면 이야기를 잡을 수 있어요. (지금 <b data-lennow>' + ideaLen() + '</b>자)</span> 누가, 어디서, 무슨 일이, 어떻게 끝나는지 한두 줄이면 돼요.') + '</div>';
    } else {
      h += bubble('', esc(st.idea) + (st.file ? '<br><span class="w-chip">📎 ' + esc(st.file.name) + '</span>' : ''), true);
      var pre = BQ.filter(function (k) { return st.bPre[k] && order.indexOf(k) >= 0; });
      if (pre.length) h += bubble('Producer', '말씀에서 ' + pre.map(function (k) { return BQ_NAME[k] + ' <b>' + esc(ansText(k)) + '</b>'; }).join(', ') + '을(를) 읽었어요. 나머지만 물어볼게요.');
      for (var i = 0; i < order.length; i++) {
        var k = order[i];
        if (k === curKey) { if (st.bHint) h += bubble('Producer', esc(st.bHint)); h += bCard(k); break; }
        if (st.bPre[k]) continue;
        h += bubble('Producer', k === 'file' ? '📎 ' + esc(KINDS[st.kind].name) + '(으)로 읽었어요. ' + LV_Q() : BQ_Q[k]) + bubble('', esc(k === 'file' ? LV()[st.level].n : ansText(k)), true);
      }
    }
    var sum = '<div class="w-sum" aria-label="지금까지 정한 것">' + BQ.map(function (k) {
      var on = st.bAns[k];
      return '<button class="w-sum-c' + (on ? ' on' : '') + (k === curKey ? ' cur' : '') + '" data-act="bReask" data-arg="' + k + '"' + (on ? '' : ' disabled') + '><i>' + (k === 'ratio' ? '🔒 ' : '') + BQ_NAME[k] + '</i>' + (on ? esc(ansText(k)) : '—') + '</button>';
    }).join('') + '</div>';
    var input = curKey
      ? '<div class="w-cin"><input id="chat-in" data-bind="chatDraft" data-enter="bSend" value="' + esc(st.chatDraft) + '" placeholder="골라도 되고, 말로 해도 돼요. 예: 1분짜리로" aria-label="채팅 입력"><button class="w-btn pri" data-act="bSend" data-need="chatDraft">보내기</button></div>'
      : '<div class="w-cin first">' +
        '<div class="w-cin-main"><textarea id="idea" data-bind="idea" data-enter="bStart" rows="2" aria-label="아이디어" placeholder="누가, 어디서, 무슨 일이, 어떻게 끝나는지 적어 주세요">' + esc(st.idea) + '</textarea>' + A('보내기', 'bStart', 'pri') + '</div>' +
        '<div class="w-cin-row">' + (st.file ? '<span class="w-chip">📎 ' + esc(st.file.name) + '<button class="w-x" data-act="clearFile" aria-label="파일 빼기">×</button></span>'
          : B('📎', 'EF', 'w-icon', ' aria-label="파일 첨부" title="파일 첨부"') + '<span class="w-mut">파일이 있으면 올려 주세요</span>') +
        '<span style="flex:1"></span>' + counter() + '</div></div>';
    return bar('Producer') + '<div class="w-chatstage">' + (curKey ? sum : '') + '<div class="w-thread">' + h + '</div>' + input + '</div>';
  }
  function EB1() { st.showEx = false; return chatStage(null); }
  function EBX() { st.showEx = true; return chatStage(null); }
  function EB2() { return chatStage('file'); }
  function EB3() { return chatStage('mood'); }
  function EB4() { return chatStage('runtime'); }
  function EB5() { return chatStage('level'); }
  function EB6() { return chatStage('ratio'); }
  function EB7() { return chatStage('confirm'); }
  function E5() { return W1() + busy('산문 초안을 쓰고 있어요', ['자료 정리', '이야기 뼈대', '씬 스토리 쓰기']); }

  /* ── Writer (산문 작업공간) — 1안: 조건 패널 + 채팅 / 2안: 채팅 중심 ── */
  var SEEDS = [['그대로', '지금 아이디어 소재 유지'], ['새롭게', '소재부터 새로']];
  function condFields() {
    return '<div class="w-q"><div class="w-q-t">러닝타임</div>' + opts('runtime', RUNTIMES, st.runtime) + '</div>' +
      '<div class="w-q"><div class="w-q-t">글의 장르·분위기</div>' + opts('mood', MOODS, st.mood) + '</div>' +
      '<div class="w-q"><div class="w-q-t">아이디어 소재</div>' + opts('seed', SEEDS, st.seed) + '</div>';
  }
  function proseHtml(pick) {
    return st.prose.map(function (p, i) {
      var on = st.parts.indexOf(i) >= 0;
      return pick ? '<p class="w-para' + (on ? ' sel' : '') + '"><button data-act="togglePart" data-arg="' + i + '" aria-pressed="' + on + '"><span>S' + (i + 1) + '</span>' + esc(p) + '</button></p>'
        : '<p><span>S' + (i + 1) + '</span>' + esc(p) + '</p>';
    }).join('');
  }
  // 1안: 산문 위 한 줄. 조건은 지금 산문이 쓰인 값만 글로 보여주고, 바꾸려면 [AI 다시 쓰기 ▾]를 눌러
  // 아래로 펼쳐지는 옵션에서 고른 뒤 [다시 쓰기]로 적용한다. 다시 쓰지 않으면 값도 안 바뀐다.
  var RW = { runtime: ['러닝타임', function () { return RUNTIMES; }], mood: ['장르·분위기', function () { return MOODS; }], seed: ['아이디어 소재', function () { return SEEDS; }] };
  function rwPanel() {
    var d = st.rw;
    return '<div class="w-rwp" role="dialog" aria-label="다시 쓰기 옵션">' + Object.keys(RW).map(function (k) {
      return '<div class="w-q"><div class="w-q-t">' + RW[k][0] + '</div><div class="w-opts">' + RW[k][1]().map(function (o, i) {
        var t = Array.isArray(o) ? o : [o, ''];
        return '<button class="w-opt' + (i === d[k] ? ' on' : '') + '" data-act="rwPick" data-arg="' + k + ':' + i + '">' + esc(t[0]) + (i === st[k] ? '<em>지금 산문</em>' : '') + '</button>';
      }).join('') + '</div></div>';
    }).join('') +
      '<div class="w-acts">' + A('취소', 'rwClose') + A('이 조건으로 다시 쓰기', 'rwApply', 'acc') + '</div></div>';
  }
  function condBar() {
    return '<div class="w-tbar" role="toolbar" aria-label="산문 도구"><span class="w-cond"><i>지금 산문</i>' + esc(RUNTIMES[st.runtime][0]) + ' · ' + esc(MOODS[st.mood]) + ' · 소재 ' + esc(SEEDS[st.seed][0]) + '</span>' +
      '<span class="w-tbar-sp"></span>' + A('직접 작성', 'openDirect') +
      '<div class="w-popwrap right">' + A('✦ AI 다시 쓰기 ▾', 'rwOpen', 'acc', ' aria-expanded="' + !!st.rw + '"') + (st.rw ? rwPanel() : '') + '</div></div>';
  }
  function proseMain(ro, pick) {
    var A_ = st.plan === 'A';
    return '<div class="w-title"><h3>' + esc(st.title) + '</h3>' + B('브레이크다운하기 →', 'W6', 'pri') + '</div>' +
      (st.back ? '<div class="w-banner warn">' + esc(st.back) + '에서 돌아왔어요. 새 인물·배경을 산문에 넣고 다시 브레이크다운해 주세요. <span class="w-mut">(목업: "경비원", "옥상" 같은 말을 넣어 보세요)</span></div>' : '') +
      (ro ? '<div class="w-banner">대본을 그대로 쓰는 프로젝트예요. 산문을 고칠 수 없고, 확인한 뒤 브레이크다운만 할 수 있어요.</div>' : '') +
      (A_ && !ro ? condBar() :
      '<div class="w-prose-tools">' + B('✦ AI 다시 쓰기', 'WC1', 'acc', ro ? ' disabled' : '') + A('직접 작성', 'openDirect', '', ro ? ' disabled' : '') +
      '<span class="w-mut">' + esc(RUNTIMES[st.runtime][0]) + ' · ' + esc(MOODS[st.mood]) + ' 기준으로 쓴 산문</span></div>') +
      (pick ? '<p class="w-note pick">고칠 문단을 눌러 고르세요. 고른 문단만 다시 써요.</p>' : '') +
      '<article class="w-prose' + (pick ? ' picking' : '') + '">' + proseHtml(pick) + '</article>';
  }
  var SUGGEST = ['다시 써줘', '더 짧게', '팀장을 더 얄밉게'];
  // 2안 Writer: Producer와 같은 채팅방. 산문은 채팅 안의 카드로 오고, 고치기 버튼은 카드에 붙는다.
  function writerB(o) {
    o = o || {};
    var ro = st.proseLocked && !o.pick;
    var head = '<div class="w-sys">Producer와 정한 것 · ' + esc(RUNTIMES[st.runtime][0]) + ' · ' + esc(MOODS[st.mood]) + ' · ' + esc(LV()[st.level].n) + ' · 🔒 ' + esc(st.ratio) + '</div>';
    var proseCard = '<div class="w-b doc"><b>Writer</b><div>' + (ro ? '대본을 그대로 옮겼어요. 확인하고 브레이크다운해 주세요.' : '산문을 썼어요. 마음에 안 들면 "다시 써줘"라고 하거나 고치고 싶은 걸 말해 주세요.') +
      '<article class="w-doc' + (o.pick ? ' picking' : '') + '"><h4>' + esc(st.title) + '</h4>' + (o.pick ? '<p class="w-note pick">고칠 문단을 눌러 고르세요.</p>' : '') + proseHtml(o.pick) + '</article>' +
      '<div class="w-qr">' + (ro ? '' : B('✦ 다시 써줘', 'WC1') + A('✎ 직접 고치기', 'openDirect')) + B('브레이크다운하기 →', 'W6', 'pri') + '</div></div></div>';
    var msgs = (st.chat.Writer || []).slice(1).map(function (m) { return bubble(m[0] === '나' ? '' : m[0], esc(m[1]), m[0] === '나'); }).join('');
    var card = o.card ? o.card.replace('class="w-msg card"', 'class="w-b card"') : '';
    var locked = o.chatLocked;
    var input = o.pick ? chatInput(o) : '<div class="w-cin' + (locked ? ' is-locked' : '') + '">' + (locked ? '<span class="w-mut">팝업을 닫으면 다시 쓸 수 있어요</span>'
      : '<input id="chat-in" data-bind="chatDraft" data-enter="send" value="' + esc(st.chatDraft) + '" placeholder="Writer에게 말해 주세요. 예: 다시 써줘 / 팀장을 더 얄밉게" aria-label="채팅 입력"><button class="w-btn pri" data-act="send" data-need="chatDraft">보내기</button>') + '</div>';
    var sugg = !locked && !o.card && !o.pick && !ro ? '<div class="w-qr sugg">' + SUGGEST.map(function (t) { return '<button class="w-tab" data-act="send" data-arg="' + esc(t) + '">' + esc(t) + '</button>'; }).join('') + '</div>' : '';
    return bar('Writer') + '<div class="w-chatstage">' + '<div class="w-thread">' + head + proseCard + msgs + card + '</div>' + sugg + input + '</div>';
  }
  function writer(o) {
    o = o || {};
    if (st.plan === 'B') return writerB(o);
    return studio('Writer', proseMain(false, o.pick), { pick: o.pick, ph: st.plan === 'A' ? '예: 팀장을 더 얄밉게' : '예: 다시 써줘 / 팀장을 더 얄밉게', card: o.card, suggest: st.plan === 'B' && !o.card ? SUGGEST : null });
  }
  function W1() { return writer(); }
  function W1r() { return st.plan === 'B' ? writerB() : studio('Writer', proseMain(true), { noChat: true }); }
  function chatCard(title, body, who) { return '<div class="w-msg card"><b>' + (who || 'Writer') + '</b><div class="w-card-t">' + esc(title) + '</div>' + body + '</div>'; }
  function WC1() {
    return writer({ card: chatCard('뭐가 마음에 안 드세요?', '<div class="w-card-acts">' + B('전부 다시', 'WC2', 'pri sm') + B('일부분만', 'WC3', 'sm') + '</div>') });
  }
  function WC2() {
    return writer({ card: chatCard('전부 다시 쓸게요. 조건을 골라 주세요.', condFields() + (st.plan === 'A' ? '' : '') +
      '<div class="w-card-acts">' + B('뒤로', 'WC1', 'sm') + A('다시 쓰기', 'rewrite', 'acc sm') + '</div>') });
  }
  function WC3() {
    var n = st.parts.length;
    return writer({ pick: true, card: chatCard('어느 부분을 고칠까요?', '<p style="margin:0">' + (st.plan === 'B' ? '위' : '왼쪽') + ' 산문에서 문단을 누르면 아래 채팅창에 붙어요. 어떻게 고칠지 적어서 보내 주세요.' +
      (n ? ' 지금 <b>' + st.parts.map(function (i) { return 'S' + (i + 1); }).join(', ') + '</b>을(를) 골랐어요.' : '') + '</p><div class="w-card-acts">' + A('그만두기', 'cancelPart', 'sm') + '</div>') });
  }
  function W2() { return W1() + busy(st.parts.length && st.partMode ? '고른 문단을 고치고 있어요' : '산문을 고치고 있어요', ['요청 읽기', '세 가지 안 쓰기']); }
  function variantsHtml() {
    return '<div class="w-variants" role="radiogroup">' + st.variants.map(function (v, i) {
      return '<button class="w-var' + (i === st.vpick ? ' on' : '') + '" role="radio" aria-checked="' + (i === st.vpick) + '" data-bind="vpick" data-val="' + i + '"><b>안 ' + (i + 1) + '</b>' +
        v.changed.map(function (k) { return '<span class="w-var-p"><i>S' + (k + 1) + '</i>' + esc(v.prose[k]) + '</span>'; }).join('') + '</button>';
    }).join('') + '</div>';
  }
  function W4() {
    if (!st.variants.length) makeVariants('');
    if (st.plan === 'B') return writerB({ card: chatCard('세 가지 안이에요. 하나를 골라 주세요.', '<p class="w-mut">' + esc(st.vnote) + '</p>' + variantsHtml() + '<div class="w-card-acts">' + A('버리기', 'dropVariant', 'sm') + A('이 안 적용', 'applyVariant', 'pri sm') + '</div>') });
    return W1() + modal('세 가지 안', '<p class="w-mut">' + esc(st.vnote) + '</p>' +
      '<div class="w-variants" role="radiogroup">' + st.variants.map(function (v, i) {
        return '<button class="w-var' + (i === st.vpick ? ' on' : '') + '" role="radio" aria-checked="' + (i === st.vpick) + '" data-bind="vpick" data-val="' + i + '"><b>안 ' + (i + 1) + '</b>' +
          v.changed.map(function (k) { return '<span class="w-var-p"><i>S' + (k + 1) + '</i>' + esc(v.prose[k]) + '</span>'; }).join('') + '</button>';
      }).join('') + '</div>',
      A('버리기', 'dropVariant') + A('이 안 적용', 'applyVariant', 'pri'), true);
  }
  function W5() {
    return (st.plan === 'B' ? writerB({ chatLocked: true }) : studio('Writer', proseMain(false), { chatLocked: true })) +
      modal('직접 작성', '<p class="w-mut">팝업이 열려 있는 동안 에이전트 채팅은 잠겨요.</p>' +
        '<div class="w-q"><div class="w-q-t">제목</div><input class="w-in" data-bind="titleDraft" value="' + esc(st.titleDraft || st.title) + '" aria-label="제목"></div>' +
        st.draft.map(function (p, i) { return '<div class="w-q"><div class="w-q-t">S' + (i + 1) + '</div><textarea class="w-ta sm" rows="3" data-bind="draft.' + i + '" aria-label="씬 ' + (i + 1) + '">' + esc(p) + '</textarea></div>'; }).join('') +
        A('＋ 씬 추가', 'addScene', 'sm'),
        B('취소', 'W1') + A('저장', 'saveDirect', 'pri'), true);
  }
  // 고친 걸 적용하면 다음 단계(브레이크다운)를 먼저 제안한다. 싫다면 무엇을 더 할지 고르고, 다시 적용하면 또 제안한다.
  function WP() {
    return writer({ card: chatCard('적용했어요. 다음 단계로 넘어갈까요?', '<p style="margin:0">넘어가면 산문이 잠기고, Artist가 산문에서 인물·배경을 뽑아요.</p>' +
      '<div class="w-card-acts">' + A('좋아요, 브레이크다운', 'breakdown', 'pri sm') + B('아니요, 더 고칠래요', 'WN', 'sm') + '</div>') });
  }
  function WN() {
    return writer({ card: chatCard('무엇을 더 해 볼까요?', '<div class="w-qr col">' +
      B('✦ 다시 써 달라고 하기 <small>전부 또는 일부분</small>', 'WC1', 'sm') +
      (st.plan === 'A' ? A('러닝타임 · 장르 바꿔서 다시 쓰기', 'rwOpenGo', 'sm') : B('러닝타임 · 장르 바꿔서 다시 쓰기', 'WC2', 'sm')) +
      A('✎ 직접 고치기', 'openDirect', 'sm') +
      A('채팅으로 말할게요', 'chatFree', 'sm') + '</div><p class="w-note">고친 걸 적용하면 다시 물어볼게요. 언제든 [브레이크다운하기]로 넘어갈 수도 있어요.</p>') });
  }
  function W3() { if (!st.rw) st.rw = { runtime: st.runtime, mood: st.mood, seed: st.seed }; return W1(); }
  function W6() {
    return W1() + modal('산문을 확정하고 브레이크다운할까요?', list([['🔒 산문', '확정하면 잠겨요'], ['다음', 'AI가 인물·배경을 글로 뽑아요'], ['나중에 인물·배경을 늘리려면', '여기 산문으로 돌아와야 해요']]),
      B('아니오', st.proseLocked ? 'W1r' : 'W1') + A('예, 브레이크다운', 'breakdown', 'pri'));
  }

  /* ── Artist ── */
  // 인물·배경을 한 목록으로 다룬다. 그림은 생성할 때마다 버전(v1, v2…)으로 남고, 객체마다도 기록이 쌓인다.
  // 스타일은 작품에 하나라서: 전체 버전을 불러오면 스타일도 그 버전으로 바뀌고, 하나만 다시 만들기·불러오기는 지금 스타일 안에서만 된다.
  function objs() {
    var a = st.chars.concat(st.bgs);
    a.forEach(function (o, i) {
      if (!o.hist) { o.hist = []; o.cur = -1; }
      if (!o.refs) { o.refs = []; o.traits = []; o.model = 0; o.prompt = o.d; o.sTab = 0; }
      o.isBg = i >= st.chars.length;
    });
    return a;
  }
  var objPath = function (i) { return i < st.chars.length ? 'chars.' + i : 'bgs.' + (i - st.chars.length); };
  var MODELS = ['GPT Image 2', 'Nano Banana 2', 'Seedream 4', 'Flux Kontext'];
  // 캐릭터성: 눌러서 쌓는 칩. 여러 개 고를 수 있고, 같은 건 한 번만 들어간다.
  var TRAITS = {
    char: [['성격', ['냉철한', '다정한', '엉뚱한', '소심한', '당당한']], ['분위기·톤', ['코미디', '호러', '로맨스', '누아르', '따뜻한']], ['체형·인상', ['마른', '다부진', '동안', '날카로운 눈매', '웃는 상']], ['시대·패션', ['현대 오피스룩', '90년대', '캐주얼', '정장', '빈티지']]],
    bg: [['시간·날씨', ['낮', '밤', '비', '노을']], ['분위기·톤', ['코미디', '호러', '따뜻한', '차가운']], ['공간감', ['좁은', '넓은', '어수선한', '깔끔한']]],
  };
  function refStrip(key, refs) {
    return '<div class="w-refs">' + refs.map(function (r, k) { return '<span class="w-ref" title="' + esc(r) + '">' + esc(r.slice(0, 6)) + '<button class="w-x" data-act="delRef" data-arg="' + key + ':' + k + '" aria-label="레퍼런스 빼기">×</button></span>'; }).join('') +
      '<label class="w-ref add" title="레퍼런스 이미지 올리기">＋<input type="file" accept="image/*" class="ref-in" data-ref="' + key + '" hidden></label></div>';
  }
  var refsOf = function (key) { return key === 'style' ? st.styleRefs : objs()[+key].refs; };
  function newVersion(style) {
    var n = st.versions.length + 1;
    objs().forEach(function (o) { o.hist.push({ style: style, tone: o.tone || 0, note: '', v: n }); o.cur = o.hist.length - 1; });
    st.versions.push({ n: n, style: style, snap: objs().map(function (o) { return o.cur; }) });
    st.ver = st.versions.length - 1;
  }
  function thumb(o, h, big) {
    if (!h) return '<span class="w-th empty' + (o.isBg ? ' bg' : '') + '">그림 없음</span>';
    var bg = h.tone === 2 ? 'linear-gradient(135deg,#3a2b4a,#8a1f2e)' : styleBg(h.style);
    return '<span class="w-th' + (o.isBg ? ' bg' : '') + (big ? ' big' : '') + '" style="background:' + bg + ';filter:hue-rotate(' + ((h.v * 23 + (h.r || 0) * 41) % 90) + 'deg)">' + esc(o.n.slice(0, 2)) + '<i>v' + h.v + (h.r ? '·' + h.r : '') + '</i></span>';
  }
  function row(o, i, mode) {
    var h = o.cur >= 0 ? o.hist[o.cur] : null;
    var isNew = st.newItems.indexOf(o.n) >= 0;
    var desc = mode === 'text' && st.descEdit === i
      ? '<textarea class="w-ta sm" rows="2" data-bind="' + (o.isBg ? 'bgs.' + (i - st.chars.length) : 'chars.' + i) + '.d" aria-label="설명">' + esc(o.d) + '</textarea>'
      : '<p>' + esc(o.d) + '</p>';
    var acts = mode === 'text'
      ? (st.descEdit === i ? A('완료', 'descDone', 'sm pri') : A('설명 고치기', 'descEdit', 'sm', ' data-arg="' + i + '"'))
      : A(h ? '다시 만들기' : '만들기', 'openTone', 'sm', ' data-arg="' + i + '"');
    return '<li class="w-row' + (isNew ? ' is-new' : '') + '">' + (mode === 'img' ? thumb(o, h) : '') +
      '<div class="w-row-b"><b>' + esc(o.n) + ' <small>' + (o.isBg ? '배경' : '인물') + (isNew ? ' · 새로' : '') + '</small></b>' + desc +
      (o.isBg ? '' : '<div class="w-row-st">' + o.states.map(function (x) { return '<span>' + esc(x) + '</span>'; }).join('') + '</div>') +
      '<div class="w-row-ref"><i>레퍼런스</i>' + refStrip(String(i), o.refs) + '</div></div>' +
      '<div class="w-row-a">' + acts + '</div></li>';
  }
  var showObj = function (o) { return st.afilter === 'all' || (st.afilter === 'bg') === o.isBg; };
  function filterBar() {
    var n = { all: st.chars.length + st.bgs.length, char: st.chars.length, bg: st.bgs.length };
    return '<div class="w-fbar"><span class="w-tabs">' + [['all', '모두'], ['char', '인물'], ['bg', '배경']].map(function (f) {
      return '<button class="' + (st.afilter === f[0] ? 'on' : '') + '" data-act="afilter" data-arg="' + f[0] + '" aria-pressed="' + (st.afilter === f[0]) + '">' + f[1] + ' ' + n[f[0]] + '</button>';
    }).join('') + '</span><span class="w-mut w-fbar-note">목록은 산문에서 나와요. 새 인물·배경은 산문에 넣어야 생겨요 ' + B('산문으로 →', st.versions.length ? 'R2' : 'R1', 'w-link') + '</span></div>';
  }
  function imgCards() {
    return '<div class="w-acards">' + objs().map(function (o, i) {
      if (!showObj(o)) return '';
      var h = o.cur >= 0 ? o.hist[o.cur] : null, isNew = st.newItems.indexOf(o.n) >= 0;
      return '<div class="w-acard' + (o.isBg ? ' bg' : '') + (isNew ? ' is-new' : '') + '"><button class="w-acard-img" data-act="openTone" data-arg="' + i + '" aria-label="' + esc(o.n) + ' 크게 보기">' + thumb(o, h, true) + '</button>' +
        '<div class="w-acard-b"><b>' + esc(o.n) + ' <small>' + (o.isBg ? '배경' : '인물') + (isNew ? ' · 새로' : '') + '</small></b>' +
        (o.isBg ? '' : '<div class="w-row-st">' + o.states.map(function (x) { return '<span>' + esc(x) + '</span>'; }).join('') + '</div>') +
        (h && h.traits && h.traits.length ? '<p class="w-tone">' + esc(h.traits.join(' · ')) + '</p>' : '') +
        (o.refs.length ? '<p class="w-mut" style="margin:0;font-size:11px">레퍼런스 ' + o.refs.length + '장</p>' : '') +
        A('열기 · 고치기', 'openTone', 'sm', ' data-arg="' + i + '"') + '</div></div>';
    }).join('') + '</div>';
  }
  function rows(mode) { return '<ul class="w-rows">' + objs().map(function (o, i) { return showObj(o) ? row(o, i, mode) : ''; }).join('') + '</ul>'; }
  function styleRow(bind, cur) {
    return '<div class="w-styles" role="radiogroup">' + STYLES.map(function (s, i) {
      return '<button class="w-sty' + (i === cur ? ' on' : '') + '" role="radio" aria-checked="' + (i === cur) + '" data-bind="' + bind + '" data-val="' + i + '"><i style="background:' + styleBg(i) + '"></i>' + esc(s[0]) + (bind === 'regenStyle' && i === st.style ? '<small>지금</small>' : '') + '</button>';
    }).join('') + '</div>';
  }
  // 산문에 나오는 이름 중 목록에 없는 것 (목업용: 아는 이름 후보로 검사)
  function missingNames() {
    var text = st.prose.join(' ') + ' ' + st.idea, have = objs().map(function (o) { return o.n; });
    return ['민호', '팀장'].concat(EXTRA_PEOPLE.map(function (p) { return p[0]; })).filter(function (n) { return text.indexOf(n) >= 0 && have.indexOf(n) < 0; });
  }
  function A1() {
    var unnamed = /사람들|누군가|행인/.test(st.prose.join(' '));
    var miss = missingNames();
    var main = '<div class="w-title"><h3>Artist · 브레이크다운</h3><span class="w-mut">확정 산문에서 뽑은 인물 ' + st.chars.length + ' · 배경 ' + st.bgs.length + '</span></div>' +
      '<div class="w-diag"><b>AI 진단</b>' + (st.newItems.length ? '새로 들어온 것: ' + esc(st.newItems.join(', ')) + '. ' : '산문의 인물과 장소를 모두 찾았어요. ') +
      (unnamed ? '"지나가던 사람들"처럼 이름 없는 인물은 따로 뽑지 않았어요. 필요하면 산문에서 이름을 붙여 주세요.' : '') + '</div>' +
      (miss.length ? '<div class="w-err w-miss" role="alert">브레이크다운 오류: 산문에는 <b>' + esc(miss.join(', ')) + '</b>이(가) 나오는데 목록에 없어요.<div class="w-card-acts">' + A('다시 뽑기', 'rebreak', 'sm') + A('목록에 넣기 (산문에 있는 이름만)', 'addMissing', 'sm') + '</div></div>' : '') +
      filterBar() + rows('text') + '<p class="w-note">상태 추가(씬마다 다른 옷·나이)는 Storyboard 단계에서 할 수 있어요.</p>' +
      '<div class="w-foot">' + B('빠진 인물·배경이 있어요', 'R1') + B('목록이 맞아요 · 그림 만들기 →', 'A2', 'pri', miss.length ? ' disabled title="빠진 이름을 먼저 정리해 주세요"' : '') + '</div>';
    return studio('Artist', main, { noChat: true });
  }
  function A0() { return A1() + busy('인물·배경을 뽑고 있어요', ['산문 읽기', '인물 · 배경 찾기', '인물별 상태 세분화']); }
  function rollbackModal(from, lose, no) {
    return modal('산문으로 돌아갈까요?', '<p>인물·배경은 산문에서 나와요. 산문에 넣어야 목록에 생겨요.</p>' + list(lose), B('아니오', no) + A('예, 산문으로', 'rollback', 'warn', ' data-arg="' + from + '"'));
  }
  function R1() { return A1() + rollbackModal('Artist', [['잃는 것', '없음 (아직 그림이 없어요)'], ['다음', 'Writer 산문이 다시 열려요 → 고치고 다시 브레이크다운']], 'A1'); }
  // 처음 만들 때도 재생성과 같은 스타일 팝업: 스타일 고르고 [만들기]
  function A2() {
    var n = st.chars.reduce(function (x, c) { return x + c.states.length; }, 0);
    return A1() + modal('어떤 스타일로 만들까요?', '<p>이 작품의 스타일은 하나예요. 나중에 [재생성하기]로 다른 스타일을 다시 고를 수 있고, 이전 버전은 기록에 남아요.</p>' +
      styleRow('style', st.style) + '<div class="w-q"><div class="w-q-t">스타일 레퍼런스 <small>선택 · 이 그림체를 참고해요</small></div>' + refStrip('style', st.styleRefs) + '</div>' + list([['만드는 것', '인물 시트 ' + st.chars.length + ' (상태 ' + n + ') · 배경 ' + st.bgs.length], ['스타일', esc(STYLES[st.style][0])], ['예상 크레딧', '표시 자리']]),
      B('취소', 'A1') + A(esc(STYLES[st.style][0]) + '로 만들기', 'generate', 'acc'), true);
  }
  function A4() { return (st.versions.length ? A5() : A1()) + busy('그림을 만들고 있어요', objs().map(function (o) { return o.n; })); }
  function A5(o) {
    o = o || {};
    if (!st.versions.length) newVersion(st.style);
    var v = st.versions[st.ver];
    var main = '<div class="w-title"><h3>Artist</h3><span class="w-mut">인물 ' + st.chars.length + ' · 배경 ' + st.bgs.length + '</span></div>' +
      '<div class="w-stybar"><i style="background:' + styleBg(st.style) + '"></i><b>' + esc(STYLES[st.style][0]) + '</b><span class="w-mut">작품 스타일 · v' + v.n + '</span>' +
      '<span class="w-tbar-sp"></span>' + B('불러오기 · 기록 ' + st.versions.length, 'AV', 'sm', st.versions.length > 1 ? '' : ' disabled title="재생성하면 이전 버전이 여기 남아요"') + B('재생성하기', 'A6', 'sm') + '</div>' +
      filterBar() + imgCards() +
      '<div class="w-foot"><span></span>' + B('완료하기 →', 'A9', 'pri') + '</div>';
    return studio('Artist', main, { card: o.card, ph: o.ph || '예: 민호 바꿔줘' });
  }
  // 에이전트에게 "민호 바꿔줘": 어떻게 바꿀지 세 갈래로 묻는다
  function AC1() {
    var t = target();
    return A5({ card: chatCard(t.n + '을(를) 어떻게 바꿀까요?', '<div class="w-qr col">' +
      B('그림체(스타일)부터 바꾸고 싶어요 <small>스타일은 작품에 하나라 전체를 다시 만들어요</small>', 'A6', 'sm') +
      A('옷 · 소품 같은 작은 것만 <small>지금 그림을 바탕으로 고쳐요</small>', 'acPick', 'sm', ' data-arg="edit"') +
      A('스타일은 좋은데 생김새가 별로예요 <small>같은 스타일로 새로 만들어요</small>', 'acPick', 'sm', ' data-arg="new"') + '</div>', 'Artist') });
  }
  function AX() {
    return A5({ card: chatCard('새 인물·배경은 산문에서 넣어요', '<p style="margin:0">인물·배경 목록은 산문에서 나와요. Writer 산문에 넣고 다시 브레이크다운하면 목록에 생겨요. 지금 그림 중 바뀌지 않은 것은 그대로 둘게요.</p><div class="w-card-acts">' + B('산문으로 돌아가기', 'R2', 'sm pri') + B('그만두기', 'A5', 'sm') + '</div>', 'Artist') });
  }
  function AY() {
    var old = st.versions.filter(function (v, k) { return k !== st.ver; });
    return A5({ card: chatCard('이전 스타일로 돌아갈까요?', old.length
      ? '<p style="margin:0">다시 만들지 않고 이전 버전을 불러올 수 있어요. 불러오면 작품 스타일도 그 버전으로 바뀌어요.</p><div class="w-qr col">' + old.reverse().map(function (v) { return A('v' + v.n + ' · ' + esc(STYLES[v.style][0]) + ' 불러오기', 'loadVer', 'sm', ' data-arg="' + (v.n - 1) + '"'); }).join('') + '</div>'
      : '<p style="margin:0">아직 이전 버전이 없어요. 다른 스타일로 만들려면 재생성해 주세요.</p><div class="w-card-acts">' + B('재생성하기', 'A6', 'sm') + '</div>', 'Artist') });
  }
  function AC2() {
    var t = target();
    return A5({ ph: '예: 넥타이를 풀고 셔츠 소매를 걷어 줘', card: chatCard('어떤 식으로 바꿀까요?', '<p style="margin:0">지금 그림(' + esc(MODELS[t.model || 0]) + ')을 바탕으로 고칠게요. 괜찮죠? 아래 채팅에 바꿀 것을 적어 주세요.</p><div class="w-card-acts">' + B('다른 방법으로', 'AC1', 'sm') + '</div>', 'Artist') });
  }
  function AC3() {
    var t = target();
    return A5({ ph: '예: 더 앳된 얼굴, 짧은 머리', card: chatCard('생김새를 새로 만들게요', '<p style="margin:0">스타일(' + esc(STYLES[st.style][0]) + ')은 그대로 두고 ' + esc(t.n) + '의 생김새만 새로 만들어요. 원하는 생김새를 아래 채팅에 적거나, 상세에서 외형 프롬프트와 캐릭터성을 골라 주세요.</p><div class="w-card-acts">' + A('상세에서 직접 고르기', 'openTone', 'sm', ' data-arg="' + st.target + '"') + B('다른 방법으로', 'AC1', 'sm') + '</div>', 'Artist') });
  }
  function A6() {
    if (st.regenStyle == null) st.regenStyle = st.style;
    return A5() + modal('어떤 스타일로 다시 만들까요?', '<p>같은 스타일로 다시 만들어도 되고, 다른 스타일을 골라도 돼요. 지금 버전(v' + st.versions[st.ver].n + ' · ' + esc(STYLES[st.style][0]) + ')은 기록에 남아서 언제든 불러올 수 있어요.</p>' +
      styleRow('regenStyle', st.regenStyle) + (function () {
        var old = st.versions.filter(function (v, k) { return v.style === st.regenStyle && k !== st.ver; }).pop();
        return old ? '<p class="w-why">✦ v' + old.n + '에 ' + esc(STYLES[old.style][0]) + '으로 만든 게 있어요. 다시 만들지 않고 불러올 수 있어요 ' + A('v' + old.n + ' 불러오기', 'loadVer', 'sm', ' data-arg="' + (old.n - 1) + '"') + '</p>' : '';
      })() + '<div class="w-q"><div class="w-q-t">스타일 레퍼런스 <small>선택 · 이 그림체를 참고해요</small></div>' + refStrip('style', st.styleRefs) + '</div>' + list([['다시 만드는 것', '인물 ' + st.chars.length + ' · 배경 ' + st.bgs.length + ' 전체'], ['스타일', esc(STYLES[st.regenStyle][0]) + (st.regenStyle === st.style ? ' (그대로)' : ' — 작품 스타일이 이걸로 바뀌어요')], ['예상 크레딧', '표시 자리']]),
      A('취소', 'regenCancel') + A('다시 만들기', 'regenAll', 'acc'), true);
  }
  function AV() {
    var all = objs();
    return A5() + modal('생성 기록', '<p>마음에 들었던 버전을 불러오세요. 스타일은 작품에 하나라서, 불러오면 스타일도 그 버전으로 바뀌어요.</p>' +
      '<ul class="w-vers">' + st.versions.slice().reverse().map(function (v) {
        var i = v.n - 1, on = i === st.ver;
        return '<li class="' + (on ? 'on' : '') + '"><div class="w-vers-h"><b>v' + v.n + '</b><span>' + esc(STYLES[v.style][0]) + '</span>' + (on ? '<em>지금</em>' : '') + '</div>' +
          '<div class="w-vers-t">' + all.map(function (o, k) { return thumb(o, o.hist[v.snap[k]]); }).join('') + '</div>' +
          (on ? '' : A('불러오기', 'loadVer', 'sm', ' data-arg="' + i + '"')) + '</li>';
      }).join('') + '</ul>', B('닫기', 'A5'), true);
  }
  // 카드를 누르면 열리는 상세: 큰 그림 · 이름 · 상태 탭 · 외형 프롬프트 · 캐릭터성 · 레퍼런스 · 생성 도구 · 기록
  function A7() {
    var o = target(), i = st.target, path = objPath(i), h = o.cur >= 0 ? o.hist[o.cur] : null;
    var hist = o.hist.map(function (x, k) {
      var same = x.style === st.style, on = k === o.cur;
      return '<li class="' + (on ? 'on' : '') + (same ? '' : ' off') + '">' + thumb(o, x) + '<span>' + (on ? '지금' : same ? '' : esc(STYLES[x.style][0]) + ' · 다른 스타일') + '</span>' +
        (!on && same ? A('불러오기', 'objLoad', 'sm', ' data-arg="' + k + '"') : '') + '</li>';
    }).join('');
    var groups = TRAITS[o.isBg ? 'bg' : 'char'];
    var traits = '<div class="w-traits">' + groups.map(function (g) {
      return '<div class="w-trait-g"><i>' + g[0] + '</i>' + g[1].map(function (t) {
        var on = o.traits.indexOf(t) >= 0;
        return '<button class="w-chipbtn' + (on ? ' on' : '') + '" data-act="toggleTrait" data-arg="' + esc(t) + '" aria-pressed="' + on + '">' + (on ? '✓ ' : '＋ ') + esc(t) + '</button>';
      }).join('') + '</div>';
    }).join('') + '</div>';
    var head = '<div class="w-dt-h"><b>' + esc(o.n) + '</b><span class="w-mut" style="font-size:11px">이름은 산문에서 와요</span>' +
      (o.isBg ? '' : '<span class="w-tbar-sp"></span><span class="w-tabs">' + o.states.map(function (x, k) { return '<button class="' + (k === o.sTab ? 'on' : '') + '" data-act="sTab" data-arg="' + k + '">' + esc(x.split(':')[0]) + '</button>'; }).join('') + '</span>') + '</div>';
    var mode = st.editMode || (h ? 'edit' : 'new');
    var stateName = o.isBg ? '배경 그림' : (o.states[o.sTab] || '기본');
    var modeBox = '<div class="w-q"><div class="w-q-t">어떻게 바꿀까요?</div><div class="w-modes" role="radiogroup">' +
      '<button class="w-mode' + (mode === 'edit' ? ' on' : '') + '" role="radio" aria-checked="' + (mode === 'edit') + '" data-act="editMode" data-arg="edit"' + (h ? '' : ' disabled') + '><b>조금 고치기</b><small>지금 그림 위에서 고쳐요 · 얼굴·체형은 그대로</small></button>' +
      '<button class="w-mode' + (mode === 'new' ? ' on' : '') + '" role="radio" aria-checked="' + (mode === 'new') + '" data-act="editMode" data-arg="new"><b>새로 만들기</b><small>같은 스타일로 생김새부터 새로</small></button></div>' +
      '<p class="w-target"><i>바꾸는 대상</i><b>' + esc(o.n) + ' · ' + esc(stateName) + '</b> — 지금 그림을 바꿔요(이전 그림은 기록에 남아요). <span class="w-tag-no">새 상태 추가 아님</span>' + (o.isBg ? '' : ' 상태 추가(씬마다 다른 옷·나이)는 Storyboard에서 해요.') + '</p></div>';
    var body = head +
      '<div class="w-dt-img">' + thumb(o, h, true) + (o.isBg ? '' : '<span class="w-dt-cap">' + esc(o.states[o.sTab] || '') + ' · 턴어라운드 시트</span>') + '</div>' +
      (o.hist.length > 1 ? '<div class="w-q"><div class="w-q-t">기록 <small>같은 스타일만 불러올 수 있어요</small></div><ul class="w-ohist">' + hist + '</ul></div>' : '') +
      modeBox +
      '<div class="w-q"><div class="w-q-t">' + (mode === 'edit' ? '무엇을 고칠까요' : '외형 프롬프트') + ' <small>' + (mode === 'edit' ? '예: 넥타이를 풀어 줘' : '아래 칩을 누르면 여기에 글이 들어가요') + '</small></div><textarea class="w-ta sm" rows="2" data-bind="' + path + '.prompt" aria-label="외형 프롬프트">' + esc(o.prompt) + '</textarea></div>' +
      '<div class="w-q"><div class="w-q-t">' + (o.isBg ? '공간의 성격' : '캐릭터성') + ' <small>누르면 프롬프트에 들어가요 · 다시 누르면 빠져요</small></div>' + traits + '</div>' +
      '<div class="w-q"><div class="w-q-t">레퍼런스 <small>이 ' + (o.isBg ? '배경' : '인물') + '만 참고해요</small></div>' + refStrip(String(i), o.refs) + '</div>' +
      '<div class="w-q"><div class="w-q-t">이미지 생성 도구</div><select data-bind="' + path + '.model" aria-label="이미지 생성 도구">' + MODELS.map(function (m, k) { return '<option value="' + k + '"' + (k == o.model ? ' selected' : '') + '>' + esc(m) + '</option>'; }).join('') + '</select></div>' +
      '<p class="w-note">스타일은 작품 스타일(' + esc(STYLES[st.style][0]) + ') 그대로예요. 이 ' + (o.isBg ? '배경' : '인물') + '만 바뀌어요.</p>';
    return A5() + modal(o.n + (o.isBg ? ' · 배경' : ' · 인물'), body,
      B('닫기', 'A5') + A(mode === 'edit' ? esc(stateName.split(':')[0]) + ' 조금 고치기' : esc(stateName.split(':')[0]) + ' 새로 만들기', 'regenObj', 'acc', ' data-arg="' + mode + '"'), true);
  }
  function A8() { return A5() + busy(target().n + '을(를) ' + (st.regenMode === 'edit' ? '고치고' : '새로 만들고') + ' 있어요'); }
  function R2() { return A5() + rollbackModal('Artist', [['그대로인 것', '바뀌지 않은 인물·배경 그림 (제안 · 개발 확인)'], ['다시 하는 것', '산문 확정 → 브레이크다운 → 새 객체 그림'], ['스타일', esc(STYLES[st.style][0]) + ' 유지']], 'A5'); }
  function A9() {
    return A5() + modal('완료하고 Storyboard로 넘길까요?', list([['넘어가는 것', '확정 산문 · 인물 ' + st.chars.length + ' · 배경 ' + st.bgs.length + ' · 스타일 ' + esc(STYLES[st.style][0]) + ' (v' + st.versions[st.ver].n + ')'], ['다음', 'AI가 씬·샷을 나누고 러프를 그려요'], ['나중에 인물·배경을 늘리려면', '산문으로 롤백해야 해요. 상태는 Storyboard에서 추가할 수 있어요']]),
      B('아니오', 'A5') + A('예, 완료하기', 'toBoard', 'pri'));
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

  var SCREENS = { EB1: EB1, EBX: EBX, EB2: EB2, EB3: EB3, EB4: EB4, EB5: EB5, EB6: EB6, EB7: EB7, E1: E1, E1e: E1e, EF: EF, EFe: EFe, E2: E2, E2e: E2e, E3: E3, E4: E4, E5: E5, W1: W1, W1r: W1r, WC1: WC1, WC2: WC2, WC3: WC3, W2: W2, W4: W4, W5: W5, W6: W6, WP: WP, WN: WN, W3: W3,
    A0: A0, A1: A1, R1: R1, A2: A2, A4: A4, A5: A5, A6: A6, A7: A7, A8: A8, R2: R2, A9: A9, AV: AV, AC1: AC1, AC2: AC2, AC3: AC3, AX: AX, AY: AY,
    S0: S0, S1: S1, S2: S2, S3: S3, S4: S4, R3: R3, S5: S5, S6: S6, S7: S7, D1: D1 };
  // 갈림 노드는 그 갈림을 묻는 화면으로
  var DECISION_SCREEN = { E1n: function () { return entryId(); }, EFq: 'EF', E2q: function () { return isB() ? 'EB3' : 'E3'; }, E5q: function () { return isB() ? 'EB7' : 'E4'; }, W1q: 'W1', WPq: 'WP', A1q: 'A1', A5q: 'A5', S1q: 'S1', S4q: 'S4' };
  // AI 작업이 끝나면 가는 곳
  var BUSY_NEXT = {
    E2: function () { if (st.file && st.file.noText) return 'E2e'; if (isB()) return st.file ? 'EB2' : nextQ(); return 'E3'; },
    E5: 'W1', W2: 'W4', A0: 'A1', A4: 'A5', A8: 'A5', S0: 'S1', S3: 'S1', S6: 'S1',
  };
  var preserve = function () { return st.level === 0 && hasText(); };

  /* ── 동작 ── */
  // 목업용 수정안. 전체: 러닝타임에 맞춰 문단 수가 바뀐다. 일부분: 고른 문단만 바뀐다.
  var KEEP_SEED = {
    '코미디': ['민호가 자판기를 발로 차자 캔이 쏟아지고, 팀장이 "고마워" 하고 하나를 가져간다.', '민호가 마지막 동전을 넣는다. 캔은 안 나오고, 팀장이 오자 우르르 쏟아진다.', '자판기가 민호만 무시한다. 팀장 앞에서는 캔을 선물하듯 내민다.'],
    '드라마': ['야근 중인 민호. 자판기마저 응답이 없다. 팀장이 말없이 캔 하나를 건넨다.', '민호의 마지막 동전. 자판기는 멈추고, 복도엔 형광등 소리만 남는다.', '쏟아진 캔을 줍는 민호와 팀장. 처음으로 둘이 웃는다.'],
    '로맨스': ['자판기 앞에서 마주친 민호와 신입. 쏟아진 캔을 같이 줍는다.', '민호가 누른 버튼에서 두 개가 나온다. 하나를 옆 사람에게 건넨다.', '고장 난 자판기 앞, 같은 음료를 고른 두 사람.'],
    '스릴러': ['복도 불이 깜박인다. 자판기에서 캔 대신 낯선 열쇠가 떨어진다.', '민호가 자판기를 치자 안쪽에서 누군가 두드린다.', '캔이 쏟아지는 순간 CCTV가 꺼진다.'],
    '액션': ['자판기가 쓰러지며 복도를 막는다. 민호는 캔을 피하며 비상구로 뛴다.', '캔 하나를 두고 민호와 팀장의 추격전이 시작된다.', '쏟아지는 캔 사이로 민호가 미끄러지듯 마지막 캔을 낚아챈다.'],
    'SF·판타지': ['자판기가 말을 건다. "오늘의 행운을 고르세요."', '버튼을 누르자 자판기 안에서 내일 날짜의 캔이 나온다.', '자판기가 민호의 소원만큼 캔을 쏟아낸다.'],
    '미스터리': ['자판기에서 나온 캔마다 같은 이름이 적혀 있다.', '고장 난 자판기 안쪽에 누군가 숨겨 둔 쪽지가 있다.', '매일 오후 세 시, 자판기는 한 사람에게만 캔을 준다.'],
    '휴먼·가족': ['민호는 마지막 동전으로 아버지가 좋아하던 음료를 고른다.', '쏟아진 캔을 동료들과 나눠 마시며 처음으로 웃는다.', '퇴사하는 팀장에게 민호가 캔 하나를 건넨다.'],
    '일상·잔잔': ['오후 세 시의 복도. 자판기 앞에서 민호는 잠깐 숨을 고른다.', '고장 난 자판기 앞에 오늘도 같은 사람들이 모인다.', '캔 하나가 굴러가는 소리만 남은 조용한 복도.'],
    '호러': ['밤 열한 시. 자판기 불빛만 켜진 복도에서 캔이 저절로 굴러온다.', '민호가 버튼을 누르자 자판기 유리에 다른 얼굴이 비친다.', '쏟아진 캔이 모두 같은 날짜로 찍혀 있다. 오늘 밤.'],
  };
  var NEW_SEED = {
    '코미디': ['회사 엘리베이터가 민호만 태우지 않는다. 문이 닫힐 때마다 팀장이 손을 흔든다.', '사내 복권에 민호 혼자 당첨된다. 상품은 자판기 평생 이용권.', '민호의 화분이 말을 하기 시작한다. 잔소리만 한다.'],
    '드라마': ['퇴사 날, 민호는 처음 입사한 날의 사원증을 서랍에서 찾는다.', '민호와 팀장이 정전된 엘리베이터에 갇힌다.', '아버지가 일하던 공장 자리에 민호의 회사가 들어서 있다.'],
    '로맨스': ['매일 같은 시간, 옥상에서 마주치는 두 사람.', '잘못 온 택배 상자 속에 편지가 들어 있다.', '복사기 앞에서 매번 종이가 걸리는 사람.'],
    '스릴러': ['민호의 메일함에 내일 날짜로 보낸 메일이 와 있다.', '퇴근 후 사무실 불이 하나씩 다시 켜진다.', '회의실 화이트보드에 민호만 읽을 수 있는 글씨가 남아 있다.'],
    '액션': ['출근길 지하철이 멈추고, 민호는 마지막 칸에서 소매치기를 쫓는다.', '택배 상자 하나를 두고 세 사람이 도시를 가로지른다.', '정전된 빌딩, 엘리베이터에 갇힌 사람들을 민호가 꺼낸다.'],
    'SF·판타지': ['고장 난 배달 로봇이 길을 잃고 한 아이를 따라간다.', '민호의 우산을 펴면 그 자리만 시간이 멈춘다.', '회사 지하에 다른 세계로 가는 문이 있다.'],
    '미스터리': ['매주 금요일, 민호 책상에 이름 없는 편지가 놓인다.', '회사 사람 모두가 어제 일을 기억하지 못한다.', '분실물 보관함에 민호의 물건이 하나씩 늘어난다.'],
    '휴먼·가족': ['10년 만에 돌아온 고향 집, 아버지의 낡은 카메라.', '할머니의 요리 수첩을 따라 손녀가 장을 본다.', '이사 가는 날, 형제가 어릴 적 비밀 기지를 찾아간다.'],
    '일상·잔잔': ['비 오는 날 동네 세탁소의 하루.', '새벽 첫차를 타는 사람들.', '오래된 단골 식당이 문을 닫는 마지막 날.'],
    '호러': ['13층 버튼이 생긴다. 아무도 누르지 않았는데.', '민호의 책상 위 사진 속 사람이 한 명 늘어 있다.', '야근하는 민호의 모니터에 회사 CCTV 화면이 뜬다. 민호 뒤에 누가 서 있다.'],
  };
  var CONT = ['일이 점점 커지고, 민호는 수습하려 애쓴다.', '예상하지 못한 사람이 끼어들며 판이 뒤집힌다.', '마지막에 민호는 작은 것 하나를 얻는다.', '다음 날, 같은 자리에서 비슷한 일이 다시 시작된다.'];
  var PART_WAYS = ['더 짧고 빠르게', '대사를 살려서', '분위기를 바꿔서'];
  function makeVariants(req, parts) {
    var md = MOODS[st.mood];
    if (parts && parts.length) {
      st.vnote = '고른 문단: ' + parts.map(function (i) { return 'S' + (i + 1); }).join(', ') + (req ? ' · 요청: ' + req : '') + ' · 나머지 문단은 그대로';
      st.variants = PART_WAYS.map(function (w, k) {
        var pr = st.prose.slice();
        parts.forEach(function (i) { pr[i] = '[' + w + '] ' + (req ? req + ' — ' : '') + st.prose[i]; });
        return { prose: pr, changed: parts.slice() };
      });
    } else if (req) {
      st.vnote = '요청: ' + req;
      st.variants = KEEP_SEED[md].map(function (t) { var pr = st.prose.slice(); pr[0] = t; return { prose: pr, changed: [0] }; });
    } else {
      var n = [2, 3, 4, 5][st.runtime];
      st.vnote = RUNTIMES[st.runtime][0] + ' · ' + md + ' · 소재 ' + SEEDS[st.seed][0] + ' · 씬 ' + n + '개';
      st.variants = (st.seed ? NEW_SEED : KEEP_SEED)[md].map(function (t) {
        var pr = [t].concat(CONT.slice(0, n - 1));
        return { prose: pr, changed: pr.map(function (_, i) { return i; }) };
      });
    }
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
    next1: function () {
      if (!st.file && ideaLen() < MIN_LEN) { st.lenErr = true; return 'E1e'; }
      st.lenErr = false;
      st.pending = recommend;
      return 'E2';
    },
    pickSample: function (i) { var f = SAMPLE_FILES[+i]; return pickFile(f[1], f[0]); },
    clearFile: function () { st.file = null; st.kind = '1-3'; st.rec = null; if (!levelOk(st.level)) st.level = recLevel(); },
    closeFile: function () { st.fileErr = ''; return entryId(); },
    dropFileGo: function () { st.file = null; st.kind = '1-3'; if (ideaLen() < MIN_LEN) { st.lenErr = true; return 'E1e'; } st.pending = recommend; return 'E2'; },
    retryFile: function () { st.file = null; st.kind = '1-3'; st.fileErr = ''; return 'EF'; },
    example: function (i) { st.idea = EXAMPLES[+i][1]; st.lenErr = false; },
    guide: function (i) { st.idea = (st.idea.trim() ? st.idea.replace(/\s+$/, '') + '\n' : '') + GUIDES[+i]; setTimeout(function () { var t = root && root.querySelector('#idea'); if (t) { t.focus(); t.setSelectionRange(t.value.length, t.value.length); } }, 0); },
    confirmStart: function () {
      st.ratioLocked = true;
      if (preserve()) { st.proseLocked = true; return 'W1r'; }
      st.pending = function () {
        var t = st.idea.trim();
        if (!t) return;
        st.title = t.split(/[.,\n]/)[0].slice(0, 18) || st.title;
        if (t !== initial().idea && !st.file) st.prose = [t.split('\n')[0].replace(/[.]?$/, '.'), '일이 점점 커지고, 주인공은 어떻게든 수습하려 애쓴다.', '마지막에 주인공은 작은 것 하나를 얻고, 처음과 조금 달라진 얼굴로 돌아선다.'];
      };
      return 'E5';
    },
    send: function (arg) {
      var t = (arg || st.chatDraft).trim(); if (!t) return;
      st.chatDraft = '';
      var on = cur.charAt(0) === 'W' ? 'Writer' : cur.charAt(0) === 'A' ? 'Artist' : 'Storyboard';
      say(on, '나', t);
      if (on === 'Writer') {
        if (/다시\s*(써|쓰)/.test(t)) return 'WC1';
        st.request = t; st.partMode = false;
        st.pending = function () { makeVariants(t); say('Writer', 'Writer', '요청대로 세 가지 안을 썼어요. 하나를 골라 주세요.'); };
        return 'W2';
      }
      if (on === 'Artist') {
        if (st.acMode) { var m = st.acMode; st.acMode = null; return ACTS.regenObj(m, t); }
        if (/추가|새 인물|새 배경|넣어/.test(t)) return 'AX';
        if (/이전|돌아가|돌려|전에 만든/.test(t) || STYLES.some(function (x) { return t.indexOf(x[0] + '로') >= 0 || t.indexOf(x[0] + '으로') >= 0; })) return 'AY';
        var hit = -1; objs().forEach(function (o, i) { if (hit < 0 && t.indexOf(o.n) >= 0) hit = i; });
        st.target = hit < 0 ? 0 : hit;
        return 'AC1';
      }
      st.pending = function () { st.shots.forEach(function (s) { s.redrawn = true; }); say('Storyboard', 'Storyboard', '요청을 반영해 샷을 다시 그렸어요.'); };
      return 'S3';
    },
    rewrite: function () {
      st.rw = null; st.request = ''; st.partMode = false;
      var from = cur === 'WC2' ? '채팅 카드' : '조건 패널';
      st.pending = function () { makeVariants(''); say('Writer', 'Writer', RUNTIMES[st.runtime][0] + ' · ' + MOODS[st.mood] + ' · 소재 ' + SEEDS[st.seed][0] + '으로 세 가지 안을 썼어요.' + (st.plan === 'A' && from === '채팅 카드' ? '' : '')); };
      return 'W2';
    },
    rwOpen: function () { st.rw = st.rw ? null : { runtime: st.runtime, mood: st.mood, seed: st.seed }; },
    rwPick: function (a) { var kv = a.split(':'); st.rw[kv[0]] = +kv[1]; },
    rwClose: function () { st.rw = null; },
    rwApply: function () { var d = st.rw; st.rw = null; st.runtime = d.runtime; st.mood = d.mood; st.seed = d.seed; return ACTS.rewrite(); },
    togglePart: function (i) { i = +i; var k = st.parts.indexOf(i); if (k >= 0) st.parts.splice(k, 1); else st.parts.push(i); st.parts.sort(); st.focusChat = true; },
    sendPart: function () {
      if (!st.parts.length) return;
      st.partNote = st.chatDraft.trim(); st.chatDraft = '';
      say('Writer', '나', st.parts.map(function (i) { return 'S' + (i + 1); }).join(', ') + (st.partNote ? ' — ' + st.partNote : ' 다듬어 줘'));
      return ACTS.rewritePart();
    },
    cancelPart: function () { st.parts = []; st.chatDraft = ''; return 'W1'; },
    rewritePart: function () {
      if (!st.parts.length) return;
      st.partMode = true;
      var note = st.partNote.trim();
      st.pending = function () { makeVariants(note, st.parts.slice()); say('Writer', 'Writer', st.parts.map(function (i) { return 'S' + (i + 1); }).join(', ') + '만 고친 세 가지 안이에요. 나머지는 그대로예요.'); };
      return 'W2';
    },
    applyVariant: function () {
      var v = st.variants[st.vpick]; if (!v) return 'W1';
      st.prose = v.prose.slice(); st.variants = []; st.parts = []; st.partNote = ''; st.partMode = false;
      say('Writer', 'Writer', '안 ' + (st.vpick + 1) + '을(를) 적용했어요.');
      return 'WP';
    },
    dropVariant: function () { st.variants = []; st.partMode = false; say('Writer', 'Writer', '수정안을 버리고 원래 산문을 유지해요.'); return 'W1'; },
    openDirect: function () { st.draft = st.prose.slice(); st.titleDraft = st.title; return 'W5'; },
    addScene: function () { st.draft.push(''); },
    saveDirect: function () { st.prose = st.draft.filter(function (p) { return p.trim(); }); if (st.titleDraft && st.titleDraft.trim()) st.title = st.titleDraft.trim(); say('Writer', 'Writer', '직접 고친 산문을 저장했어요.'); return 'WP'; },
    rwOpenGo: function () { st.rw = { runtime: st.runtime, mood: st.mood, seed: st.seed }; return 'W3'; },
    chatFree: function () { st.focusChat = true; return 'W1'; },
    breakdown: function () { st.proseLocked = true; st.back = ''; st.pending = detectNew; return 'A0'; },
    rollback: function (from) { st.proseLocked = false; st.back = from; st.ratioLocked = true; return 'W1'; },
    descEdit: function (i) { st.descEdit = +i; },
    descDone: function () { st.descEdit = -1; },
    generate: function () { st.styleLocked = true; st.pending = function () { newVersion(st.style); st.generated = true; st.newItems = []; say('Artist', 'Artist', STYLES[st.style][0] + '으로 v' + st.versions.length + '을 만들었어요. 마음에 들면 [완료하기], 아니면 [재생성하기]나 하나씩 [다시 만들기]를 눌러 주세요.'); }; return 'A4'; },
    regenCancel: function () { st.regenStyle = null; return 'A5'; },
    regenAll: function () { var sty = st.regenStyle == null ? st.style : st.regenStyle; st.regenStyle = null; st.pending = function () { st.style = sty; newVersion(sty); say('Artist', 'Artist', STYLES[sty][0] + '으로 v' + st.versions.length + '을 만들었어요. 이전 버전은 [불러오기]에 있어요.'); }; return 'A4'; },
    loadVer: function (i) { var v = st.versions[+i]; st.style = v.style; objs().forEach(function (o, k) { if (v.snap[k] != null) o.cur = v.snap[k]; }); st.ver = +i; say('Artist', 'Artist', 'v' + v.n + '(' + STYLES[v.style][0] + ')을 불러왔어요. 작품 스타일도 ' + STYLES[v.style][0] + '으로 바뀌었어요.'); return 'A5'; },
    objLoad: function (k) { var o = target(); if (o.hist[+k].style !== st.style) return; o.cur = +k; st.versions[st.ver].snap[st.target] = o.cur; say('Artist', 'Artist', o.n + '의 이전 그림을 불러왔어요.'); return 'A5'; },
    openTone: function (i) { st.target = +i; st.renaming = false; st.editMode = null; return 'A7'; },
    renameStart: function () { st.renaming = true; },
    renameDone: function () { st.renaming = false; },
    sTab: function (k) { target().sTab = +k; },
    // 칩을 누르면 프롬프트 끝에 붙고, 다시 누르면 프롬프트에서 빠진다
    toggleTrait: function (t) {
      var o = target(), k = o.traits.indexOf(t);
      if (k >= 0) { o.traits.splice(k, 1); o.prompt = o.prompt.split(/,\s*/).filter(function (x) { return x.trim() !== t; }).join(', '); }
      else { o.traits.push(t); o.prompt = (o.prompt.trim() ? o.prompt.trim().replace(/[.,]\s*$/, '') + ', ' : '') + t; }
    },
    editMode: function (m) { st.editMode = m; },
    afilter: function (f) { st.afilter = f; },
    rebreak: function () { st.pending = function () { if (st.removed) { st.chars.push(st.removed); st.removed = null; } say('Artist', 'Artist', '다시 뽑았어요. 빠졌던 인물이 목록에 들어왔어요.'); }; return 'A0'; },
    addMissing: function () { missingNames().forEach(function (n) { var back = st.removed && st.removed.n === n ? st.removed : null; st.chars.push(back || { n: n, d: '산문에 나오는 인물. 설명은 다시 뽑거나 직접 적어 주세요.', states: ['기본'], tone: 0, note: '' }); }); st.removed = null; },
    addRef: function (key) { var r = refsOf(key); r.push((key === 'style' ? '그림체' : '참고') + '_' + (r.length + 1) + '.jpg'); },
    delRef: function (a) { var kv = a.split(':'); refsOf(kv[0]).splice(+kv[1], 1); },
    acPick: function (m) { st.acMode = m; return m === 'edit' ? 'AC2' : 'AC3'; },
    regenObj: function (mode, note) {
      var t = target(), ti = st.target; st.regenMode = mode;
      var traits = t.traits.slice(), n = note || '';
      st.pending = function () {
        var v = st.versions[st.ver] ? st.versions[st.ver].n : 1;
        var r = t.hist.filter(function (h) { return h.v === v; }).length;
        t.hist.push({ style: st.style, tone: traits.indexOf('호러') >= 0 ? 2 : 0, note: n, traits: traits, model: t.model, v: v, r: r }); t.cur = t.hist.length - 1;
        if (st.versions[st.ver]) st.versions[st.ver].snap[ti] = t.cur;
        say('Artist', 'Artist', t.n + '을(를) ' + (mode === 'edit' ? '지금 그림을 바탕으로 고쳤어요' : '같은 스타일로 새로 만들었어요') + (n ? ' — ' + n : '') + '. 이전 그림은 상세의 기록에 있어요.');
      };
      return 'A8';
    },
    applyTone: function () {
      var t = target(), ti = st.target, tone = st.toneDraft, tw = st.tweak.trim();
      st.pending = function () {
        var v = st.versions[st.ver] ? st.versions[st.ver].n : 1;
        var r = t.hist.filter(function (h) { return h.v === v; }).length;
        t.hist.push({ style: st.style, tone: tone, note: tw, v: v, r: r }); t.cur = t.hist.length - 1;
        if (st.versions[st.ver]) st.versions[st.ver].snap[ti] = t.cur;
        say('Artist', 'Artist', t.n + '을(를) 다시 만들었어요' + (tone ? ' (' + TONES[tone] + ' 톤)' : '') + '. 이전 그림은 다시 만들기 창의 기록에 있어요.');
      };
      return 'A8';
    },
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
    // 목업 보기용: 위쪽 단계 탭을 누르면 그 단계 첫 화면으로
    jumpStage: function (name) {
      return { Producer: entryId(), Writer: 'W1', Artist: st.versions.length ? 'A5' : 'A1', Storyboard: 'S1', Director: 'D1', Editor: 'D1' }[name];
    },
    reset: function () { var p = st.plan; st = initial(); st.plan = p; return p === 'B' ? 'EB1' : 'E1'; },
    bStart: function () {
      if (!st.file && /예시/.test(st.idea) && ideaLen() < MIN_LEN + 10) { st.idea = ''; st.lenErr = false; return 'EBX'; }
      if (!st.file && ideaLen() < MIN_LEN) { st.lenErr = true; return 'E1e'; }
      st.lenErr = false; st.bAns = {}; st.bPre = {}; st.bHint = ''; st.bSent = true;
      st.pending = function () {
        recommend();
        parseInto(st.idea).forEach(function (k) { st.bPre[k] = true; });
      };
      return 'E2';
    },
    bAnswer: function (a) {
      var kv = a.split(':'), k = kv[0], v = +kv[1];
      if (k === 'ratio') st.ratio = RATIOS[v][0];
      else if (k === 'file') { st.level = v; st.bAns.level = true; st.bAns.file = true; st.bHint = ''; return nextQ(); }
      else st[k] = v;
      st.bAns[k] = true; st.bPre[k] = false; st.bHint = '';
      return nextQ();
    },
    bFileOk: function () { st.bAns.file = true; return nextQ(); },
    focusIdea: function () { setTimeout(function () { var t = root && root.querySelector('#idea'); if (t) t.focus(); }, 0); },
    moreEx: function () { st.exPage = (st.exPage + 1) % Math.ceil(EXAMPLES.length / 3); },
    bReask: function (k) { if (k === 'level' && st.file) k = 'file'; st.bAns[k] = false; st.bPre[k] = false; return BQ_SCREEN[k]; },
    bSend: function () {
      var t = st.chatDraft.trim(); if (!t) return;
      st.chatDraft = '';
      var got = parseInto(t);
      got.forEach(function (k) { st.bPre[k] = false; });
      st.bHint = got.length ? '"' + t + '" — ' + got.map(function (k) { return BQ_NAME[k] + ' ' + ansText(k); }).join(', ') + '(으)로 정했어요.' : '"' + t + '" — 잘 못 알아들었어요. 버튼으로 골라 주세요.';
      return got.length ? nextQ() : null;
    },
  };

  function badExtMsg(name) { return '"' + name + '"은(는) 올릴 수 없어요. 글 파일(txt · md · docx · pdf · hwp)이나 글이 담긴 이미지(png · jpg)만 올릴 수 있어요.'; }
  function pickFile(name, kind, size) {
    var ext = (name.split('.').pop() || '').toLowerCase();
    if (kind === 'bad' || (TEXT_EXT.indexOf(ext) < 0 && IMG_EXT.indexOf(ext) < 0)) { st.fileErr = badExtMsg(name); return 'EFe'; }
    if (size > 10 * 1024 * 1024) { st.fileErr = '"' + name + '"은(는) 10MB가 넘어요. 10MB 이하로 올려 주세요.'; return 'EFe'; }
    var img = IMG_EXT.indexOf(ext) >= 0;
    st.file = { name: name, image: img, noText: kind === 'notext' };
    st.kind = img ? 'img' : (kind && KINDS[kind] ? kind : ext === 'txt' || ext === 'md' ? '1-3' : '1-1');
    st.fileErr = ''; st.lenErr = false; st.rec = null;
    return entryId();
  }

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
  function screenFor(id) { if (SCREENS[id]) return id; var d = DECISION_SCREEN[id]; return typeof d === 'function' ? d() : d || null; }
  function paint() {
    if (!root) return;
    var sid = screenFor(cur);
    var focusId = document.activeElement && root.contains(document.activeElement) ? document.activeElement.getAttribute('data-bind') : null;
    root.innerHTML = sid ? SCREENS[sid]() : '<div class="w-entry"><p class="w-mut">이 노드는 화면이 없어요.</p></div>';
    refresh();
    root.querySelectorAll('.w-chat-b').forEach(function (c) { c.scrollTop = c.scrollHeight; });
    if (focusId) { var el = root.querySelector('[data-bind="' + focusId + '"]:not(.w-opt)'); if (el && el.focus) el.focus(); }
    if (st.focusChat) { st.focusChat = false; var fc = root.querySelector('#chat-in'); if (fc) { fc.focus({ preventScroll: true }); return; } }
    if (st.rw) { var po = root.querySelector('.w-rwp .w-opt.on'); if (po) { po.focus({ preventScroll: true }); return; } }
    var dlg = root.querySelector('.w-modal');
    if (dlg && !focusId) { var f = dlg.querySelector('input, textarea, .w-acts .w-btn:last-child'); if (f) f.focus({ preventScroll: true }); }
  }
  // 입력이 있으면 버튼을 켠다 (오류 #10)
  function refresh() {
    var n = ideaLen();
    root.querySelectorAll('[data-count]').forEach(function (el) {
      el.textContent = n + '자' + (st.file ? '' : ' · 최소 ' + MIN_LEN + '자');
      el.classList.toggle('short', !st.file && n < MIN_LEN);
    });
    root.querySelectorAll('[data-lennow]').forEach(function (el) { el.textContent = n; });
    if (n >= MIN_LEN) root.querySelectorAll('[data-lenerr]').forEach(function (el) { el.hidden = true; });
    root.querySelectorAll('.w-lv').forEach(function (b) { b.disabled = !levelOk(+b.getAttribute('data-val')); });
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
    if (id === 'W1' && st.proseLocked) st.proseLocked = false;
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
      if (st.rw && !t.closest('.w-popwrap')) { st.rw = null; paint(); }
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
      if (t.classList && t.classList.contains('ref-in') && t.files && t.files[0]) { refsOf(t.getAttribute('data-ref')).push(t.files[0].name); t.value = ''; paint(); return; }
      if (t.id === 'file-in' && t.files && t.files[0]) {
        var f = t.files[0]; t.value = '';
        go(pickFile(f.name, null, f.size));
      } else if (t.tagName === 'SELECT' && t.getAttribute('data-bind') === 'dlgLang') paint();
    });
    el.addEventListener('keydown', function (e) {
      var t = e.target;
      if (e.key === 'Enter' && !e.isComposing && !(e.shiftKey && t.tagName === 'TEXTAREA') && t.getAttribute && t.getAttribute('data-enter')) { e.preventDefault(); run(t.getAttribute('data-enter')); }
      if (e.key === 'Escape' && st.rw) { st.rw = null; paint(); var ob = root.querySelector('[data-act="rwOpen"]'); if (ob) ob.focus(); return; }
      if (e.key === 'Escape') { var c = root.querySelector('.w-acts .w-btn'); if (c) c.click(); }
    });
  }

  window.PROTO = {
    mount: mount, show: show,
    has: function (id) { return !!screenFor(id); },
    screenFor: screenFor,
    reset: function () { var p = st.plan; st = initial(); st.plan = p; show(cur); },
    setPlan: function (p) { st.plan = p; if (cur) show(cur); },
    current: function () { return cur; },
  };
})();
