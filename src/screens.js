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
  // 샷 촬영값 (v18 Writer 샷 옵션)
  var SHOT_TYPES = [['ECU', 'Extreme close-up: 눈·손처럼 아주 좁은 부분만'], ['CU', 'Close-up: 얼굴 위주'], ['MCU', 'Medium close-up: 가슴 위'], ['MS', 'Medium shot: 허리 위'], ['MFS', 'Medium full shot: 무릎 위'], ['FS', 'Full shot: 전신'], ['WS', 'Wide shot: 인물과 주변 공간'], ['EWS', 'Extreme wide shot: 광활한 배경, 인물은 작게'], ['OTS', 'Over-the-shoulder: 어깨 너머로 상대를'], ['POV', 'Point of view: 인물의 시점'], ['TRACK', 'Tracking shot: 피사체를 따라 이동'], ['2S', 'Two shot: 인물 둘을 한 프레임에']];
  var ANGLES = [['아이레벨', '눈높이: 가장 자연스러운 시선'], ['하이 앵글', '위에서 내려다봄: 작고 약해 보여요'], ['로우 앵글', '아래에서 올려다봄: 크고 강해 보여요'], ['버드아이', '바로 위에서: 상황 전체를 지도처럼'], ['웜즈아이', '바닥에서: 압도적인 느낌'], ['더치', '기울어진 화면: 불안 · 긴장']];
  var MOVES = [['고정', '카메라가 움직이지 않아요'], ['팬', '제자리에서 좌우로 돌려요'], ['틸트', '제자리에서 위아래로 돌려요'], ['달리 인', '피사체에게 다가가요'], ['달리 아웃', '피사체에게서 멀어져요'], ['트래킹', '피사체를 따라 움직여요'], ['핸드헬드', '손에 든 듯 흔들려요'], ['줌', '렌즈로 당기거나 밀어요']];
  // 조명: 위치는 얼굴에 빛이 어디서 오는지, 색온도는 빛의 색. 모르는 사람도 보고 고를 수 있게 미리보기를 같이 보여준다.
  var LIGHT_POS = [['정면', '얼굴 전체가 고르게 밝아요'], ['왼쪽 측면', '왼쪽만 밝고 반대쪽은 그늘져요'], ['오른쪽 측면', '오른쪽만 밝고 반대쪽은 그늘져요'], ['역광', '뒤에서 비춰 윤곽만 빛나요'], ['위에서', '머리 위에서: 눈 밑이 그늘져요'], ['아래에서', '아래에서: 무섭고 낯선 느낌']];
  var LIGHT_TEMP = [['2700K', '촛불 · 전구: 아주 따뜻한 주황빛', '#ffb066'], ['3200K', '텅스텐 · 실내등: 따뜻한 노란빛', '#ffc98f'], ['4300K', '형광등: 살짝 따뜻한 흰빛', '#ffe6cc'], ['5600K', '주광 (기본): 한낮 햇빛', '#fff8ef'], ['6500K', '흐린 날: 살짝 푸른 흰빛', '#e9efff'], ['8000K', '그늘 · 밤: 차가운 푸른빛', '#c6d6ff']];
  var LENS = []; for (var _l = 1; _l <= 30; _l++) LENS.push(_l);
  var TIMES = ['낮', '오후', '해질녘', '밤', '새벽'];
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
        '자판기가 덜컹거리더니 캔이 우르르 쏟아진다. 지나가던 팀장이 하나를 집어 들고 "고마워" 하고 간다. 틴장은 뒤도 안 돌아본다. 복도 끝에서 경비 아저씨가 혀를 찬다. 바닥에 굴러다니는 캔 사이에서 민호는 멍하니 서 있다.',
      ],
      plan: 'A', pop: null, ents: null, pick: null, adding: false, editEnt: -1, entName: '', mergeInto: -1, showEx: false, exPage: 0, rw: null, bAns: {}, bPre: {}, bHint: '', bSent: false, draft: [], runtime: 0, mood: 0, seed: 0, request: '', variants: [], vpick: 0, vnote: '', parts: [], partNote: '', partMode: false,
      proseLocked: false, back: '', descEdit: -1,
      chars: [
        { n: '민호', d: '20대 후반 직장인. 흰 셔츠, 느슨한 넥타이, 피곤한 눈.', states: ['흰 셔츠', '콜라 얼룩 셔츠 (S2)'], tone: 0, note: '' },
        { n: '팀장', d: '40대. 회색 정장, 단정한 머리, 무표정.', states: ['회색 정장'], tone: 0, note: '' },
        { n: '틴장', d: '뒤도 안 돌아보는 사람. (AI가 따로 뽑음)', states: ['처음 모습'], tone: 0, note: '' },
      ],
      bgs: [{ n: '회사 복도 자판기 앞', d: '낮, 형광등, 리놀륨 바닥, 빨간 자판기 한 대.', tone: 0 }],
      newItems: [],
      style: 1, styleLocked: false, generated: false, versions: [], ver: 0, regenStyle: null, styleRefs: [], renaming: false, acMode: null, afilter: 'all', editMode: null,
      target: 0, toneDraft: 0, tweak: '',
      // 씬: 장소(배경 번호) · 시간대 · 한 줄 요약. 샷: 시작(지문·인물·배경·대사·크기·앵글) + 연출(무브먼트·방향·액션·길이)
      scenes: [{ place: 0, time: 0, sum: '민호가 자판기와 씨름한다' }, { place: 0, time: 0, sum: '캔이 쏟아지고 팀장이 하나를 가져간다' }],
      shots: [
        { sc: 1, len: 3, size: 3, ang: 0, move: 0, light: { pos: 0, temp: 3, bri: 50 }, dir: '', desc: '@민호가 자판기 버튼을 누른다', who: [0], ws: {}, lines: [], drawn: true },
        { sc: 1, len: 2, size: 0, ang: 0, move: 0, light: { pos: 0, temp: 3, bri: 50 }, dir: '레버를 당긴다', desc: '반환 레버를 당기는 @민호의 손', who: [0], ws: {}, lines: [], drawn: true },
        { sc: 1, len: 2, size: 3, ang: 2, move: 3, light: { pos: 0, temp: 3, bri: 50 }, dir: '천천히 다가간다', desc: '@민호가 자판기를 툭 친다', who: [0], ws: {}, lines: [{ w: 0, t: '…또 안 나와?', lang: '한' }], drawn: true },
        { sc: 2, len: 4, size: 6, ang: 1, move: 2, light: { pos: 0, temp: 3, bri: 50 }, dir: '아래로 틸트', desc: '캔이 우르르 쏟아진다', who: [0], ws: { 0: 1 }, lines: [], drawn: true },
        { sc: 2, len: 3, size: 11, ang: 0, move: 1, light: { pos: 0, temp: 3, bri: 50 }, dir: '', desc: '@팀장이 캔 하나를 집어 든다', who: [1, 0], ws: { 0: 1 }, lines: [{ w: 1, t: '고마워.', lang: '한' }], drawn: true },
        { sc: 2, len: 2, size: 1, ang: 0, move: 0, light: { pos: 0, temp: 3, bri: 50 }, dir: '', desc: '멍하니 선 @민호', who: [0], ws: { 0: 1 }, lines: [], drawn: true },
      ],
      shotSel: 4, shotDraft: null, shotTab: 'start', shotNew: false, dirMode: 'opt', addAt: null, ddOpen: '', sbView: 'rough', sbMenu: -1, sbChange: null, stateFrom: '',
      scAdd: { place: 0, time: 0, sum: '', pos: 2 }, sheet: { range: 0, pic: 0, per: 0 },
      stateAdd: { who: 0, text: '10년 뒤, 머리가 희끗한 민호' },
      chatDraft: '',
      chat: {
        Writer: [['Writer', '씬 두 개로 산문을 썼어요. 마음에 안 들면 "다시 써줘"라고 하거나 조건을 바꿔 다시 쓰게 해 주세요.']],
        Artist: [['Artist', '인물 2명, 배경 1곳이에요. 민호는 S2에서 얼룩진 셔츠 상태가 하나 더 있어요.']],
        Storyboard: [],
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
      // Artist는 넘어간 뒤에도 잠기지 않는다: 돌아가 모습·그림을 고칠 수 있다 (인물·배경 목록만 산문을 따른다)
      var open = k < i && s === 'Artist';
      return '<button class="' + (k === i ? 'on' : open ? 'done open' : k < i ? 'done' : '') + '" data-act="jumpStage" data-arg="' + s + '"' + (k === i ? ' aria-current="step"' : '') + (open ? ' title="돌아가서 모습 · 그림을 고칠 수 있어요"' : '') + '>' + s + '</button>';
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
    return '<div class="w-back"><div class="w-modal' + (wide ? ' wide' + (wide === 'xl' || wide === 'xxl' ? ' ' + wide : '') : '') + '" role="dialog" aria-modal="true" aria-label="' + esc(title) + '"><h4>' + esc(title) + '</h4>' + body + '<div class="w-acts">' + acts + '</div></div></div>';
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
      '<div class="w-card-acts">' + A('좋아요, 다음 단계로', 'breakdown', 'pri sm') + B('아니요, 더 고칠래요', 'WN', 'sm') + '</div>') });
  }
  function WN() {
    return writer({ card: chatCard('무엇을 더 해 볼까요?', '<div class="w-qr col">' +
      B('✦ 다시 써 달라고 하기 <small>전부 또는 일부분</small>', 'WC1', 'sm') +
      (st.plan === 'A' ? A('러닝타임 · 장르 바꿔서 다시 쓰기', 'rwOpenGo', 'sm') : B('러닝타임 · 장르 바꿔서 다시 쓰기', 'WC2', 'sm')) +
      A('✎ 직접 고치기', 'openDirect', 'sm') +
      A('채팅으로 말할게요', 'chatFree', 'sm') + '</div><p class="w-note">고친 걸 적용하면 다시 물어볼게요. 언제든 [브레이크다운하기]로 넘어갈 수도 있어요.</p>') });
  }
  function W3() { if (!st.rw) st.rw = { runtime: st.runtime, mood: st.mood, seed: st.seed }; return W1(); }
  /* ── 산문 재점검: Artist 목록 위에 산문을 팝업으로 열어 인물·장소 표시를 고친다 ── */
  // AI가 뽑은 것만 표시한다(AI가 모르는 건 표시하지 않는다). 빠진 말은 사용자가 산문에서 골라 [추가하기],
  // 이름이 틀렸으면 [수정] — 이미 있는 이름으로 고치면 그 인물·장소와 합쳐진다. 산문은 잠긴 채 그대로다.
  var PLACE_ALIAS = { '회사 복도 자판기 앞': ['회사 복도', '복도', '자판기 앞'] };
  function initEnts() {
    st.ents = st.chars.map(function (c) { return { name: c.n, type: 'char', aliases: (c.aliases || [c.n]).slice() }; })
      .concat(st.bgs.map(function (b) { return { name: b.n, type: 'place', aliases: (b.aliases || PLACE_ALIAS[b.n] || [b.n]).slice() }; }));
    st.pick = null; st.adding = false; st.editEnt = -1; st.mergeInto = -1;
  }
  function tagProse() {
    var ali = []; st.ents.forEach(function (e, i) { e.aliases.forEach(function (a) { ali.push([a, i]); }); });
    if (!ali.length) return st.prose.map(function (p, k) { return '<p><span>S' + (k + 1) + '</span>' + esc(p) + '</p>'; }).join('');
    var words = ali.map(function (x) { return x[0]; }).sort(function (a, b) { return b.length - a.length; });
    var re = new RegExp(words.map(function (w) { return w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }).join('|'), 'g');
    return st.prose.map(function (p, k) {
      var out = '', last = 0;
      p.replace(re, function (m, idx) {
        out += esc(p.slice(last, idx)); last = idx + m.length;
        var i = ali.filter(function (x) { return x[0] === m; })[0][1], e = st.ents[i];
        out += '<button class="w-tg ' + e.type + (st.editEnt === i ? ' sel' : '') + '" data-act="entEdit" data-arg="' + i + '" title="' + esc(e.name) + ' · 눌러서 수정">' + esc(m) + '</button>';
        return m;
      });
      return '<p><span>S' + (k + 1) + '</span>' + out + esc(p.slice(last)) + '</p>';
    }).join('');
  }
  var entKind = function (e) { return e.type === 'char' ? '인물' : '장소'; };
  function WT() {
    if (!st.ents) initEnts();
    // 산문에서 고른 말 → [추가하기] → 인물로 / 장소로
    var pickBar = '<div class="w-pickbar">' + (st.pick
      ? '<span>고른 말 <b class="w-tg">' + esc(st.pick) + '</b></span>' + (st.adding
        ? '<span class="w-qr">' + A('인물로 추가', 'addAs', 'pri sm', ' data-arg="char"') + A('장소로 추가', 'addAs', 'sm', ' data-arg="place"') + A('취소', 'pickClear', 'sm w-link') + '</span>'
        : A('＋ 추가하기', 'addStart', 'pri sm') + A('다시 고르기', 'pickClear', 'sm w-link'))
      : '<span class="w-mut">빠진 인물·장소가 있으면 산문에서 그 말을 드래그해서 고른 뒤 [추가하기]를 누르세요.</span>' + A('＋ 추가하기', 'addStart', 'sm', ' disabled title="산문에서 말을 먼저 골라 주세요"')) + '</div>';
    var listH = '<ul class="w-ents">' + st.ents.map(function (e, i) {
      var others = e.aliases.filter(function (a) { return a !== e.name; });
      if (st.editEnt === i) {
        return '<li class="on edit"><div class="w-ent-ed"><input class="w-in" id="ent-name" data-bind="entName" data-enter="entSave" value="' + esc(st.entName) + '" list="ent-names" aria-label="이름 고치기">' +
          '<datalist id="ent-names">' + st.ents.filter(function (x, k) { return k !== i && x.type === e.type; }).map(function (x) { return '<option value="' + esc(x.name) + '">'; }).join('') + '</datalist>' +
          A('확인', 'entSave', 'pri sm') + A('취소', 'entCancel', 'sm') + '</div>' +
          '<span class="w-alias">이미 있는 ' + entKind(e) + ' 이름으로 고치면 하나로 합쳐져요 · ' + A('목록에서 빼기', 'entDrop', 'sm w-link', ' data-arg="' + i + '"') + '</span></li>';
      }
      return '<li><span class="w-ent-n"><span class="w-tg ' + e.type + '">' + esc(e.name) + '</span><small>' + entKind(e) + '</small></span>' +
        A('수정', 'entEdit', 'sm', ' data-arg="' + i + '"') +
        (others.length ? '<span class="w-alias">또는 ' + esc(others.join(' · ')) + '</span>' : '') + '</li>';
    }).join('') + '</ul>';
    var body = '<p class="w-mut">🔒 산문은 잠긴 채로 표시만 고쳐요. [목록에 반영]하면 Artist 목록이 이 표시대로 다시 채워져요.</p>' +
      '<div class="w-wt"><div class="w-wt-p"><article class="w-prose w-tgprose">' + tagProse() + '</article>' +
        '<p class="w-note"><span class="w-tg char">인물</span> <span class="w-tg place">장소</span> AI가 뽑은 것만 표시돼 있어요 · 표시된 말을 누르면 수정할 수 있어요</p>' + pickBar + '</div>' +
      '<aside class="w-wt-l"><div class="w-q-t">뽑은 목록 <small>' + st.ents.length + '개</small></div>' + listH + '</aside></div>' +
      '<p class="w-note">산문에 없는 인물·배경이 필요하면 산문을 다시 써야 해요.</p>';
    return listScreen() + modal('산문 재점검', body,
      A('취소', 'recheckCancel') + A('산문 다시 쓰기', 'recheckRewrite') + A('목록에 반영', 'extract', 'pri', st.editEnt >= 0 ? ' disabled title="수정 중인 이름을 먼저 확인해 주세요"' : ''), 'xl');
  }
  // 이미 있는 이름으로 고쳤을 때: 합칠지 한 번 묻는다
  // 그림을 만든 뒤라면: 이 이름(들)이 지금 쓰는 그림의 주인
  function picOwner(ent) {
    if (ent.pic) return ent.pic;
    var has = function (n) { return objs().some(function (o) { return o.n === n && o.cur >= 0; }); };
    return has(ent.name) ? ent.name : ent.aliases.filter(has)[0] || null;
  }
  function WTm() {
    var e = st.ents[st.editEnt], t = st.ents[st.mergeInto];
    var pe = drawn() ? picOwner(e) : null, pt = drawn() ? picOwner(t) : null;
    if (pe && pt && [pe, pt].indexOf(st.mergePic) < 0) st.mergePic = pt;
    var picPick = pe && pt ? '<div class="w-q"><div class="w-q-t">어느 그림으로 할까요? <small>고르지 않은 그림은 ' + esc(t.name) + '의 기록에 남아요</small></div><div class="w-opts w-picpick" role="radiogroup">' +
      [pt, pe].map(function (n) { var o = objs().filter(function (x) { return x.n === n; })[0];
        return '<button class="w-opt' + (st.mergePic === n ? ' on' : '') + '" role="radio" aria-checked="' + (st.mergePic === n) + '" data-act="mergePic" data-arg="' + esc(n) + '">' + thumb(o, o.hist[o.cur]) + '<b>' + esc(n) + ' 그림</b></button>'; }).join('') + '</div></div>' : '';
    return WT() + modal(e.name + ' → ' + t.name + ', 하나로 합칠까요?', '<p>' + esc(t.name) + '은(는) 이미 목록에 있어요. 합치면 한 ' + entKind(t) + '이 되고, 산문의 "' + esc(e.aliases.join('", "')) + '"은(는) ' + esc(t.name) + '의 다른 이름(또는)으로 남아요.</p>' +
      picPick +
      '<p class="w-note">오타라면 산문 표기도 ' + esc(t.name) + '(으)로 맞출지 개발 확인이 필요해요.</p>',
      A('취소', 'mergeCancel') + A('합치기', 'mergeDo', 'acc'));
  }
  function W6() {
    return W1() + modal('산문을 확정할까요?', list([['다음', 'Artist가 산문에서 인물·배경을 뽑아요'], ['🔒 산문', '브레이크다운하면 잠겨요'], ['나중에 인물·배경을 늘리려면', '여기 산문으로 돌아와야 해요']]),
      B('아니오', st.proseLocked ? 'W1r' : 'W1') + A('예, 확정하기', 'breakdown', 'pri'));
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
      '<div class="w-row-b"><b>' + esc(o.n) + ' <small>' + (o.isBg ? '배경' : '인물') + (isNew ? ' · 새로' : '') + (o.aliases && o.aliases.length > 1 ? ' · 또는 ' + esc(o.aliases.filter(function (a) { return a !== o.n; }).join(' · ')) : '') + '</small></b>' + desc +
      (o.isBg ? '' : '<div class="w-row-st">' + o.states.map(function (x) { return '<span>' + esc(x) + '</span>'; }).join('') + '</div>') +
      '<div class="w-row-ref"><i>레퍼런스</i>' + refStrip(String(i), o.refs) + '</div></div>' +
      '<div class="w-row-a">' + acts + '</div></li>';
  }
  var showObj = function (o) { return st.afilter === 'all' || (st.afilter === 'bg') === o.isBg; };
  function filterBar() {
    var n = { all: st.chars.length + st.bgs.length, char: st.chars.length, bg: st.bgs.length };
    return '<div class="w-fbar"><span class="w-tabs">' + [['all', '모두'], ['char', '인물'], ['bg', '배경']].map(function (f) {
      return '<button class="' + (st.afilter === f[0] ? 'on' : '') + '" data-act="afilter" data-arg="' + f[0] + '" aria-pressed="' + (st.afilter === f[0]) + '">' + f[1] + ' ' + n[f[0]] + '</button>';
    }).join('') + '</span></div>';
  }
  // 상태(모습)마다 그림: 첫 상태는 o.cur, 나머지는 o.stImg[상태]. 따로 만든 적 없으면 같이 만든 그림으로 본다.
  function stIdx(o, k) { return k <= 0 ? o.cur : o.stImg && o.stImg[o.states[k]] != null ? o.stImg[o.states[k]] : -1; }
  function stateH(o, k) {
    var i = stIdx(o, k), main = o.cur >= 0 ? o.hist[o.cur] : null;
    if (k > 0 && o.noImg && o.noImg[o.states[k]] && i < 0) return null;
    if (i >= 0 && o.hist[i] && o.hist[i].style === st.style) return o.hist[i];
    return k > 0 && main ? Object.assign({}, main, { r: (main.r || 0) + k * 2 }) : main;
  }
  // 카드: 인물·배경마다 한 묶음. 첫 그림이 크게, 나머지 모습은 오른쪽에 작게 (v18 Artist 그룹 카드 참고)
  function gcell(o, i, k) {
    var h = stateH(o, k), main = k === 0, name = o.isBg ? '배경' : o.states[k];
    var dsc = h && h.traits && h.traits.length ? h.traits.join(' · ') : main ? o.d : '';
    return '<button class="w-gcell' + (main ? ' main' : '') + '" data-act="openState" data-arg="' + i + ':' + k + '" aria-label="' + esc(o.n + ' · ' + name) + ' 열기">' +
      '<span class="w-gimg">' + thumb(o, h, true) + '</span><span class="w-gname"><b>' + esc(name) + '</b></span>' + (dsc ? '<span class="w-gdesc">' + esc(dsc) + '</span>' : '') + '</button>';
  }
  function imgCards() {
    return '<div class="w-agrps">' + objs().map(function (o, i) {
      if (!showObj(o)) return '';
      var isNew = st.newItems.indexOf(o.n) >= 0, nv = o.isBg ? 0 : o.states.length - 1;
      var vars = o.isBg ? '' : nv
        ? '<div class="w-gvars"><div class="w-gvl">└ ' + esc(o.n) + '의 모습 ' + nv + '</div><div class="w-gvrow">' + o.states.slice(1).map(function (x, k) { return gcell(o, i, k + 1); }).join('') +
          '<button class="w-gadd" data-act="openState" data-arg="' + i + ':-1">＋ 모습 추가</button></div></div>'
        : '<button class="w-gadd solo" data-act="openState" data-arg="' + i + ':-1">＋<span>모습</span></button>';
      return '<div class="w-agrp' + (o.isBg ? ' bg' : '') + (nv ? ' wide' : '') + (isNew ? ' is-new' : '') + '">' +
        '<div class="w-agh"><b>' + esc(o.n) + '</b><span class="w-role">' + (o.isBg ? '배경' : '인물') + '</span>' + (isNew ? '<span class="w-tag-new">새로</span>' : '') +
        (o.aliases && o.aliases.length > 1 ? '<span class="w-mut" style="font-size:11px">또는 ' + esc(o.aliases.filter(function (a) { return a !== o.n; }).join(' · ')) + '</span>' : '') +
        '<span class="w-tbar-sp"></span>' + (o.refs.length ? '<span class="w-refcnt" title="레퍼런스 ' + o.refs.length + '장 · 상세에서 관리">🖼 ' + o.refs.length + '</span>' : '') + '</div>' +
        '<div class="w-agcells">' + gcell(o, i, 0) + vars + '</div></div>';
    }).join('') + '</div>';
  }
  function rows(mode) { return '<ul class="w-rows">' + objs().map(function (o, i) { return showObj(o) ? row(o, i, mode) : ''; }).join('') + '</ul>'; }
  function styleRow(bind, cur) {
    return '<div class="w-styles" role="radiogroup">' + STYLES.map(function (s, i) {
      return '<button class="w-sty' + (i === cur ? ' on' : '') + '" role="radio" aria-checked="' + (i === cur) + '" data-bind="' + bind + '" data-val="' + i + '"><i style="background:' + styleBg(i) + '"></i>' + esc(s[0]) + (bind === 'regenStyle' && i === st.style ? '<small>지금</small>' : '') + '</button>';
    }).join('') + '</div>';
  }
  function A1() {
    var unnamed = /사람들|누군가|행인/.test(st.prose.join(' '));
    var main = '<div class="w-title"><h3>Artist · 브레이크다운</h3><span class="w-mut">확정 산문에서 뽑은 인물 ' + st.chars.length + ' · 배경 ' + st.bgs.length + '</span></div>' +
      '<div class="w-diag"><b>AI 진단</b>' + (st.newItems.length ? '새로 들어온 것: ' + esc(st.newItems.join(', ')) + '. ' : '산문의 인물과 장소를 모두 찾았어요. ') +
      (unnamed ? '"지나가던 사람들"처럼 이름 없는 인물은 따로 뽑지 않았어요. 필요하면 산문에서 이름을 붙여 주세요.' : '') + '</div>' +
      filterBar() + rows('text') + '<p class="w-note">상태(씬마다 다른 옷·나이)는 그림을 만든 뒤 카드 상세의 [＋ 상태]나 Storyboard에서 더할 수 있어요.</p>' +
      '<div class="w-foot">' + B('인물·배경이 빠졌거나 겹쳤어요', 'A1c') + B('목록이 맞아요 · 그림 만들기 →', 'A2', 'pri') + '</div>';
    return studio('Artist', main, { noChat: true });
  }
  // 그림을 만든 뒤에도 같은 질문을 한다. 재점검은 스타일·그림을 그대로 두고 목록만 고친다.
  var drawn = function () { return st.versions.length > 0; };
  var listScreen = function () { return drawn() ? A5() : A1(); };
  function A1c() {
    return listScreen() + modal('산문을 다시 쓸래요? 재점검할까요?', '<p class="w-mut">목록이 산문과 달라 보이면 먼저 골라 주세요.</p>' + list(drawn()
      ? [['산문 재점검', '산문에 이미 나오는 말이면 이걸로 충분해요. 스타일과 지금 그림은 그대로예요. 새로 넣은 인물·배경만 그림이 비어 있어서 같은 스타일로 만들고, 합친 쪽 그림은 남는 쪽 기록으로 옮겨요'], ['산문 다시 쓰기', '산문에 없는 인물·배경을 넣을 때. 산문이 다시 열려요 (스타일 유지 · 바뀌지 않은 그림 유지는 개발 확인)']]
      : [['산문 재점검', '산문에 이미 나오는데 목록에 없거나, 한 사람이 둘로 나뉘었을 때. 산문은 잠긴 채로 말마다 표시만 고쳐요'], ['산문 다시 쓰기', '산문에 없는 인물·배경을 넣을 때. 산문이 다시 열려요 (아직 그림이 없어 잃는 건 없어요)']]),
      B('취소', drawn() ? 'A5' : 'A1') + B('산문 다시 쓰기', drawn() ? 'R2' : 'R1') + A('산문 재점검', 'recheck', 'pri'));
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
  function A4() { return (st.versions.length ? A5() : A1()) + busy(st.busyNames ? '새로 넣은 것을 같은 스타일로 만들고 있어요' : '그림을 만들고 있어요', st.busyNames || objs().map(function (o) { return o.n; })); }
  function A5(o) {
    o = o || {};
    if (!st.versions.length) newVersion(st.style);
    var v = st.versions[st.ver];
    var main = '<div class="w-title"><h3>Artist</h3><span class="w-mut">인물 ' + st.chars.length + ' · 배경 ' + st.bgs.length + '</span></div>' +
      '<div class="w-stybar"><i style="background:' + styleBg(st.style) + '"></i><b>' + esc(STYLES[st.style][0]) + '</b><span class="w-mut">작품 스타일 · v' + v.n + '</span>' +
      '<span class="w-tbar-sp"></span>' + B('불러오기 · 기록 ' + st.versions.length, 'AV', 'sm', st.versions.length > 1 ? '' : ' disabled title="재생성하면 이전 버전이 여기 남아요"') + B('재생성하기', 'A6', 'sm') + '</div>' +
      filterBar() + imgCards() +
      '<div class="w-foot">' + B('인물·배경이 빠졌거나 겹쳤어요', 'A1c') + B('완료하기 →', 'A9', 'pri', objs().some(function (x) { return x.cur < 0; }) ? ' disabled title="그림 없는 인물·배경을 먼저 만들어 주세요"' : '') + '</div>';
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
  // 상세 팝업 (v18 상세 참고): 왼쪽 큰 그림, 오른쪽 역할 · 설명(기준 / 이 모습) · 레퍼런스 · 모습 목록 · 쓰인 샷
  var ROLES = ['주연', '조연', '단역'];
  var descOf = function (o, k) { return k <= 0 ? o.d : (o.sd && o.sd[o.states[k]]) || ''; };
  var isStale = function (o, k) { return k <= 0 ? !!o.dirty : !!(o.stale && o.stale[o.states[k]]); };
  function usedShots(o, i) { return o.isBg ? st.shots.map(function (x, j) { return (x.bg || 0) === i - st.chars.length ? j : -1; }).filter(function (j) { return j >= 0; }) : st.shots.map(function (x, j) { return x.who.indexOf(i) >= 0 ? j : -1; }).filter(function (j) { return j >= 0; }); }
  function detailModal(from) {
    var o = target(), i = st.target, k = o.isBg ? 0 : Math.max(0, Math.min(o.sTab, o.states.length - 1)), noun = o.isBg ? '변형' : '모습';
    var h = stateH(o, k), curK = stIdx(o, k), vname = function (j) { return o.isBg ? '배경' : o.states[j]; };
    var needRe = h && isStale(o, k);
    // 기록: 시계 아이콘을 누르면 이전 그림. 같은 스타일만 불러올 수 있다.
    var hist = o.hist.map(function (x, j) {
      var same = x.style === st.style, on = j === curK;
      return '<li class="' + (on ? 'on' : '') + (same ? '' : ' off') + '">' + thumb(o, x) + '<span>' + (on ? '지금' + (x.from ? ' · ' + esc(x.from) + ' 그림' : '') : same ? (x.from ? esc(x.from) + ' 그림' : x.state ? esc(x.state) : '') : esc(STYLES[x.style][0]) + ' · 다른 스타일') + '</span>' +
        (on ? '' : same ? A('불러오기', 'objLoad', 'sm', ' data-arg="' + j + '"') : A('불러오기', 'objLoad', 'sm', ' disabled title="다른 스타일이라 불러올 수 없어요"')) + '</li>';
    }).reverse().join('');
    var histBtn = '<button class="w-histbtn" data-act="histToggle" aria-expanded="' + !!st.histOpen + '" aria-label="기록 · 이전 그림 불러오기" title="기록 · 이전 그림 불러오기"' + (o.hist.length > 1 ? '' : ' disabled') + '>' +
      '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M3 12a9 9 0 1 0 3-6.7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M3 4v4h4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 7v5l3 2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>' +
      (o.hist.length > 1 ? '<i>' + o.hist.length + '</i>' : '') + '</button>';
    var histPop = st.histOpen && o.hist.length > 1 ? '<div class="w-histpop" role="dialog" aria-label="기록"><div class="w-q-t">기록 <small>같은 스타일(' + esc(STYLES[st.style][0]) + ')만 불러올 수 있어요</small></div><ul class="w-ohist">' + hist + '</ul></div>' : '';
    var genBtn = h ? A('↻ 다시 만들기', 'rgOpen', 'sm' + (needRe ? ' acc' : '')) : A('이미지 생성', 'rgOpen', 'pri sm');
    var view = '<div class="w-adview"><div class="w-advh"><b>' + esc(vname(k)) + '</b>' + (k === 0 && !o.isBg ? '<span class="w-vtag">기준</span>' : '') + (needRe ? '<span class="w-wst warn">바뀜 · 다시 만들어야 반영</span>' : '') + '<span class="w-tbar-sp"></span>' + histBtn + genBtn + '</div>' +
      '<div class="w-adv16">' + thumb(o, h, true) + histPop + '</div>' +
      '<div class="w-advf">' + (k > 0 ? A('← 기준 ' + noun + '으로', 'avar', 'sm', ' data-arg="0"') + (h ? A('이 ' + noun + '을 기준으로 바꾸기', 'vbase', 'sm w-link') : '') : '<span class="w-mut">' + esc(st.ratio) + ' · 표정과 자세가 이 화면 비율로 나와요 · 스타일 ' + esc(STYLES[st.style][0]) + '</span>') + '</div></div>';
    // 설명: 기준 모습 설명과, 다른 모습을 볼 때는 그 모습 설명. ✎로 고치면 바로 저장되고 그림은 "바뀜" 표시만.
    function dbox(kk, cls, title, ph) {
      var editing = st.dEdit === kk, off = cls === 'base' && k > 0;
      return '<div class="w-dbox ' + cls + (off ? ' off' : '') + '"><div class="w-dk">' + title + (off ? '<span class="w-dlock">보기만 가능</span>' : '') + (isStale(o, kk) ? '<span class="w-wst warn">바뀜 · 다시 만들어야 반영돼요</span>' : '') + '<span class="w-tbar-sp"></span>' + (off || editing ? '' : A('✎', 'dEdit', 'sm w-pen', ' data-arg="' + kk + '" aria-label="설명 고치기"')) + '</div>' +
        (editing ? '<textarea class="w-ta sm" rows="3" data-bind="dDraft" placeholder="' + ph + '" aria-label="설명">' + esc(st.dDraft) + '</textarea><div class="w-edrow"><span class="w-mut">' + (stateH(o, kk) ? '적용하면 왼쪽에서 다시 만들 수 있어요' : '적용하면 이 설명대로 만들어요') + '</span>' + A('취소', 'dCancel', 'sm') + A('적용', 'dSave', 'pri sm') + '</div>'
          : '<div class="w-dv">' + esc(descOf(o, kk) || '설명 없음') + '</div>') + '</div>';
    }
    var used = usedShots(o, i);
    var uc = st.useSel != null && used.indexOf(st.useSel) >= 0 ? st.shots[st.useSel] : null;
    var panel = '<div class="w-adr">' +
      (o.isBg ? '' : '<div class="w-rglab">역할</div><div class="w-tabs">' + ROLES.map(function (r, j) { return '<button class="' + ((o.role || (i === 0 ? 0 : 1)) === j ? 'on' : '') + '" data-act="roleSet" data-arg="' + j + '">' + r + '</button>'; }).join('') + '</div>') +
      '<div class="w-rglab">설명</div>' + dbox(0, 'base', '기준 ' + noun + ' · ' + esc(vname(0)), o.isBg ? '예) 흙바닥 · 한낮 햇살' : '예) 20대 후반 · 흰 셔츠 · 피곤한 눈') +
      (k > 0 ? dbox(k, 'var', '바뀐 ' + noun + ' · ' + esc(vname(k)), '예) 비 오는 날 · 젖은 셔츠') : '') +
      '<div class="w-rglab">레퍼런스 이미지 <small class="w-mut">여기서만 올리고 지워요</small></div>' + refStrip(String(i), o.refs) +
      (o.isBg ? '' : '<div class="w-rglab">' + noun + ' 목록 <small class="w-mut">' + o.states.length + '개 · 보기를 누르면 왼쪽에 크게 보여요</small></div><div class="w-vlist">' + o.states.map(function (x, j) {
        var on = j === k, hh = stateH(o, j);
        return '<div class="w-vrow' + (on ? ' on' : '') + '">' + thumb(o, hh) + '<div class="w-vrm"><div class="w-vrn"><b>' + esc(x) + '</b>' + (j === 0 ? '<span class="w-vtag">기준</span>' : '') + (hh ? '' : '<span class="w-wst">이미지 없음</span>') + (j && isStale(o, j) ? '<span class="w-wst warn">설명 바뀜</span>' : '') + '</div><div class="w-vrd">' + esc(descOf(o, j) || '설명 없음') + '</div></div>' +
          '<div class="w-vra">' + (on ? '<span class="w-vview">보는 중</span>' : A('보기', 'avar', 'sm', ' data-arg="' + j + '"')) + (j ? A('삭제', 'vdel', 'sm', ' data-arg="' + j + '"') : '') + '</div></div>';
      }).join('') + '</div>' +
      (st.vadd ? '<div class="w-vaddf"><div class="w-q"><div class="w-q-t">이름</div><input class="w-in" data-bind="vaName" value="' + esc(st.vaName) + '" placeholder="예: 비 맞은 셔츠 · 10년 뒤" aria-label="모습 이름"></div>' +
        '<div class="w-q"><div class="w-q-t">설명</div><input class="w-in" data-bind="vaDesc" value="' + esc(st.vaDesc) + '" placeholder="예: 비에 흠뻑 젖은 흰 셔츠, 머리가 젖어 있다" aria-label="모습 설명"></div>' +
        '<p class="w-note">기준 모습(' + esc(o.states[0]) + ')을 바탕으로 지금 스타일로 만들어요.</p><div class="w-edrow"><span></span>' + A('취소', 'vaddClose', 'sm') + A('추가만', 'vaddDo', 'sm', ' data-arg="0" data-need="vaName"') + A('추가하고 생성', 'vaddDo', 'pri sm', ' data-arg="1" data-need="vaName"') + '</div></div>'
        : A('＋ ' + noun + ' 추가하기', 'vaddOpen', 'sm w-refadd'))) +
      '<div class="w-rglab">쓰인 샷 <small class="w-mut">' + (st.boarded ? '누르면 샷 정보를 볼 수 있어요' : 'Storyboard에서 샷을 나누면 보여요') + '</small></div>' +
      (st.boarded ? (used.length ? '<div class="w-usechips">' + used.map(function (j) { return '<button class="w-chipbtn' + (st.useSel === j ? ' on' : '') + '" data-act="useSel" data-arg="' + j + '">' + shotLabel(j) + '</button>'; }).join('') + '</div>' +
        (uc ? '<div class="w-usecard"><div class="w-fr drawn"><i style="background:' + styleBg(st.style) + '"><em>시작</em></i></div><div><b>' + shotLabel(st.useSel) + '</b> <span class="w-mut">' + uc.len + '초 · ' + esc(st.bgs[uc.bg || 0].n) + '</span><p style="margin:2px 0">' + atText(uc.desc) + '</p><small class="w-mut">' + SHOT_TYPES[uc.size][0] + ' · ' + ANGLES[uc.ang][0] + ' · ' + MOVES[uc.move][0] + '</small><div>' + A('샷 고치러 가기 →', 'goShot', 'pri sm', ' data-arg="' + st.useSel + '"') + '</div></div></div>' : '')
        : '<p class="w-mut" style="margin:0;font-size:12px">아직 어느 샷에도 안 쓰였어요</p>') : '') +
      '</div>';
    var stale = (o.dirty ? [vname(0)] : []).concat(o.isBg ? [] : o.states.filter(function (x, j) { return j && isStale(o, j); }));
    var note = from ? '<p class="w-wrnote">Storyboard에서 연 창이에요. 고치는 건 Artist와 똑같아요. 모습을 한눈에 비교하기는 Artist가 편해요 ' + A('Artist에서 전체 보기 →', 'toArtist', 'sm w-link') + '</p>' : '';
    return modal(o.n + (o.isBg ? ' · 배경' : ' · 인물'), note + '<div class="w-adet">' + view + panel + '</div>',
      (stale.length ? '<span class="w-afnote">바뀐 설명 · <b>' + esc(stale.join(', ')) + '</b> — 다시 만들어야 그림에 반영돼요</span>' : '') +
      A('닫기', 'detailClose') + (stale.length ? A('다시 만들기', 'regenStale', 'pri') : ''), 'xxl');
  }
  function A7() { return A5() + detailModal(false); }
  // 다시 만들기 (v18): 설명 · 바꾸고 싶은 곳 · 기준으로 쓸 이미지 · 생성 도구 · 이전 그림
  var PARTS = ['전체 새로', '얼굴 · 머리', '의상', '표정 · 자세', '색감 · 분위기'];
  function A7r() {
    var o = target(), i = st.target, path = objPath(i), k = o.isBg ? 0 : Math.max(0, o.sTab), h = stateH(o, k), rg = st.rg;
    var groups = TRAITS[o.isBg ? 'bg' : 'char'];
    var traits = '<div class="w-traits">' + groups.map(function (g) {
      return '<div class="w-trait-g"><i>' + g[0] + '</i>' + g[1].map(function (t) {
        var on = o.traits.indexOf(t) >= 0;
        return '<button class="w-chipbtn' + (on ? ' on' : '') + '" data-act="toggleTrait" data-arg="' + esc(t) + '" aria-pressed="' + on + '">' + (on ? '✓ @' : '＋ ') + esc(t) + '</button>';
      }).join('') + '</div>';
    }).join('') + '</div>';
    var all = rg.parts.indexOf(0) >= 0;
    var body = '<p class="w-mut">그냥 새로 뽑는 게 아니라, 무엇을 기준으로 · 어디를 바꿀지 정하고 만들어요. 스타일(' + esc(STYLES[st.style][0]) + ')은 그대로예요.</p>' +
      '<div class="w-q"><div class="w-q-t">설명 <small>이 설명대로 만들어요 · 추천 칩은 @로 들어가요</small></div><textarea class="w-ta sm" rows="3" data-bind="' + path + '.prompt" aria-label="설명">' + esc(o.prompt) + '</textarea></div>' +
      '<div class="w-q w-fold"><button class="w-fold-h" data-act="traitsFold" aria-expanded="' + !!st.traitsOpen + '">' + (st.traitsOpen ? '▾' : '▸') + ' ' + (o.isBg ? '공간의 성격' : '캐릭터성') + ' 추천 <small>누르면 설명에 @로 들어가요</small></button>' + (st.traitsOpen ? traits : '') + '</div>' +
      (h ? '<div class="w-q"><div class="w-q-t">바꾸고 싶은 곳</div><div class="w-opts">' + PARTS.map(function (p, j) { var on = rg.parts.indexOf(j) >= 0; return '<button class="w-opt' + (on ? ' on' : '') + '" data-act="rgPart" data-arg="' + j + '" aria-pressed="' + on + '">' + p + '</button>'; }).join('') + '</div>' +
        '<p class="w-note">' + (all ? '처음부터 새로 만들어요. 생김새도 달라질 수 있어요.' : '고른 곳만 바꾸고, 나머지는 지금 그림을 기준으로 그대로 둬요.') + '</p></div>' : '') +
      '<div class="w-q"><div class="w-q-t">기준으로 쓸 이미지</div><div class="w-rgrefs">' +
        (h ? '<label class="w-rgref"><input type="checkbox" data-act="rgCur"' + (rg.useCur ? ' checked' : '') + '>' + thumb(o, h) + '<span>지금 그림<em>얼굴 · 분위기를 이어가요</em></span></label>' : '') +
        o.refs.map(function (r, j) { var on = rg.refOff.indexOf(j) < 0; return '<label class="w-rgref"><input type="checkbox" data-act="rgRef" data-arg="' + j + '"' + (on ? ' checked' : '') + '><span class="w-ref">' + esc(r.slice(0, 6)) + '</span><span>' + esc(r) + '<em>레퍼런스 이미지</em></span></label>'; }).join('') +
        '<label class="w-ref add" title="레퍼런스 이미지 올리기">＋ 레퍼런스 추가<input type="file" accept="image/*" class="ref-in" data-ref="' + i + '" hidden></label></div></div>' +
      '<div class="w-q"><div class="w-q-t">이미지 생성 도구</div><select data-bind="' + path + '.model" aria-label="이미지 생성 도구">' + MODELS.map(function (m, j) { return '<option value="' + j + '"' + (j == o.model ? ' selected' : '') + '>' + esc(m) + '</option>'; }).join('') + '</select></div>' +
      (st.boarded && usedShots(o, i).length ? '<p class="w-note">이 그림이 쓰이는 샷 ' + usedShots(o, i).length + '개(' + usedShots(o, i).map(shotLabel).join(' · ') + ')에 새 그림이 반영돼요. 러프는 그대로예요.</p>' : '') +
      '<p class="w-note">이전 그림은 기록(시계 아이콘)에 남아요.</p>';
    return (st.stateFrom ? (st.stateFrom === 'S4' ? S4() : S2()) + detailModal(true) : A7()) + modal(o.n + ' · ' + esc(o.isBg ? '배경' : o.states[k]) + (h ? ' 다시 만들까요?' : ' 만들까요?'), body,
      A('취소', 'rgClose') + A(h ? '다시 만들기' : '만들기', 'rgGo', 'acc'), true);
  }
  function A8() { return A5() + busy(target().n + '을(를) ' + (st.regenMode === 'edit' ? '고치고' : '새로 만들고') + ' 있어요'); }
  function R2() { return A5() + rollbackModal('Artist', [['그대로인 것', '바뀌지 않은 인물·배경 그림 (제안 · 개발 확인)'], ['다시 하는 것', '산문 확정 → 브레이크다운 → 새 객체 그림'], ['스타일', esc(STYLES[st.style][0]) + ' 유지']], 'A5'); }
  function A9() {
    return A5() + modal('완료하고 Storyboard로 넘길까요?', list([['넘어가는 것', '확정 산문 · 인물 ' + st.chars.length + ' · 배경 ' + st.bgs.length + ' · 스타일 ' + esc(STYLES[st.style][0]) + ' (v' + st.versions[st.ver].n + ')'], ['다음', 'AI가 씬·샷을 나누고 러프를 그려요'], ['나중에', '인물·배경 목록을 늘리려면 산문으로 롤백해요. 모습 · 그림은 Storyboard에서도, 다시 Artist로 와서도 고칠 수 있어요']]),
      B('아니오', 'A5') + A('예, 완료하기', 'toBoard', 'pri'));
  }

  /* ── Storyboard ── (v18 Writer의 러프 스토리보드 흐름을 Artist 뒤로 옮김: 인물·배경 그림과 스타일은 이미 있다) */
  var scShots = function (n) { return st.shots.map(function (x, i) { return [x, i]; }).filter(function (p) { return p[0].sc === n; }); };
  var scLen = function (n) { return scShots(n).reduce(function (a, p) { return a + p[0].len; }, 0); };
  var sceneName = function (n) { var c = st.scenes[n - 1]; return 'S' + n + ' ' + st.bgs[c.place].n + ' · ' + TIMES[c.time]; };
  // 지문 속 @이름 을 칩으로
  function atText(t) {
    var names = st.chars.map(function (c) { return c.n; }).concat(st.bgs.map(function (b) { return b.n; })).sort(function (a, b) { return b.length - a.length; });
    var out = esc(t); names.forEach(function (n) { out = out.split('@' + esc(n)).join('<span class="w-at">@' + esc(n) + '</span>'); }); return out;
  }
  function whoLabel(s) { return s.who.map(function (c) { var ch = st.chars[c]; if (!ch) return ''; var k = s.ws[c] || 0; return ch.n + (k ? '(' + ch.states[k] + ')' : ''); }).join(' · '); }
  // 드롭다운(코드 + 설명). 열면 목록에 설명이 같이 보이고, 고른 것에 ✓
  function dd(path, items, cur, label) {
    var open = st.ddOpen === path, it = items[cur] || items[0];
    return '<div class="w-dd' + (open ? ' open' : '') + '"><button class="w-dd-b" data-act="ddOpen" data-arg="' + path + '" aria-haspopup="listbox" aria-expanded="' + open + '" aria-label="' + esc(label || '') + '">' +
      (it[2] ? '<i class="w-sw" style="background:' + it[2] + '"></i>' : '') + '<b>' + esc(it[0]) + '</b><span class="w-tbar-sp"></span><span aria-hidden="true">▾</span></button>' +
      (open ? '<div class="w-dd-l" role="listbox">' + items.map(function (x, j) {
        return '<button role="option" aria-selected="' + (j === cur) + '" class="' + (j === cur ? 'on' : '') + '" data-act="ddPick" data-arg="' + path + '~' + j + '">' + (x[2] ? '<i class="w-sw" style="background:' + x[2] + '"></i>' : '') + '<b>' + esc(x[0]) + '</b><small>· ' + esc(x[1]) + '</small>' + (j === cur ? '<em>✓</em>' : '') + '</button>';
      }).join('') + '</div>' : '') + '</div><small class="w-dd-d">' + esc(it[1]) + '</small>';
  }
  // 조명 미리보기: 얼굴 모양 위에 빛의 방향 · 색 · 밝기를 그려서 보여준다
  function lightPreview(l, small) {
    var c = LIGHT_TEMP[l.temp][2], b = l.bri / 100, id = 'lp' + (small ? 's' : '') + l.pos + l.temp + l.bri;
    var cx = [50, 18, 82, 50, 50, 50][l.pos], cy = [45, 45, 45, 50, 12, 90][l.pos], back = l.pos === 3;
    var bg = 'rgb(' + Math.round(30 + 60 * b) + ',' + Math.round(32 + 58 * b) + ',' + Math.round(40 + 60 * b) + ')';
    return '<svg class="w-lp' + (small ? ' sm' : '') + '" viewBox="0 0 100 100" aria-label="조명 미리보기: ' + esc(LIGHT_POS[l.pos][0] + ' · ' + LIGHT_TEMP[l.temp][0]) + '" role="img"><defs><radialGradient id="' + id + '" cx="' + cx + '%" cy="' + cy + '%" r="' + (back ? 75 : 70) + '%"><stop offset="0" stop-color="' + c + '" stop-opacity="' + (back ? 0.15 : 0.35 + 0.65 * b) + '"/><stop offset="1" stop-color="#1b1d24" stop-opacity="' + (0.95 - 0.35 * b) + '"/></radialGradient></defs>' +
      '<rect width="100" height="100" fill="' + bg + '"/><ellipse cx="50" cy="52" rx="26" ry="32" fill="#8a8f9c"/>' + (back ? '<ellipse cx="50" cy="52" rx="28" ry="34" fill="none" stroke="' + c + '" stroke-width="3" opacity="' + (0.5 + 0.5 * b) + '"/>' : '') +
      '<ellipse cx="50" cy="52" rx="26" ry="32" fill="url(#' + id + ')"/><circle cx="41" cy="47" r="2.5" fill="#222"/><circle cx="59" cy="47" r="2.5" fill="#222"/><path d="M42 66 q8 5 16 0" stroke="#222" stroke-width="2" fill="none"/></svg>';
  }
  function lightBox(path, l) {
    return '<div class="w-light"><div class="w-light-pv">' + lightPreview(l) + '<small>' + esc(LIGHT_TEMP[l.temp][1].split(':')[0]) + '</small></div><div class="w-light-f">' +
      '<div class="w-q"><div class="w-q-t">조명 위치</div>' + dd(path + '.pos', LIGHT_POS, l.pos, '조명 위치') + '</div>' +
      '<div class="w-q"><div class="w-q-t">색온도 <small>숫자가 낮을수록 따뜻한 주황, 높을수록 차가운 파랑</small></div>' + dd(path + '.temp', LIGHT_TEMP, l.temp, '색온도') + '<div class="w-tempbar" aria-hidden="true">' + LIGHT_TEMP.map(function (x, j) { return '<i class="' + (j === l.temp ? 'on' : '') + '" style="background:' + x[2] + '"></i>'; }).join('') + '</div></div>' +
      '<div class="w-q"><div class="w-q-t">밝기 <small>' + l.bri + '</small></div><input type="range" min="0" max="100" step="5" value="' + l.bri + '" data-bind="' + path + '.bri" data-num="1" aria-label="밝기"></div></div></div>';
  }
  // 러프 한 장 (k: 0 시작, 1 연출). 다시 그릴 때마다 rv가 올라 그림이 달라 보인다.
  function frameImg(s, i, k, big) {
    var who = s.who.length && st.chars[s.who[0]] ? st.chars[s.who[0]].n : st.bgs[s.bg || 0].n;
    return '<i class="w-frm' + (big ? ' big' : '') + '" style="background:' + styleBg(st.style) + ';filter:hue-rotate(' + ((i * 37 + k * 50 + (s.rv || 0) * 29) % 140) + 'deg)"><b>' + esc(big ? who : who.slice(0, 2)) + '</b><em>' + (k ? '연출' : '시작') + (big && s.rv ? ' · v' + (s.rv + 1) : '') + '</em></i>';
  }
  function sbShot(s, i) {
    var badge = !s.drawn ? '<span class="w-tag-no">새로 추가 · 스케치 전</span>' : '';
    var fr = s.drawn ? '<div class="w-fr drawn">' + frameImg(s, i, 0) + frameImg(s, i, 1) + '</div>' : '<div class="w-fr none"><span>스케치 전</span></div>';
    var menu = st.sbMenu === i ? '<div class="w-sbmenu" role="menu">' + A('← 앞으로', 'shotMove', 'sm', ' data-arg="' + i + ':-1"') + A('뒤로 →', 'shotMove', 'sm', ' data-arg="' + i + ':1"') + A('복제', 'shotDup', 'sm', ' data-arg="' + i + '"') + A('삭제', 'shotDel', 'sm warn', ' data-arg="' + i + '"') + '</div>' : '';
    var L = s.light || { pos: 0, temp: 3, bri: 50 };
    return '<div class="w-shot' + (s.fresh ? ' is-new' : '') + (s.chg ? ' chg' : '') + '" data-act="editShot" data-arg="' + i + '" role="button" tabindex="0" aria-label="' + shotLabel(i) + ' 고치기"><div class="w-shot-c"><b>' + shotLabel(i) + '</b><span>' + s.len + '초</span>' + badge + '</div>' + fr +
      '<small class="w-dl">' + atText(s.desc) + '</small>' +
      (s.lines.length ? '<small class="w-dl">' + esc(st.chars[s.lines[0].w] ? st.chars[s.lines[0].w].n : '') + ' "' + esc(s.lines[0].t) + '"' + (s.lines.length > 1 ? ' …' : '') + '</small>' : '') +
      '<div class="w-chips"><span title="' + esc(SHOT_TYPES[s.size][1]) + '">' + SHOT_TYPES[s.size][0] + '</span><span>' + ANGLES[s.ang][0] + '</span><span>' + MOVES[s.move][0] + '</span><span title="조명 · ' + esc(LIGHT_POS[L.pos][0] + ' · ' + LIGHT_TEMP[L.temp][1]) + '"><i class="w-sw" style="background:' + LIGHT_TEMP[L.temp][2] + '"></i>' + LIGHT_TEMP[L.temp][0] + '</span>' + (s.dir ? '<span>연출 · ' + esc(s.dir) + '</span>' : '') + '</div>' +
      (      '<div class="w-card-acts">' + (s.drawn ? '' : A('스케치 그리기', 'redraw', 'pri sm', ' data-arg="' + i + '"')) + '<span class="w-tbar-sp"></span>' + A('⋯', 'shotMenu', 'sm', ' data-arg="' + i + '" aria-label="더 보기"') + '</div>') + menu + '</div>';
  }
  function S1(o) {
    o = o || {};
    var undrawn = st.shots.filter(function (x) { return !x.drawn; }).length;
    // 러닝타임은 지표: 샷을 고치거나 더할 때 같이 바뀌는 숫자만 작게 보여준다
    var main = '<div class="w-title"><h3>Storyboard <small class="w-tbd">이름 미정</small></h3><span class="w-rtmini" title="러닝타임 · 샷 길이의 합">씬 ' + st.scenes.length + ' · 샷 ' + st.shots.length + ' · <b>' + total() + '초</b></span><span class="w-tbar-sp"></span>' + B('다음: Director로 →', 'S7', 'pri') + '</div>' +
      '<div class="w-tools"><span class="w-tabs">' + [['rough', '러프'], ['script', '대본']].map(function (v) { return '<button class="' + (st.sbView === v[0] ? 'on' : '') + '" data-act="sbView" data-arg="' + v[0] + '" aria-pressed="' + (st.sbView === v[0]) + '">' + v[1] + '</button>'; }).join('') + '</span>' +
        B('＋ 씬 추가', 'S8', 'sm') + A('＋ 샷 추가', 'newShot', 'sm') + (undrawn ? A('스케치 없는 ' + undrawn + '컷 그리기', 'drawAll', 'sm pri') : '') + '<span class="w-tbar-sp"></span>' +
        '<button class="w-btn sm w-dl-ic" data-go="SM" title="마스터 시트 다운로드" aria-label="마스터 시트 다운로드"' + (st.shots.some(function (x) { return x.drawn; }) ? '' : ' disabled') + '><svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M12 4v11m0 0l-4.5-4.5M12 15l4.5-4.5M5 19h14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></button>' +
        '</div>' +
      st.scenes.map(function (c, k) {
        var n = k + 1, list = scShots(n);
        var body = !list.length ? '<p class="w-mut w-sc-empty">샷이 없어요. ' + A('＋ 샷', 'newShot', 'sm', ' data-arg="' + n + ':0"') + '</p>' : st.sbView === 'rough'
          ? '<div class="w-shots">' + list.map(function (p) { return sbShot(p[0], p[1]); }).join('') + '</div>'
          : '<ol class="w-script">' + list.map(function (p) { var x = p[0], i = p[1]; return '<li><b>' + shotLabel(i) + '</b><span class="w-mut">' + x.len + '초 · ' + SHOT_TYPES[x.size][0] + ' · ' + ANGLES[x.ang][0] + ' · ' + MOVES[x.move][0] + ' · ' + LIGHT_TEMP[(x.light || { temp: 3 }).temp][0] + '</span><p>' + atText(x.desc) + (x.dir ? ' <i class="w-mut">— ' + esc(x.dir) + '</i>' : '') + '</p>' +
              x.lines.map(function (l) { return '<p class="w-dl">' + esc(st.chars[l.w] ? st.chars[l.w].n : '') + ': "' + esc(l.t) + '"</p>'; }).join('') + A('✎', 'editShot', 'sm', ' data-arg="' + i + '" aria-label="고치기"') + '</li>'; }).join('') + '</ol>';
        return '<section class="w-sc"><div class="w-sc-h"><b>' + esc(sceneName(n)) + '</b><span class="w-mut">' + esc(c.sum) + ' · ' + list.length + '컷 · ' + scLen(n) + '초</span><span class="w-tbar-sp"></span>' + A('＋ 샷', 'newShot', 'sm', ' data-arg="' + n + ':' + list.length + '"') + '</div>' + body + '</section>';
      }).join('');
    var guide = chatCard('말로 고쳐도 돼요', '<p style="margin:0">카드를 누르면 직접 고칠 수 있고, 저에게 말해도 돼요. 바꾼 곳은 노랗게 보여 드리고 [적용]하기 전엔 그대로예요.</p><div class="w-qr col">' +
      ['S1-2를 클로즈업으로', 'S2 조명을 따뜻하게', 'S1-1 다음에 민호가 한숨 쉬는 샷 추가해 줘', 'S2-1을 로우 앵글로, 5초'].map(function (x) { return A('“' + x + '”', 'send', 'sm', ' data-arg="' + esc(x) + '"'); }).join('') + '</div>', 'Storyboard');
    return studio('Storyboard', main, { card: o.card || (st.sbChange ? '' : guide), ph: '예: S1-2를 클로즈업으로, 조명은 따뜻하게' });
  }
  function S0() { return S1() + busy('씬·샷을 나누고 러프를 그리고 있어요', ['산문 읽기', '씬 ' + st.scenes.length + '개로 나누기 · 인물 · 배경 배치', '카메라 자리 · 샷 ' + st.shots.length + '개', '샷 크기 · 앵글 · 무브먼트', '러프 스케치 그리기']); }
  // 채팅으로 고치기 (목업): "S1-2를 클로즈업으로", "S2 조명 따뜻하게", "S1-1 다음에 … 샷 추가해 줘", "S2-1 로우 앵글, 5초"
  function sbAgent(t) {
    var before = clone(st.shots), notes = [], m2 = t.match(/S(\d+)\s*-\s*(\d+)/), m1 = !m2 && t.match(/S(\d+)/);
    var idxs = m2 ? scShots(+m2[1]).filter(function (p, j) { return j === +m2[2] - 1; }).map(function (p) { return p[1]; })
      : m1 ? scShots(+m1[1]).map(function (p) { return p[1]; }) : /전체|모든|다/.test(t) ? st.shots.map(function (x, i) { return i; }) : [st.shotSel || 0];
    var where = m2 ? 'S' + m2[1] + '-' + m2[2] : m1 ? 'S' + m1[1] + ' 전체' : idxs.length > 1 ? '모든 샷' : shotLabel(idxs[0]);
    if (/추가|넣어/.test(t)) {
      var sc = m2 ? +m2[1] : m1 ? +m1[1] : st.shots[st.shots.length - 1].sc, after = m2 ? +m2[2] : scShots(sc).length;
      var desc = t.replace(/S\d+(\s*-\s*\d+)?\s*(다음에|뒤에|에)?/, '').replace(/(샷\s*)?(하나\s*)?(추가|넣어)\s*(해\s*줘|해주세요|해)?/, '').trim() || '새 샷';
      var who = []; st.chars.forEach(function (c, k) { if (desc.indexOf(c.n) >= 0) { who.push(k); desc = desc.replace(c.n, '@' + c.n); } });
      var ns = { sc: sc, len: 2, size: 3, ang: 0, move: 0, dir: '', desc: desc, who: who, ws: {}, bg: st.scenes[sc - 1].place, lines: [], drawn: true, fresh: true, chg: true, light: { pos: 0, temp: 3, bri: 50 } };
      var list = scShots(sc), idx = after < list.length ? list[after][1] : list.length ? list[list.length - 1][1] + 1 : st.shots.length;
      st.shots.splice(idx, 0, ns); st.sbChange = { before: before, note: (after ? 'S' + sc + '-' + after + ' 다음에' : 'S' + sc + ' 맨 앞에') + ' 샷을 넣고 러프를 그렸어요: "' + desc.replace(/@/g, '') + '" (MS · 2초).' };
      return 'SG';
    }
    var kw = function (map) { var hit = null; map.forEach(function (p) { if (hit == null && p[0].test(t)) hit = p[1]; }); return hit; };
    var size = kw([[/익스트림 클로즈업|ECU/i, 0], [/미디엄 클로즈업|MCU/i, 2], [/클로즈업|CU\b|가까이/i, 1], [/미디엄 풀|MFS/i, 4], [/미디엄|MS\b/i, 3], [/풀\s*샷|전신|FS\b/i, 5], [/익스트림 와이드|EWS/i, 7], [/와이드|넓게|WS\b/i, 6], [/어깨|OTS/i, 8], [/시점|POV/i, 9], [/투\s*샷|2S/i, 11]]);
    var ang = kw([[/로우|올려다/, 2], [/하이|내려다/, 1], [/버드|위에서 수직/, 3], [/웜즈|바닥에서/, 4], [/더치|기울/, 5], [/아이\s*레벨|눈높이/, 0]]);
    var move = kw([[/핸드헬드|흔들/, 6], [/따라|트래킹/, 5], [/다가|달리 인|줌 인/, 3], [/멀어|달리 아웃/, 4], [/팬/, 1], [/틸트/, 2], [/고정/, 0]]);
    var temp = kw([[/촛불|아주 따뜻/, 0], [/따뜻|노을|주황/, 1], [/차갑|푸른|파랗/, 5], [/흐린/, 4], [/한낮|햇빛|주광/, 3]]);
    var pos = kw([[/역광|실루엣/, 3], [/왼쪽/, 1], [/오른쪽/, 2], [/아래에서|무섭/, 5], [/위에서 (빛|조명)/, 4], [/정면/, 0]]);
    var bri = kw([[/어둡|어둑|밤/, 25], [/밝게|환하/, 80]]);
    var secM = t.match(/(\d+)\s*초/), sec = secM ? Math.max(1, Math.min(30, +secM[1])) : /빠르|짧게/.test(t) ? -1 : /느리|길게/.test(t) ? 1 : null;
    idxs.forEach(function (i) {
      var x = st.shots[i]; if (!x) return; x.light = x.light || { pos: 0, temp: 3, bri: 50 };
      if (size != null) x.size = size; if (ang != null) x.ang = ang; if (move != null) x.move = move;
      if (temp != null) x.light.temp = temp; if (pos != null) x.light.pos = pos; if (bri != null) x.light.bri = bri;
      if (sec != null) x.len = Math.abs(sec) === 1 && !secM ? Math.max(1, x.len + sec) : sec;
      x.chg = true;
    });
    if (size != null) notes.push('샷 타입 ' + SHOT_TYPES[size][0]); if (ang != null) notes.push('앵글 ' + ANGLES[ang][0]); if (move != null) notes.push('무브먼트 ' + MOVES[move][0]);
    if (temp != null) notes.push('색온도 ' + LIGHT_TEMP[temp][0] + '(' + LIGHT_TEMP[temp][1].split(':')[0] + ')'); if (pos != null) notes.push('조명 ' + LIGHT_POS[pos][0]); if (bri != null) notes.push('밝기 ' + bri);
    if (sec != null) notes.push(secM ? '길이 ' + sec + '초' : sec < 0 ? '길이 1초씩 짧게' : '길이 1초씩 길게');
    if (!notes.length) { idxs.forEach(function (i) { st.shots[i].dir = t; }); notes.push('연출 "' + t + '"'); }
    st.sbChange = { before: before, note: where + ': ' + notes.join(' · ') + '. 적용하면 러프를 다시 그려요. (지금 ' + total() + '초)' };
    return 'SG';
  }
  // 에이전트가 바꾼 샷은 노랗게 표시되고, 적용 / 되돌리기 전에는 다른 요청을 받지 않는다
  function SG() {
    var c = st.sbChange || { note: '' };
    return S1({ card: chatCard('이렇게 바꿨어요. 적용할까요?', '<p style="margin:0">' + esc(c.note) + '</p><p class="w-note">노랗게 표시된 샷이 바뀐 곳이에요.</p><div class="w-card-acts">' + A('되돌리기', 'sbUndo', 'sm') + A('적용', 'sbApply', 'pri sm') + '</div>', 'Storyboard') });
  }
  // 샷 고치기: 두 묶음. 시작을 고치면 연출도 따라 바뀌고, 연출을 고치면 연출만 바뀐다.
  function castFields(d) {
    return '<div class="w-q"><div class="w-q-t">등장인물 <small>Artist 목록에서만 · 모습을 고를 수 있어요</small></div><div class="w-whos">' + st.chars.map(function (c, k) {
        var on = d.who.indexOf(k) >= 0;
        return '<span class="w-who' + (on ? ' on' : '') + '"><button class="w-chipbtn' + (on ? ' on' : '') + '" data-act="shotWho" data-arg="' + k + '" aria-pressed="' + on + '">' + (on ? '✓ ' : '＋ ') + esc(c.n) + '</button>' +
          (on ? '<select data-act-change="shotWs" data-arg="' + k + '" aria-label="' + esc(c.n) + ' 모습">' + c.states.map(function (x, j) { return '<option value="' + j + '"' + ((d.ws[k] || 0) === j ? ' selected' : '') + '>' + esc(x) + '</option>'; }).join('') + '<option value="new">＋ 새 모습…</option></select>' : '') + '</span>';
      }).join('') + '</div></div>' +
      '<div class="w-q"><div class="w-q-t">배경</div>' + opts('shotDraft.bg', st.bgs.map(function (b) { return b.n; }), d.bg || 0) + '</div>';
  }
  function linesField(d) {
    return '<div class="w-q"><div class="w-q-t">대사 <small>직접 쓴 대사는 그대로 보존돼요 · 언어는 사이트 언어를 따라요</small></div>' + d.lines.map(function (l, i) {
      return '<div class="w-line"><select data-bind="shotDraft.lines.' + i + '.w" aria-label="누가">' + st.chars.map(function (c, k) { return '<option value="' + k + '"' + (k == l.w ? ' selected' : '') + '>' + esc(c.n) + '</option>'; }).join('') + '</select>' +
        '<input class="w-in" data-bind="shotDraft.lines.' + i + '.t" value="' + esc(l.t) + '" aria-label="대사">' +
        '<button class="w-x" data-act="delLine" data-arg="' + i + '" aria-label="대사 지우기">×</button></div>';
    }).join('') + A('＋ 대사', 'addLine', 'sm') + '</div>';
  }
  var lenItems = function () { return LENS.map(function (x) { return [x + '초', x <= 2 ? '아주 짧게: 인서트 · 리액션' : x <= 5 ? '보통 길이' : x <= 10 ? '길게: 대사 · 동작이 이어질 때' : '아주 길게: 롱테이크']; }); };
  var agentHint = '<p class="w-agent-hint">✦ 말로 해도 돼요: 에이전트에게 “' + '이 샷 클로즈업으로, 조명은 따뜻하게' + '”라고 하면 바꿔 드려요.</p>';
  function shotEditor() {
    var d = st.shotDraft, tab = st.shotTab; if (!d.light) d.light = { pos: 0, temp: 3, bri: 50 };
    var strip = '<div class="w-2grp"><button class="' + (tab === 'start' ? 'on' : '') + '" data-act="shotTab" data-arg="start"><b>시작 고치기</b><small>스토리 · 인물 · 배경 · 대사 · 샷 타입 · 앵글 · 조명</small></button><i>→ 따라 바뀜</i>' +
      '<button class="' + (tab === 'dir' ? 'on' : '') + '" data-act="shotTab" data-arg="dir"><b>연출 고치기</b><small>카메라 무브먼트 · 방향 · 액션 · 길이</small></button></div>';
    if (tab === 'start') return strip +
      '<div class="w-q"><div class="w-q-t">스토리 (액션) <small>@로 인물 · 배경 불러오기</small></div><textarea class="w-ta sm" rows="2" data-bind="shotDraft.desc" placeholder="이 샷에서 일어나는 일" aria-label="스토리">' + esc(d.desc) + '</textarea></div>' +
      castFields(d) + linesField(d) +
      '<div class="w-grid2"><div class="w-q"><div class="w-q-t">샷 타입 (카메라 초점)</div>' + dd('shotDraft.size', SHOT_TYPES, d.size, '샷 타입') + '</div><div class="w-q"><div class="w-q-t">카메라 앵글</div>' + dd('shotDraft.ang', ANGLES, d.ang, '카메라 앵글') + '</div></div>' +
      '<div class="w-q"><div class="w-q-t">조명</div>' + lightBox('shotDraft.light', d.light) + '</div>' +
      '<p class="w-note">적용하면 시작이 바뀌고, 연출도 이어서 다시 그려요.</p>' + agentHint;
    return strip + '<div class="w-tabs w-dmode">' + [['opt', '옵션 + 텍스트'], ['draw', '그리기 + 텍스트']].map(function (m) { return '<button class="' + (st.dirMode === m[0] ? 'on' : '') + '" data-act="dirMode" data-arg="' + m[0] + '">' + m[1] + '</button>'; }).join('') + '</div>' +
      (st.dirMode === 'draw' ? '<div class="w-drawpad"><span>시작 그림 위에 ↗ 화살표 · ✎ 메모를 그려요 (목업)</span><small>테두리에서 시작한 화살표는 카메라 무브, 안쪽은 사물 · 인물 움직임으로 읽어요. 글로 고치면 글이 우선이에요.</small></div>' :
        '<div class="w-q"><div class="w-q-t">카메라 무브먼트</div>' + dd('shotDraft.move', MOVES, d.move, '카메라 무브먼트') + '</div>') +
      '<div class="w-q"><div class="w-q-t">방향 · 사물 · 인물 액션 <small>안 써도 돼요</small></div><input class="w-in" data-bind="shotDraft.dir" value="' + esc(d.dir) + '" placeholder="예: 천천히 다가가며 캔이 굴러간다" aria-label="방향 · 액션"></div>' +
      '<div class="w-q"><div class="w-q-t">길이</div>' + dd('shotDraft.lenI', lenItems(), d.lenI != null ? +d.lenI : d.len - 1, '길이') + '</div>' +
      '<p class="w-note">앵글은 시작에서 정해요. 적용하면 연출만 다시 그려요.</p>' + agentHint;
  }
  function S2() {
    if (!st.shotDraft) st.shotDraft = clone(st.shots[st.shotSel]);
    var tab = st.shotTab;
    var x = st.shots[st.shotSel], f = st.sbFrame || 0;
    // 왼쪽: 지금 러프를 크게 (시작 / 연출). 고친 내용은 적용해서 다시 그린 뒤 확인 팝업에서 본다.
    var view = '<div class="w-adview"><div class="w-advh"><b>' + shotLabel(st.shotSel) + '</b><span class="w-mut">' + x.len + '초 · ' + SHOT_TYPES[x.size][0] + ' · ' + ANGLES[x.ang][0] + '</span><span class="w-tbar-sp"></span><span class="w-tabs">' +
        ['시작', '연출'].map(function (n, k) { return '<button class="' + (f === k ? 'on' : '') + '" data-act="sbFrame" data-arg="' + k + '" aria-pressed="' + (f === k) + '">' + n + '</button>'; }).join('') + '</span></div>' +
      '<div class="w-adv16 w-sbv">' + (x.drawn ? frameImg(x, st.shotSel, f, true) : '<span class="w-mut">스케치 전</span>') + '</div>' +
      '<div class="w-sbthumbs">' + [0, 1].map(function (k) { return '<button class="' + (f === k ? 'on' : '') + '" data-act="sbFrame" data-arg="' + k + '" aria-label="' + (k ? '연출' : '시작') + ' 크게 보기">' + (x.drawn ? frameImg(x, st.shotSel, k) : '') + '</button>'; }).join('') + '</div>' +
      '<p class="w-mut" style="margin:0;font-size:12px">' + atText(x.desc) + '</p></div>';
    return S1() + modal(shotLabel(st.shotSel) + ' 고치기', '<p class="w-mut">두 묶음으로 고쳐요 · 시작을 고치면 연출도 따라 바뀌고, 연출을 고치면 연출만 바뀌어요. 적용하면 다시 그린 그림을 먼저 보여 드려요.</p><div class="w-adet">' + view + '<div class="w-adr">' + shotEditor() + '</div></div>',
      A('취소', 'cancelShot') + A(tab === 'start' ? '시작 적용 · 연출도 다시' : '연출 적용 · 다시 그리기', 'applyShot', 'acc'), 'xxl');
  }
  function S3() { return S1() + busy('러프를 그리고 있어요'); }
  // 다시 그린 러프 확인: 이전 → 새로를 크게 보고 [적용] / [되돌리기] / [다시 고치기]
  function S3c() {
    var cs = st.cands || [];
    var body = '<p class="w-mut">적용하기 전에 새 러프를 확인해 주세요. 되돌리면 이전 그림과 값으로 돌아가요.</p>' + cs.map(function (c) {
      var x = st.shots[c.i];
      return '<div class="w-cmp"><div class="w-cmp-h"><b>' + shotLabel(c.i) + '</b><span class="w-mut">' + esc(c.what) + '</span></div><div class="w-cmp-row">' +
        '<div><small>이전</small><div class="w-cmp-f">' + frameImg(c.prev, c.i, 0, true) + frameImg(c.prev, c.i, 1, true) + '</div></div><span class="w-cmp-ar" aria-hidden="true">→</span>' +
        '<div><small class="w-new-t">새로</small><div class="w-cmp-f">' + frameImg(x, c.i, 0, true) + frameImg(x, c.i, 1, true) + '</div></div></div></div>';
    }).join('');
    return S1() + modal(cs.length > 1 ? '새 러프 ' + cs.length + '컷을 확인해 주세요' : '새 러프를 확인해 주세요', body,
      A('되돌리기', 'candUndo') + (cs.length === 1 ? A('다시 고치기', 'candEdit') : '') + A('적용', 'candOk', 'acc'), 'xxl');
  }
  // 샷 추가 (기존 화면 참고): 왼쪽에서 넣을 자리를 고르고(사이사이 어디든), 오른쪽에서 내용을 정한다
  function S4() {
    if (!st.shotDraft) ACTS.newShot('');
    var d = st.shotDraft, at = st.addAt;
    var left = st.scenes.map(function (c, k) {
      var n = k + 1, list = scShots(n);
      var slot = function (pos) { var on = at && at.sc === n && at.k === pos; return '<button class="w-slot' + (on ? ' on' : '') + '" data-act="addAt" data-arg="' + n + ':' + pos + '">' + (on ? '✓ 여기에 추가돼요' : '＋ 이곳에 추가하기') + '</button>'; };
      return '<div class="w-apos-sc"><b>Scene ' + n + '</b><span>' + esc(c.sum) + '</span></div>' + slot(0) + list.map(function (p, j) { return '<div class="w-apos-sh"><b>Shot ' + (j + 1) + '</b><span>' + esc(p[0].desc.replace(/@/g, '')) + '</span></div>' + slot(j + 1); }).join('');
    }).join('');
    var where = at ? (at.k === 0 ? 'S' + at.sc + ' 맨 앞' : 'S' + at.sc + '-' + at.k + ' 다음') : '';
    var right = '<div class="w-rglab">내용 설정</div>' +
      '<div class="w-grid2"><div class="w-q"><div class="w-q-t">샷 타입 (카메라 초점)</div>' + dd('shotDraft.size', SHOT_TYPES, d.size, '샷 타입') + '</div><div class="w-q"><div class="w-q-t">길이</div>' + dd('shotDraft.lenI', lenItems(), d.lenI != null ? +d.lenI : d.len - 1, '길이') + '</div></div>' +
      '<div class="w-q"><div class="w-q-t">스토리 (액션)</div><textarea class="w-ta sm" rows="3" data-bind="shotDraft.desc" placeholder="이 샷에서 일어나는 일 · @로 인물 · 배경" aria-label="스토리">' + esc(d.desc) + '</textarea><small class="w-mut">러프 · 영상 만들기의 바탕이 되는 문장이에요.</small></div>' +
      castFields(d) +
      '<div class="w-box"><div class="w-rglab">연출</div><div class="w-grid2"><div class="w-q"><div class="w-q-t">카메라 앵글</div>' + dd('shotDraft.ang', ANGLES, d.ang, '카메라 앵글') + '</div><div class="w-q"><div class="w-q-t">카메라 무브먼트</div>' + dd('shotDraft.move', MOVES, d.move, '카메라 무브먼트') + '</div></div>' +
        '<div class="w-q"><div class="w-q-t">조명</div>' + lightBox('shotDraft.light', d.light) + '</div></div>' +
      B('목록에 없는 인물 · 배경이 필요해요', 'R3', 'w-link') + agentHint.replace('이 샷 클로즈업으로, 조명은 따뜻하게', 'S1-1 다음에 민호가 한숨 쉬는 샷 추가해 줘');
    return S1() + modal('＋ 샷 추가', '<p class="w-mut">왼쪽에서 추가할 위치를 고르고(초록 표시), 오른쪽에서 내용을 설정하세요.</p><div class="w-addshot"><div class="w-apos"><div class="w-rglab">어디에 추가할까요</div>' + left + '</div><div class="w-acont">' + right + '</div></div>',
      '<span class="w-afnote">' + (where ? where + '에 추가돼요.' : '왼쪽에서 추가할 위치를 골라주세요.') + '</span>' + A('취소', 'cancelShot') + A('＋ 샷 추가', 'addShot', 'acc', at ? ' data-need="shotDraft.desc"' : ' disabled'), 'xxl');
  }
  function R3() { return S1() + rollbackModal('Storyboard', [['영향받는 것', '샷 ' + st.shots.length + ' · 러프 (개발 확인: 바뀌지 않은 샷 유지 여부)'], ['그대로인 것', '🔒 화면 비율 · 🔒 스타일 · 인물·배경 그림'], ['예상 크레딧', '표시 자리']], 'S4'); }
  // 모습 추가: Artist 상세 팝업을 그대로 연다(모습 추가하기 펼친 채). Artist의 모습 추가와 같은 일이다.
  function S5() { return (st.stateFrom === 'S4' ? S4() : S2()) + detailModal(true); }
  function S6() { return (st.stateFrom === 'S4' ? S4() : st.stateFrom === 'S2' ? S2() : S1()) + busy('그림을 만들고 있어요'); }
  function S8() {
    var a = st.scAdd, where = st.scenes.map(function (c, k) { return k === 0 ? '맨 앞 · S1 앞' : 'S' + k + '와 S' + (k + 1) + ' 사이'; }).concat(['S' + st.scenes.length + ' 다음 · 맨 끝']);
    return S1() + modal('씬 추가', '<div class="w-q"><div class="w-q-t">장소 <small>Artist 배경 목록에서만</small></div>' + opts('scAdd.place', st.bgs.map(function (b) { return b.n; }), a.place) + '</div>' +
      '<div class="w-q"><div class="w-q-t">시간대</div>' + opts('scAdd.time', TIMES, a.time) + '</div>' +
      '<div class="w-q"><div class="w-q-t">한 줄 요약</div><input class="w-in" data-bind="scAdd.sum" value="' + esc(a.sum) + '" placeholder="예: 다음 날 아침, 고쳐진 자판기" aria-label="한 줄 요약"></div>' +
      '<div class="w-q"><div class="w-q-t">어디에 넣을까요</div>' + opts('scAdd.pos', where, a.pos) + '</div>' +
      '<p class="w-note">새 씬은 샷 0개로 시작해요. 뒤 씬 번호는 하나씩 밀려요. 목록에 없는 장소는 산문을 고쳐야 해요.</p>',
      B('취소', 'S1') + A('S' + (a.pos + 1) + '로 추가', 'addScene', 'acc'), true);
  }
  function SM() {
    var undrawn = st.shots.filter(function (x) { return !x.drawn; }).length;
    return S1() + modal('마스터 시트 내보내기', '<p class="w-mut">러프 스토리보드를 촬영용 시트로 정리해요. 컷마다 그림 · 촬영 · 액션 · 대사 · 시간이 들어가요.</p>' +
      '<div class="w-q"><div class="w-q-t">범위</div>' + opts('sheet.range', ['전체', '씬 고르기'], st.sheet.range) + '</div>' +
      '<div class="w-q"><div class="w-q-t">그림</div>' + opts('sheet.pic', ['시작 → 끝', '시작만'], st.sheet.pic) + '</div>' +
      '<div class="w-q"><div class="w-q-t">한 장에</div>' + opts('sheet.per', ['4컷', '6컷'], st.sheet.per) + '</div>' +
      (undrawn ? '<p class="w-warn-t">러프가 없는 컷 ' + undrawn + '개는 빈칸으로 들어가요.</p>' : ''),
      B('닫기', 'S1') + (undrawn ? A('남은 컷 그리기', 'drawAll', '') : '') + A('PDF로 다운로드', 'printSheet', 'acc'), true);
  }
  function S7() {
    var undrawn = st.shots.filter(function (x) { return !x.drawn; }), ok = st.shots.length - undrawn.length;
    return S1() + modal('Director로 넘길까요?', list([['넘어가는 것', '샷 ' + ok + ' · 러프 · 인물 · 배경 그림'], ['러닝타임', total() + '초'], ['다음', 'Director가 러프와 Artist 그림을 참조해 컷을 만들어요']]) +
      (undrawn.length ? '<p class="w-warn-t">러프가 없는 ' + undrawn.map(function (x) { return shotLabel(st.shots.indexOf(x)); }).join(', ') + '은(는) 이번에 빠져요.</p>' : ''),
      B('아니오', 'S1') + (undrawn.length ? A('남은 컷 그리기', 'drawAll', '') : '') + B('예, 넘기기', 'D1', 'pri'));
  }
  function D1() {
    return bar('Director') + '<div class="w-entry"><h3>Director → Editor</h3><p class="w-mut">이번 축소 범위 밖이에요. 기존 화면을 그대로 써요.</p>' +
      '<p class="w-note">함께 확인: Director가 Artist 인물 시트를 참조하는지 (오류 13), 러프 마네킹이 인물로 이어지지 않는지 (오류 12).</p>' + A('처음부터 다시', 'reset') + '</div>';
  }

  var SCREENS = { A1c: A1c, WT: WT, WTm: WTm, EB1: EB1, EBX: EBX, EB2: EB2, EB3: EB3, EB4: EB4, EB5: EB5, EB6: EB6, EB7: EB7, E1: E1, E1e: E1e, EF: EF, EFe: EFe, E2: E2, E2e: E2e, E3: E3, E4: E4, E5: E5, W1: W1, W1r: W1r, WC1: WC1, WC2: WC2, WC3: WC3, W2: W2, W4: W4, W5: W5, W6: W6, WP: WP, WN: WN, W3: W3,
    A0: A0, A1: A1, R1: R1, A2: A2, A4: A4, A5: A5, A6: A6, A7: A7, A8: A8, R2: R2, A9: A9, AV: AV, AC1: AC1, AC2: AC2, AC3: AC3, AX: AX, AY: AY,
    A7r: A7r, S3c: S3c, S0: S0, S1: S1, SG: SG, S2: S2, S3: S3, S4: S4, R3: R3, S5: S5, S6: S6, S7: S7, S8: S8, SM: SM, D1: D1 };
  // 갈림 노드는 그 갈림을 묻는 화면으로
  var DECISION_SCREEN = { E1n: function () { return entryId(); }, EFq: 'EF', E2q: function () { return isB() ? 'EB3' : 'E3'; }, E5q: function () { return isB() ? 'EB7' : 'E4'; }, W1q: 'W1', WPq: 'WP', A5q: 'A5', S1q: 'S1' };
  // AI 작업이 끝나면 가는 곳
  var BUSY_NEXT = {
    E2: function () { if (st.file && st.file.noText) return 'E2e'; if (isB()) return st.file ? 'EB2' : nextQ(); return 'E3'; },
    E5: 'W1', W2: 'W4', A0: 'A1', A4: 'A5', A8: 'A5', S0: 'S1', S3: function () { return st.cands ? 'S3c' : 'S1'; }, S6: function () { var f = st.stateFrom; st.stateFrom = ''; return f || 'S1'; },
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
    EXTRA_PEOPLE.forEach(function (p) { if (text.indexOf(p[0]) >= 0 && !st.chars.some(function (c) { return c.n === p[0]; })) { st.chars.push({ n: p[0], d: p[1], states: ['처음 모습'], tone: 0, note: '' }); added.push(p[0]); } });
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
      if (st.sbChange) { say('Storyboard', 'Storyboard', '확인하지 않은 변경이 있어요. 먼저 [적용]하거나 [되돌리기]해 주세요.'); return 'SG'; }
      return sbAgent(t);

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
    breakdown: function () { st.back = ''; st.proseLocked = true; st.ents = null; return 'A0'; },
    // 재점검 팝업 열기 · 닫기: 닫으면 고친 표시를 되돌린다
    recheck: function () { if (!st.ents) initEnts(); st.entsBak = JSON.parse(JSON.stringify(st.ents)); st.pick = null; st.adding = false; st.editEnt = -1; return 'WT'; },
    recheckCancel: function () { if (st.entsBak) st.ents = st.entsBak; st.entsBak = null; st.pick = null; st.editEnt = -1; return drawn() ? 'A5' : 'A1'; },
    recheckRewrite: function () { ACTS.recheckCancel(); return drawn() ? 'R2' : 'R1'; },
    // 표시한 대로 목록을 다시 채운다: 이미 있던 것은 설명·그림을 그대로 두고, 산문은 바꾸지 않는다
    extract: function () {
      var oldC = st.chars, oldB = st.bgs, before = oldC.concat(oldB).map(function (o) { return o.n; });
      // 그림이 있으면 버전마다 가리키던 그림을 객체에 붙여 두었다가, 목록이 바뀐 뒤 다시 맞춘다
      oldC.concat(oldB).forEach(function (o, k) { o._sn = st.versions.map(function (v) { return v.snap[k]; }); });
      function keep(list, e, d) {
        var same = list.filter(function (x) { return e.aliases.indexOf(x.n) >= 0 || x.n === e.name; });
        var o = same.filter(function (x) { return x.n === e.name; })[0] || same[0];
        if (!o) return { n: e.name, d: d, states: ['처음 모습'], tone: 0, note: '', aliases: e.aliases };
        // 합쳐진 쪽(틴장)의 그림은 남는 쪽(팀장) 기록 끝에 붙는다
        same.forEach(function (x) {
          if (x === o || !x.hist) return;
          var base = o.hist.length;
          x.hist.forEach(function (h) { o.hist.push(Object.assign({}, h, { from: x.n })); });
          // 합칠 때 이쪽 그림을 고른 경우: 지금 그림을 그걸로
          if (e.pic === x.n && x.cur >= 0) { o.cur = base + x.cur; if (o._sn) o._sn[st.ver] = o.cur; }
        });
        o.n = e.name; o.aliases = e.aliases; delete e.pic; return o;
      }
      st.chars = st.ents.filter(function (e) { return e.type === 'char'; }).map(function (e) { return keep(oldC, e, '산문에서 표시한 인물. 설명은 AI가 산문을 읽고 채워요.'); });
      st.bgs = st.ents.filter(function (e) { return e.type === 'place'; }).map(function (e) { return keep(oldB, e, '산문에서 표시한 장소.'); });
      st.newItems = st.ents.map(function (e) { return e.name; }).filter(function (n) { return before.indexOf(n) < 0; });
      var all = objs(); st.versions.forEach(function (v, vi) { v.snap = all.map(function (o) { return o._sn ? o._sn[vi] : null; }); });
      all.forEach(function (o) { delete o._sn; });
      st.pick = null; st.editEnt = -1; st.entsBak = null;
      if (!drawn()) return 'A1';
      // 그림을 만든 뒤 새로 넣은 인물·배경은 지금 스타일로 바로 그린다
      var fresh = all.filter(function (o) { return o.cur < 0; });
      if (!fresh.length) return 'A5';
      st.busyNames = fresh.map(function (o) { return o.n; });
      st.pending = function () {
        var v = st.versions[st.ver];
        objs().forEach(function (o, k) { if (o.cur >= 0) return; o.hist.push({ style: st.style, tone: 0, note: '', v: v.n, r: 0, state: o.isBg ? '' : o.states[0] }); o.cur = o.hist.length - 1; v.snap[k] = o.cur; });
        say('Artist', 'Artist', st.busyNames.join(', ') + '을(를) 지금 스타일(' + STYLES[st.style][0] + ')로 만들었어요.'); st.busyNames = null;
      };
      return 'A4';
    },
    pickClear: function () { st.pick = null; st.adding = false; },
    addStart: function () { if (st.pick) st.adding = true; },
    addAs: function (t) {
      var w = st.pick; if (!w) return;
      var e = st.ents.filter(function (x) { return x.aliases.indexOf(w) >= 0; })[0];
      if (!e) st.ents.push({ name: w, type: t, aliases: [w] });
      st.pick = null; st.adding = false;
    },
    entEdit: function (i) { i = +i; st.editEnt = st.editEnt === i ? -1 : i; st.entName = st.editEnt >= 0 ? st.ents[i].name : ''; st.pick = null; st.adding = false; },
    entCancel: function () { st.editEnt = -1; },
    entSave: function () {
      var i = st.editEnt, e = st.ents[i], n = (st.entName || '').trim(); if (!e || !n) return;
      var j = -1; st.ents.forEach(function (x, k) { if (k !== i && x.type === e.type && (x.name === n || x.aliases.indexOf(n) >= 0)) j = k; });
      if (j >= 0) { st.mergeInto = j; return 'WTm'; }
      if (e.aliases.indexOf(n) < 0 && st.prose.join(' ').indexOf(n) >= 0) e.aliases.push(n);
      e.name = n; st.editEnt = -1;
    },
    entDrop: function (i) { st.ents.splice(+i, 1); st.editEnt = -1; },
    mergeCancel: function () { st.mergeInto = -1; return 'WT'; },
    mergeDo: function () {
      var e = st.ents[st.editEnt], t = st.ents[st.mergeInto];
      if (drawn()) { var pe = picOwner(e), pt = picOwner(t); t.pic = pe && pt ? st.mergePic || pt : pt || pe; }
      st.mergePic = null;
      e.aliases.forEach(function (a) { if (t.aliases.indexOf(a) < 0) t.aliases.push(a); });
      st.ents.splice(st.editEnt, 1); st.editEnt = -1; st.mergeInto = -1;
      return 'WT';
    },
    rollback: function (from) { st.proseLocked = false; st.back = from; st.ratioLocked = true; return 'W1'; },
    descEdit: function (i) { st.descEdit = +i; },
    descDone: function () { st.descEdit = -1; },
    generate: function () { st.styleLocked = true; st.pending = function () { newVersion(st.style); st.generated = true; st.newItems = []; say('Artist', 'Artist', STYLES[st.style][0] + '으로 v' + st.versions.length + '을 만들었어요. 마음에 들면 [완료하기], 아니면 [재생성하기]나 하나씩 [다시 만들기]를 눌러 주세요.'); }; return 'A4'; },
    regenCancel: function () { st.regenStyle = null; return 'A5'; },
    regenAll: function () { var sty = st.regenStyle == null ? st.style : st.regenStyle; st.regenStyle = null; st.pending = function () { st.style = sty; newVersion(sty); say('Artist', 'Artist', STYLES[sty][0] + '으로 v' + st.versions.length + '을 만들었어요. 이전 버전은 [불러오기]에 있어요.'); }; return 'A4'; },
    loadVer: function (i) { var v = st.versions[+i]; st.style = v.style; objs().forEach(function (o, k) { if (v.snap[k] != null) o.cur = v.snap[k]; }); st.ver = +i; say('Artist', 'Artist', 'v' + v.n + '(' + STYLES[v.style][0] + ')을 불러왔어요. 작품 스타일도 ' + STYLES[v.style][0] + '으로 바뀌었어요.'); return 'A5'; },
    objLoad: function (k) { var o = target(); if (o.hist[+k].style !== st.style) return; if (o.sTab > 0) { o.stImg = o.stImg || {}; o.stImg[o.states[o.sTab]] = +k; } else { o.cur = +k; st.versions[st.ver].snap[st.target] = o.cur; } say('Artist', 'Artist', o.n + '의 이전 그림을 불러왔어요.'); return 'A5'; },
    openState: function (a) { var p = a.split(':'), o = objs()[+p[0]], k = +p[1]; ACTS.openTone(p[0]); o.sTab = Math.max(0, k); st.vadd = k < 0; return 'A7'; },
    avar: function (k) { target().sTab = +k; st.dEdit = null; st.histOpen = false; },
    vbase: function () { var o = target(), k = o.sTab, n = o.states.splice(k, 1)[0], old = o.states[0], idx = stIdx(o, 0); o.states.unshift(n); o.stImg = o.stImg || {}; var ni = o.stImg[n]; if (idx >= 0) o.stImg[old] = idx; if (ni != null) { o.cur = ni; delete o.stImg[n]; } o.sTab = 0; say('Artist', 'Artist', o.n + '의 기준 모습을 "' + n + '"(으)로 바꿨어요.'); },
    vdel: function (k) { var o = target(), n = o.states.splice(+k, 1)[0]; if (o.stImg) delete o.stImg[n]; if (o.sTab >= o.states.length || o.sTab == +k) o.sTab = 0; say('Artist', 'Artist', o.n + '의 "' + n + '" 모습을 지웠어요.'); },
    vaddOpen: function () { st.vadd = true; st.vaName = ''; st.vaDesc = ''; },
    vaddClose: function () { st.vadd = false; if (st.stateFrom) { var f = st.stateFrom; st.stateFrom = ''; return f; } },
    vaddDo: function (gen) {
      var o = target(), n = (st.vaName || '').trim(); if (!n) return;
      if (o.states.indexOf(n) < 0) o.states.push(n);
      o.sd = o.sd || {}; o.sd[n] = (st.vaDesc || '').trim(); o.noImg = o.noImg || {}; o.noImg[n] = true;
      o.sTab = o.states.indexOf(n); st.vadd = false;
      var w = st.target, from = st.stateFrom;
      if (from && st.shotDraft && st.shotDraft.who.indexOf(w) >= 0) st.shotDraft.ws[w] = o.sTab;
      if (gen !== '1') { say('Artist', 'Artist', o.n + '에게 "' + n + '" 모습을 더했어요. 이미지는 아직 없어요.'); if (from) { st.stateFrom = ''; return from; } return; }
      st.rg = { parts: [0], useCur: true, refOff: [] };
      return ACTS.rgGo();
    },
    dEdit: function (k) { st.dEdit = +k; st.dDraft = descOf(target(), +k); },
    dCancel: function () { st.dEdit = null; },
    dSave: function () { var o = target(), k = st.dEdit, has = !!stateH(o, k) && !(k > 0 && o.noImg && o.noImg[o.states[k]]); if (k <= 0) { o.d = st.dDraft; if (has) o.dirty = true; } else { o.sd = o.sd || {}; o.sd[o.states[k]] = st.dDraft; if (has) { o.stale = o.stale || {}; o.stale[o.states[k]] = true; } } st.dEdit = null; },
    roleSet: function (j) { target().role = +j; },
    useSel: function (j) { st.useSel = st.useSel === +j ? null : +j; },
    goShot: function (j) { st.stateFrom = ''; return ACTS.editShot(j); },
    toArtist: function () { st.stateFrom = ''; st.vadd = false; return 'A5'; },
    detailClose: function () { st.dEdit = null; st.histOpen = false; if (st.stateFrom) { var f = st.stateFrom; st.stateFrom = ''; st.vadd = false; return f; } return 'A5'; },
    rgOpen: function () { var o = target(), k = o.isBg ? 0 : o.sTab; o.prompt = descOf(o, k) || o.d; o.traits = []; st.rg = { parts: stateH(o, k) ? [0] : [0], useCur: true, refOff: [] }; st.histOpen = false; return 'A7r'; },
    rgClose: function () { return st.stateFrom ? 'S5' : 'A7'; },
    rgPart: function (j) { j = +j; var p = st.rg.parts; if (j === 0) st.rg.parts = [0]; else { var x = p.indexOf(j); if (x >= 0) p.splice(x, 1); else p.push(j); var z = p.indexOf(0); if (z >= 0 && p.length > 1) p.splice(z, 1); if (!p.length) p.push(0); } },
    rgCur: function () { st.rg.useCur = !st.rg.useCur; },
    rgRef: function (j) { j = +j; var r = st.rg.refOff, x = r.indexOf(j); if (x >= 0) r.splice(x, 1); else r.push(j); },
    rgGo: function () {
      var o = target(), k = o.isBg ? 0 : o.sTab, rg = st.rg || { parts: [0] };
      var mode = rg.parts.indexOf(0) >= 0 ? 'new' : 'edit', note = mode === 'edit' ? rg.parts.map(function (j) { return PARTS[j]; }).join(' · ') + '만' : '';
      if (k > 0 && o.noImg) delete o.noImg[o.states[k]];
      if (k <= 0) o.dirty = false; else if (o.stale) delete o.stale[o.states[k]];
      return ACTS.regenObj(mode, note);
    },
    regenStale: function () { var o = target(); o.sTab = o.dirty ? 0 : o.states.indexOf(Object.keys(o.stale || {})[0]); st.rg = { parts: [0], useCur: true, refOff: [] }; return ACTS.rgGo(); },
    openTone: function (i) { st.target = +i; st.renaming = false; st.editMode = null; st.histOpen = false; st.stateDraft = ''; return 'A7'; },
    renameStart: function () { st.renaming = true; },
    renameDone: function () { st.renaming = false; },
    sTab: function (k) { target().sTab = +k; st.histOpen = false; },
    // 칩을 누르면 프롬프트 끝에 붙고, 다시 누르면 프롬프트에서 빠진다
    // 칩을 누르면 프롬프트 끝에 @칩 으로 붙고, 다시 누르면 빠진다. 프롬프트에서 @칩을 지워도 칩이 꺼진다(syncTraits).
    toggleTrait: function (t) {
      var o = target(), k = o.traits.indexOf(t);
      if (k >= 0) { o.traits.splice(k, 1); o.prompt = o.prompt.split('@' + t).join('').replace(/\s{2,}/g, ' ').trim(); }
      else { o.traits.push(t); o.prompt = (o.prompt.trim() ? o.prompt.trim() + ' ' : '') + '@' + t; }
    },
    histToggle: function () { st.histOpen = !st.histOpen; },
    traitsFold: function () { st.traitsOpen = !st.traitsOpen; },
    mergePic: function (n) { st.mergePic = n; },
    editMode: function (m) { st.editMode = m; },
    afilter: function (f) { st.afilter = f; },
    addRef: function (key) { var r = refsOf(key); r.push((key === 'style' ? '그림체' : '참고') + '_' + (r.length + 1) + '.jpg'); },
    delRef: function (a) { var kv = a.split(':'); refsOf(kv[0]).splice(+kv[1], 1); },
    acPick: function (m) { st.acMode = m; return m === 'edit' ? 'AC2' : 'AC3'; },
    regenObj: function (mode, note) {
      var t = target(), ti = st.target; st.regenMode = mode;
      var traits = t.traits.slice(), n = note || '', newState = '', from = st.stateFrom;
      st.histOpen = false;
      st.pending = function () {
        var v = st.versions[st.ver] ? st.versions[st.ver].n : 1;
        var r = t.hist.filter(function (h) { return h.v === v; }).length;
        t.hist.push({ style: st.style, tone: traits.indexOf('호러') >= 0 ? 2 : 0, note: n, traits: traits, model: t.model, v: v, r: r, state: newState || (t.isBg ? '' : t.states[t.sTab]) });
        // 첫 상태면 대표 그림, 다른 상태면 그 상태의 그림이 바뀐다
        if (!t.isBg && t.sTab > 0) { t.stImg = t.stImg || {}; t.stImg[t.states[t.sTab]] = t.hist.length - 1; }
        else { t.cur = t.hist.length - 1; if (st.versions[st.ver]) st.versions[st.ver].snap[ti] = t.cur; }
        say(from ? 'Storyboard' : 'Artist', from ? 'Storyboard' : 'Artist', t.n + (t.sTab > 0 ? ' · ' + t.states[t.sTab] : '') + '을(를) ' + (mode === 'edit' ? '지금 그림을 바탕으로 고쳤어요' : '같은 스타일로 만들었어요') + (n ? ' — ' + n : '') + '. 이전 그림은 상세의 기록에 있어요.');
      };
      st.vadd = false;
      return from ? 'S6' : 'A8';
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
    toBoard: function () {
      if (st.boarded) return 'S1';  // Artist로 돌아왔다가 다시 가면 샷은 그대로
      st.boarded = true;
      st.pending = function () { st.shots.forEach(function (x) { x.fresh = false; x.cand = false; x.chg = false; x.drawn = true; }); say('Storyboard', 'Storyboard', '씬 ' + st.scenes.length + '개 · 샷 ' + st.shots.length + '개로 나누고 러프까지 그렸어요. 카드에서 바로 고치거나 저에게 말해 주세요.'); };
      return 'S0';
    },
    sbView: function (v) { st.sbView = v; },
    shotMenu: function (i) { st.sbMenu = st.sbMenu === +i ? -1 : +i; },
    shotMove: function (a) {
      var p = a.split(':'), i = +p[0], j = i + +p[1]; st.sbMenu = -1;
      if (j < 0 || j >= st.shots.length) return;
      var x = st.shots[i], y = st.shots[j]; if (x.sc !== y.sc) { x.sc = y.sc; } else { st.shots[i] = y; st.shots[j] = x; }
      say('Storyboard', 'Storyboard', '번호를 다시 매겼어요.');
    },
    shotDup: function (i) { var c = clone(st.shots[+i]); c.fresh = true; st.shots.splice(+i + 1, 0, c); st.sbMenu = -1; },
    shotDel: function (i) { var x = st.shots.splice(+i, 1)[0]; st.sbMenu = -1; st.lastDel = [+i, x]; say('Storyboard', 'Storyboard', '샷을 지웠어요. 지금 ' + total() + '초예요.'); },
    editShot: function (i) { st.sbFrame = 0; st.shotSel = +i; st.shotDraft = clone(st.shots[+i]); st.shotTab = 'start'; st.sbMenu = -1; st.ddOpen = ''; return 'S2'; },
    shotTab: function (t) { st.shotTab = t; },
    dirMode: function (m) { st.dirMode = m; },
    shotWho: function (k) { k = +k; var d = st.shotDraft, j = d.who.indexOf(k); if (j >= 0) d.who.splice(j, 1); else d.who.push(k); },
    redraw: function (i) { var x = st.shots[+i]; st.busyNames = null; st.pending = function () { x.drawn = true; x.fresh = false; }; return 'S3'; },
    drawAll: function () { var xs = st.shots.filter(function (x) { return !x.drawn; }); st.busyNames = null; st.pending = function () { xs.forEach(function (x) { x.drawn = true; x.fresh = false; }); say('Storyboard', 'Storyboard', '스케치 없는 ' + xs.length + '컷을 그렸어요.'); }; return 'S3'; },
    addLine: function () { st.shotDraft.lines.push({ w: 0, t: '' }); },
    delLine: function (i) { st.shotDraft.lines.splice(+i, 1); },
    cancelShot: function () { st.shotDraft = null; st.shotNew = false; st.addAt = null; st.ddOpen = ''; return 'S1'; },
    // 적용하면 다시 그린 러프가 '적용 전'으로 카드에 붙는다: 이전 → 새로 [되돌리기] [적용]
    applyShot: function () {
      var d = st.shotDraft, i = st.shotSel, before = clone(st.shots[i]); st.shotDraft = null;
      if (d.lenI != null) { d.len = LENS[+d.lenI]; delete d.lenI; } ['len', 'size', 'ang', 'move', 'bg'].forEach(function (k) { d[k] = +d[k] || 0; }); if (!d.len) d.len = 1;
      d.lines = d.lines.filter(function (l) { return l.t.trim(); }).map(function (l) { l.w = +l.w; return l; });
      var part = st.shotTab === 'start' ? '시작 · 연출' : '연출';
      d.rv = (before.rv || 0) + 1;
      st.pending = function () { d.drawn = true; st.shots[i] = d; st.cands = [{ i: i, prev: before, what: part + '을 다시 그렸어요' }]; };
      return 'S3';
    },
    candOk: function () { var cs = st.cands || []; st.cands = null; st.shots.forEach(function (x) { x.chg = false; }); say('Storyboard', 'Storyboard', cs.map(function (c) { return shotLabel(c.i); }).join(', ') + '에 새 러프를 적용했어요. 지금 ' + total() + '초예요.'); return 'S1'; },
    candUndo: function () { (st.cands || []).forEach(function (c) { st.shots[c.i] = c.prev; }); st.cands = null; st.shots.forEach(function (x) { x.chg = false; }); say('Storyboard', 'Storyboard', '되돌렸어요. 이전 그림 그대로예요.'); return 'S1'; },
    candEdit: function () { var c = st.cands[0], cur = st.shots[c.i]; st.shots[c.i] = c.prev; st.cands = null; st.shotSel = c.i; st.shotDraft = clone(cur); delete st.shotDraft.rv; st.shotDraft.rv = c.prev.rv || 0; st.ddOpen = ''; return 'S2'; },
    sbFrame: function (k) { st.sbFrame = +k; },
    // [＋ 샷]: 씬 머리에서 누르면 그 씬 끝, 위쪽에서 누르면 자리 없이 열고 왼쪽에서 고른다
    newShot: function (a) {
      var p = String(a || '').split(':'), n = +p[0] || 0;
      st.addAt = n ? { sc: n, k: p[1] != null && p[1] !== '' ? +p[1] : scShots(n).length } : null;
      st.shotDraft = { sc: n || 1, len: 3, size: 3, ang: 0, move: 0, dir: '', desc: '', who: [], ws: {}, bg: n ? st.scenes[n - 1].place : 0, lines: [], drawn: false, light: { pos: 0, temp: 3, bri: 50 } };
      st.shotTab = 'start'; st.shotNew = true; st.ddOpen = ''; return 'S4';
    },
    addAt: function (a) { var p = a.split(':'); st.addAt = { sc: +p[0], k: +p[1] }; st.shotDraft.sc = +p[0]; st.shotDraft.bg = st.scenes[+p[0] - 1].place; },
    ddOpen: function (path) { st.ddOpen = st.ddOpen === path ? '' : path; },
    ddPick: function (a) { var p = a.split('~'); setPath(st, p[0], +p[1]); st.ddOpen = ''; },
    addShot: function () {
      var d = st.shotDraft, at = st.addAt; if (!d || !d.desc.trim() || !at) return;
      if (d.lenI != null) { d.len = LENS[+d.lenI]; delete d.lenI; }
      d.lines = d.lines.filter(function (l) { return l.t.trim(); }).map(function (l) { l.w = +l.w; return l; });
      d.sc = at.sc; d.fresh = true; st.shotDraft = null; st.shotNew = false; st.addAt = null; st.ddOpen = '';
      var list = scShots(at.sc), idx = at.k < list.length ? list[at.k][1] : list.length ? list[list.length - 1][1] + 1 : (function () { var last = -1; st.shots.forEach(function (x, k) { if (x.sc < at.sc) last = k; }); return last + 1; })();
      st.shots.splice(idx, 0, d);
      st.pending = function () { d.drawn = true; say('Storyboard', 'Storyboard', shotLabel(st.shots.indexOf(d)) + '을(를) 추가하고 러프를 그렸어요. 지금 ' + total() + '초예요.'); };
      return 'S3';
    },
    addScene: function () {
      var a = st.scAdd, at = +a.pos;
      st.shots.forEach(function (x) { if (x.sc > at) x.sc++; });
      st.scenes.splice(at, 0, { place: +a.place, time: +a.time, sum: a.sum.trim() || '새 씬' });
      say('Storyboard', 'Storyboard', 'S' + (at + 1) + '를 추가했어요. 뒤 씬 번호가 하나씩 밀렸어요. [＋ 샷]으로 샷을 넣어 주세요.');
      st.scAdd = { place: 0, time: 0, sum: '', pos: st.scenes.length };
      return 'S1';
    },
    printSheet: function () { say('Storyboard', 'Storyboard', '마스터 시트를 PDF로 내려받았어요 (목업).'); return 'S1'; },
    // 채팅 요청: 에이전트가 샷을 바꾸고 노랗게 표시 → 적용 / 되돌리기
    // 에이전트 변경을 적용하면 바뀐 샷을 다시 그리고, 확인 팝업에서 이전 → 새로를 본 뒤 적용한다
    sbApply: function () {
      var ch = st.sbChange; st.sbChange = null;
      // 새로 넣은 샷은 이미 그렸으니 확인 없이 들어가고, 값이 바뀐 샷만 이전 → 새로를 확인한다
      var same = ch && ch.before.length === st.shots.length, cs = [];
      st.shots.forEach(function (x, i) { if (!x.chg) return; if (x.fresh || !same) { x.chg = false; return; } x.rv = (x.rv || 0) + 1; cs.push({ i: i, prev: ch.before[i], what: ch.note.split('. ')[0] }); });
      if (!cs.length) { st.shots.forEach(function (x) { x.chg = false; }); say('Storyboard', 'Storyboard', '적용했어요.'); return 'S1'; }
      st.pending = function () { st.cands = cs; }; return 'S3';
    },
    sbUndo: function () { if (st.sbChange) st.shots = st.sbChange.before; st.shots.forEach(function (x) { x.chg = false; }); st.sbChange = null; return 'S1'; },
    stateCancel: function () { var f = st.stateFrom; st.stateFrom = ''; return f || 'S1'; },
    addState: function () {
      var w = +st.stateAdd.who, text = st.stateAdd.text.trim(); if (!text) return;
      st.pending = function () {
        st.chars[w].states.push(text);
        if (st.shotDraft && st.shotDraft.who.indexOf(w) >= 0) st.shotDraft.ws[w] = st.chars[w].states.length - 1;
        say('Storyboard', 'Storyboard', st.chars[w].n + '에게 "' + text + '" 모습을 더했어요. Artist 카드에도 같이 보여요.');
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
  // 프롬프트에서 @칩 을 지우면 아래 칩도 꺼진다 (입력 중이라 다시 그리지 않고 칩만 바꾼다)
  function syncTraits() {
    var o = target(); if (!o || !o.traits) return;
    o.traits = o.traits.filter(function (t) { return o.prompt.indexOf('@' + t) >= 0; });
    root.querySelectorAll('[data-act="toggleTrait"]').forEach(function (b) {
      var t = b.getAttribute('data-arg'), on = o.traits.indexOf(t) >= 0;
      b.classList.toggle('on', on); b.setAttribute('aria-pressed', on); b.textContent = (on ? '✓ @' : '＋ ') + t;
    });
  }
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
    if (st.pending) { var p = st.pending; st.pending = null; p(); }
    var nx = BUSY_NEXT[cur]; if (typeof nx === 'function') nx = nx();
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
      setPath(st, p, t.tagName === 'SELECT' || t.type === 'range' ? +t.value : t.value);
      if (/\.prompt$/.test(p)) syncTraits();
      refresh();
    });
    el.addEventListener('change', function (e) {
      var t = e.target;
      if (t.classList && t.classList.contains('ref-in') && t.files && t.files[0]) { refsOf(t.getAttribute('data-ref')).push(t.files[0].name); t.value = ''; paint(); return; }
      if (t.id === 'file-in' && t.files && t.files[0]) {
        var f = t.files[0]; t.value = '';
        go(pickFile(f.name, null, f.size));
      } else if (t.type === 'range') paint();
      else if (t.getAttribute && t.getAttribute('data-act-change') === 'shotWs') {
        // 샷의 인물 모습 고르기. "＋ 새 모습…"이면 모습 추가 팝업으로 (편집 중인 샷은 그대로)
        var k = +t.getAttribute('data-arg');
        if (t.value === 'new') { st.stateFrom = cur; st.target = k; objs()[k].sTab = 0; st.vadd = true; st.vaName = ''; st.vaDesc = ''; st.dEdit = null; st.histOpen = false; go('S5'); }
        else st.shotDraft.ws[k] = +t.value;
      }
    });
    el.addEventListener('mouseup', function (e) {
      if (!e.target.closest || !e.target.closest('.w-tgprose') || e.target.closest('.w-tg')) return;
      var t = String(window.getSelection ? window.getSelection() : '').trim();
      if (t && t.length <= 14 && !/\n/.test(t)) { st.pick = t; st.adding = false; st.editEnt = -1; paint(); }
    });
    el.addEventListener('keydown', function (e) {
      var t = e.target;
      if ((e.key === 'Enter' || e.key === ' ') && t.getAttribute && t.getAttribute('role') === 'button' && t.tagName !== 'BUTTON' && t.getAttribute('data-act')) { e.preventDefault(); run(t.getAttribute('data-act'), t.getAttribute('data-arg')); return; }
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
