/* Tale Studio 리뉴얼 프로토타입 — 화면
 * 키는 flow.js의 노드 ID와 같다. data-go="ID"를 누르면 그 노드로 이동한다.
 * 예시 작품: "자판기의 반란" (민호, 팀장, 회사 복도 자판기) */
(function () {
  var STAGE_ORDER = ['Producer', 'Artist', 'Storyboard', 'Director', 'Editor'];

  function rail(on, done) {
    return '<nav class="w-rail">' + STAGE_ORDER.map(function (s) {
      var c = s === on ? 'on' : (done || []).indexOf(s) >= 0 ? 'done' : '';
      return '<span class="' + c + '">' + s + '</span>';
    }).join('') + '</nav>';
  }
  function bar(o) {
    o = o || {};
    return '<header class="w-bar"><b class="w-logo">Tale Studio</b>' + (o.rail || '') +
      '<span class="w-meta">' + (o.ratio === false ? '' : '<span class="w-lock">🔒 9:16</span>') + '<span class="w-lang">한국어 · 사이트 언어</span></span></header>';
  }
  function studio(o) {
    var chat = '<aside class="w-chat' + (o.chatLocked ? ' is-locked' : '') + '"><div class="w-chat-h">에이전트 채팅</div><div class="w-chat-b">' +
      (o.chat || []).map(function (m) { return '<div class="w-msg"><b>' + m[0] + '</b>' + m[1] + '</div>'; }).join('') +
      '</div><div class="w-chat-in"><span>' + (o.chatLocked ? '팝업을 닫으면 다시 쓸 수 있어요' : '말해주세요…') + '</span><button class="w-btn pri" ' + (o.chatLocked ? 'disabled' : 'data-go="' + (o.chatGo || '') + '"') + '>보내기</button></div></aside>';
    return bar({ rail: rail(o.on, o.done) }) + '<div class="w-studio"><main class="w-main">' + o.main + '</main>' + chat + '</div>';
  }
  function modal(title, body, acts, wide) {
    return '<div class="w-back"><div class="w-modal' + (wide ? ' wide' : '') + '" role="dialog" aria-label="' + title + '"><h4>' + title + '</h4>' + body + '<div class="w-acts">' + acts + '</div></div></div>';
  }
  function busy(title, steps, next, cur) {
    cur = cur == null ? 0 : cur;
    return '<div class="w-busy" role="status"><div class="w-busy-card"><span class="w-spin" aria-hidden="true"></span><h4>' + title + '</h4>' +
      '<p>AI가 작업하는 동안은 화면 전체가 잠겨요. 끝나면 고칠 수 있어요.</p>' +
      (steps ? '<ol class="w-steps">' + steps.map(function (s, i) { return '<li class="' + (i < cur ? 'done' : i === cur ? 'cur' : '') + '">' + s + '</li>'; }).join('') + '</ol>' : '') +
      '<button class="w-btn ghost" data-go="' + next + '">목업: 완료로 넘기기 →</button></div></div>';
  }
  function list(rows) { return '<dl class="w-list">' + rows.map(function (r) { return '<div><dt>' + r[0] + '</dt><dd>' + r[1] + '</dd></div>'; }).join('') + '</dl>'; }
  function opts(arr, on, rec) {
    return '<div class="w-opts">' + arr.map(function (o, i) {
      var t = Array.isArray(o) ? o : [o, ''];
      return '<button class="w-opt' + (i === on ? ' on' : '') + '" data-pick>' + (i === rec ? '<em>추천</em>' : '') + t[0] + (t[1] ? '<small>' + t[1] + '</small>' : '') + '</button>';
    }).join('') + '</div>';
  }
  var B = function (label, go, cls, dis) { return '<button class="w-btn ' + (cls || '') + '"' + (dis ? ' disabled' : '') + (go ? ' data-go="' + go + '"' : '') + '>' + label + '</button>'; };

  /* ── 진입 ── */
  var RATIOS = [['16:9', '가로'], ['9:16', '세로 · 숏폼'], ['1:1', '정방형'], ['2.39:1', '시네마']];
  function E1(withFile) {
    return bar({ ratio: false }) + '<div class="w-entry"><h3>무엇을 만들어 볼까요?</h3>' +
      '<div class="w-ta">회사 복도 자판기가 고장 나서 캔이 우르르 쏟아지는 코미디. 주인공 민호는 하나도 못 먹는다.</div>' +
      '<div class="w-file">' + (withFile ? '<span class="w-chip">📎 자판기_대본_v2.docx</span>' : '<span class="w-mut">대본 · 기획 메모 · 캐릭터 시트 · 웹툰 · 사진</span>') + B('파일 첨부', withFile ? '' : 'E1f') + '</div>' +
      '<div class="w-q"><div class="w-q-t">화면 비율 <small>시작하면 바꿀 수 없어요</small></div>' + opts(RATIOS, 1, 1) + '</div>' +
      '<div class="w-foot"><span class="w-mut">채팅은 사이트 언어(한국어)로 진행해요.</span>' + B('시작', withFile ? 'E1m' : 'E2', 'pri') + '</div></div>';
  }
  function E1m() {
    return E1(true) + modal('이미지를 쓸 권리가 있나요?', '<p>올린 이미지를 생성에 참조해요. 직접 만들었거나 쓸 권리가 있는 이미지만 올려 주세요.</p>',
      B('아니오 · 이미지 빼기', 'E1') + B('예, 동의해요', 'E2', 'pri'));
  }
  function E2() { return E1(true) + busy('자료를 읽고 있어요', ['파일 열기', '글인지 이미지인지 보기', '종류 판별'], 'E3', 1); }

  var KINDS = {
    '1-1': ['영상까지 고려된 대본', '대본을 어떻게 쓸까요?', [['그대로 영상화', '원본을 고치지 않고 바로 샷으로'], ['조금 다듬어서', '바뀐 부분만 새로 써요'], ['바탕으로 새로', '대본을 재료로 새 이야기']], 0],
    '1-2': ['일반 대본 (연극·고전 대본)', '대본을 어떻게 쓸까요?', [['그대로 영상화', '빠진 연출·인물·배경만 채워요'], ['조금 다듬어서', ''], ['바탕으로 새로', '']], 0],
    '2-1': ['캐릭터 시트 · 컨셉 아트', '이 이미지는 무엇인가요?', [['인물', '인물 목록에 넣어요'], ['배경', '배경 목록에 넣어요']], 0, '이야기 글감이 필요해요. 아이디어 칸에 적어 주세요.'],
    '2-2': ['웹툰', '웹툰으로 무엇을 할까요?', [['그대로 영상화', '스토리·그림체 그대로'], ['다른 스타일로', '스토리만 가져와요'], ['그림체만', '다른 이야기를 이 그림체로'], ['아이디어로', '스토리를 바탕으로 대화']], 0, '"그대로"와 "다른 스타일로"는 러닝타임을 지정할 수 없어요.'],
    '2-3': ['참조용 사진', '사진으로 무엇을 할까요?', [['이 느낌의 영상', '그림체·스타일을 가져와요'], ['아이디어로', 'AI가 사진을 읽고 대화']], 0],
  };
  var kind = '1-1';
  function E3() {
    var k = KINDS[kind];
    var tabs = Object.keys(KINDS).map(function (c) { return '<button class="w-tab' + (c === kind ? ' on' : '') + '" data-kind="' + c + '">' + c + '</button>'; }).join('');
    return E1(true) + modal('이렇게 읽었어요',
      '<div class="w-read"><span class="w-chip">📎 자판기_대본_v2.docx</span><b>' + k[0] + '</b><button class="w-link" data-cycle>종류가 달라요</button></div>' +
      '<div class="w-q"><div class="w-q-t">' + k[1] + '</div>' + opts(k[2], k[3], k[3]) + '</div>' + (k[4] ? '<p class="w-note">' + k[4] + '</p>' : '') +
      '<div class="w-proto-tabs"><span>목업: 판별 결과 바꿔 보기</span>' + tabs + '</div>',
      B('이전', 'E1') + B('시작', 'E4', 'pri'));
  }
  function E4() {
    return E1(true) + modal('이대로 시작할까요?', list([['🔒 화면 비율', '9:16 · 시작하면 끝까지 바꿀 수 없어요'], ['채팅 언어', '한국어 (사이트 언어)'], ['자료', '자판기_대본_v2.docx · 조금 다듬어서']]),
      B('아니오, 고칠래요', 'E1') + B('예, 시작', 'E5', 'pri'));
  }
  function E5() { return P1() + busy('산문 초안을 쓰고 있어요', ['자료 정리', '이야기 뼈대', '씬 스토리 쓰기'], 'P1', 2); }

  /* ── Producer ── */
  var PROSE = '<p><span>S1</span>회사 복도, 오후 세 시. 민호가 자판기 버튼을 누르지만 아무것도 나오지 않는다. 동전 반환 레버를 당겨 봐도 조용하다. 민호는 자판기를 툭 친다.</p>' +
    '<p><span>S2</span>자판기가 덜컹거리더니 캔이 우르르 쏟아진다. 지나가던 팀장이 하나를 집어 들고 "고마워" 하고 간다. 바닥에 굴러다니는 캔 사이에서 민호는 멍하니 서 있다.</p>';
  function proseMain(ro) {
    return '<div class="w-title"><h3>자판기의 반란</h3>' + B('브레이크다운하기 →', ro ? 'P6' : 'P6', 'pri') + '</div>' +
      (ro ? '<div class="w-banner">대본을 그대로 쓰는 프로젝트예요. 산문을 고칠 수 없고, 확인한 뒤 브레이크다운만 할 수 있어요.</div>' : '') +
      '<div class="w-prose-tools">' + B('✦ AI 다시 쓰기', 'P3', 'acc', ro) + B('직접 작성', 'P5', '', ro) + '</div>' +
      '<article class="w-prose">' + PROSE + '</article>';
  }
  function P1() {
    return studio({ on: 'Producer', main: proseMain(false), chatGo: 'P2',
      chat: [['Producer', '씬 두 개로 산문을 썼어요. 길이나 분위기를 바꾸고 싶으면 "AI 다시 쓰기"에서 골라 주세요.']] });
  }
  function P1r() {
    return studio({ on: 'Producer', main: proseMain(true), chat: [['Producer', '올린 대본을 그대로 옮겼어요. 확인하고 브레이크다운해 주세요.']] });
  }
  function P3() {
    return P1() + modal('AI 다시 쓰기', '<p class="w-mut">이 값들은 산문을 쓰는 재료예요. 산문을 확정하면 여기서 끝나요.</p>' +
      '<div class="w-q"><div class="w-q-t">러닝타임</div>' + opts([['15초 이하', '숏폼'], ['15~60초', '광고·티저'], ['1~5분', 'MV·웹드라마'], ['5~20분', '단편']], 0) + '</div>' +
      '<div class="w-q"><div class="w-q-t">글의 분위기 <small>이전 이름: 장르·톤</small></div>' + opts(['코미디', '드라마', '로맨스', '스릴러', '호러', '직접 입력…'], 0) + '</div>' +
      '<div class="w-q"><div class="w-q-t">얼마나 바꿀까요?</div>' + opts(['조금만 다듬기', '표현을 새로', '아이디어부터 다시'], 0) + '</div>',
      B('취소', 'P1') + B('다시 쓰기', 'P2', 'acc'), true);
  }
  function P2() { return P1() + busy('산문을 고치고 있어요', ['요청 읽기', '세 가지 안 쓰기'], 'P4', 1); }
  function P4() {
    var v = ['민호가 자판기를 발로 차자 캔이 쏟아지고, 팀장이 "고마워"…', '민호가 마지막 동전을 넣는다. 캔은 안 나오고, 팀장이 오자 우르르…', '자판기가 민호만 무시한다. 팀장 앞에서는 캔을 선물하듯…'];
    return P1() + modal('세 가지 안', '<div class="w-variants">' + v.map(function (t, i) { return '<button class="w-var' + (i === 0 ? ' on' : '') + '" data-pick><b>안 ' + (i + 1) + '</b>' + t + '</button>'; }).join('') + '</div>',
      B('버리기', 'P1') + B('이 안 적용', 'P1', 'pri'), true);
  }
  function P5() {
    return studio({ on: 'Producer', main: proseMain(false), chatLocked: true, chat: [['Producer', '씬 두 개로 산문을 썼어요.']] }) +
      modal('직접 작성', '<p class="w-mut">팝업이 열려 있는 동안 에이전트 채팅은 잠겨요.</p><div class="w-editor" contenteditable="true">' + PROSE + '</div>',
        B('취소', 'P1') + B('저장', 'P1', 'pri'), true);
  }
  function P6() {
    return P1() + modal('산문을 확정하고 브레이크다운할까요?', list([['🔒 산문', '확정하면 잠겨요'], ['다음', 'AI가 인물·배경을 글로 뽑아요'], ['나중에 인물·배경을 늘리려면', '여기 산문으로 돌아와야 해요']]),
      B('아니오', 'P1') + B('예, 브레이크다운', 'A0', 'pri'));
  }

  /* ── Artist ── */
  var CHARS = [
    { n: '민호', d: '20대 후반 직장인. 흰 셔츠, 느슨한 넥타이, 피곤한 눈.', st: ['기본: 흰 셔츠', '파생: 셔츠에 콜라 얼룩 (S2)'] },
    { n: '팀장', d: '40대. 회색 정장, 단정한 머리, 무표정.', st: ['기본: 회색 정장'] },
  ];
  var BGS = [{ n: '회사 복도 자판기 앞', d: '낮, 형광등, 리놀륨 바닥, 빨간 자판기 한 대.' }];
  function cards(img, tone) {
    tone = tone || {};
    var c = CHARS.map(function (x, i) {
      return '<div class="w-card">' + (img ? '<div class="w-img' + (tone[i] ? ' horror' : '') + '">' + x.n + '</div>' : '') +
        '<b>' + x.n + ' <small>인물</small></b><p>' + x.d + '</p><ul class="w-states">' + x.st.map(function (s) { return '<li>' + s + '</li>'; }).join('') + '</ul>' +
        (img ? '<div class="w-card-acts">' + B('톤: ' + (tone[i] || '작품 기본') + ' ▾', 'A7', 'sm') + B('AI로 고치기', 'A7', 'sm') + '</div>'
             : '<div class="w-card-acts">' + B('설명 고치기', '', 'sm') + B('상태 추가', '', 'sm', true) + '</div>') + '</div>';
    }).join('');
    var b = BGS.map(function (x) {
      return '<div class="w-card">' + (img ? '<div class="w-img bg">배경</div>' : '') + '<b>' + x.n + ' <small>배경</small></b><p>' + x.d + '</p>' +
        (img ? '<div class="w-card-acts">' + B('톤: 작품 기본 ▾', 'A7', 'sm') + '</div>' : '') + '</div>';
    }).join('');
    return '<div class="w-cards">' + c + b + '</div>';
  }
  function A1(extra) {
    var main = '<div class="w-title"><h3>Artist · 브레이크다운</h3><span class="w-mut">확정 산문에서 뽑은 인물 2 · 배경 1</span></div>' +
      '<div class="w-diag"><b>AI 진단</b> 산문의 인물과 장소를 모두 찾았어요. S2의 "지나가던 사람들"은 따로 인물로 뽑지 않았어요. 필요하면 산문에서 이름을 붙여 주세요.</div>' +
      cards(false) + '<p class="w-note">상태 추가(씬마다 다른 옷·나이)는 Storyboard 단계에서 할 수 있어요.</p>' +
      '<div class="w-foot">' + B('빠진 인물·배경이 있어요', 'R1') + B('목록이 맞아요 · 스타일 고르기 →', 'A2', 'pri') + '</div>';
    return studio({ on: 'Artist', done: ['Producer'], main: main, chat: [['Artist', '인물 2명, 배경 1곳이에요. 민호는 S2에서 얼룩진 셔츠 상태가 하나 더 있어요.']] }) + (extra || '');
  }
  function A0() { return A1(busy('인물·배경을 뽑고 있어요', ['산문 읽기', '인물 · 배경 찾기', '인물별 상태 세분화'], 'A1', 1)); }
  function R1() {
    return A1(modal('산문으로 돌아갈까요?', '<p>인물·배경은 산문에서 나와요. 산문에 넣어야 목록에 생겨요.</p>' +
      list([['잃는 것', '없음 (아직 그림이 없어요)'], ['다음', 'Producer 산문이 다시 열려요 → 고치고 다시 브레이크다운']]),
      B('아니오', 'A1') + B('예, 산문으로', 'P1', 'warn')));
  }
  var STY = [['실사', '#5b6470,#22262c'], ['애니메이션', '#ffb4a2,#8aa6ff'], ['웹툰', '#fff3c4,#ffd0e0'], ['3D', '#9be1d4,#5f7fd9'], ['수채화', '#d9ecf5,#f4d9c6'], ['견본 올리기', '']];
  function styles() {
    return '<div class="w-styles">' + STY.map(function (s, i) {
      return '<button class="w-sty' + (i === 1 ? ' on' : '') + '" data-pick><i style="background:' + (s[1] ? 'linear-gradient(135deg,' + s[1] + ')' : 'repeating-linear-gradient(45deg,var(--w-line) 0 5px,transparent 5px 10px)') + '"></i>' + s[0] + '</button>';
    }).join('') + '</div>';
  }
  function A2(extra) {
    var main = '<div class="w-title"><h3>Artist · 스타일</h3><span class="w-mut">이 작품의 스타일은 하나예요</span></div>' + styles() + cards(false) +
      '<div class="w-foot"><span class="w-mut">인물 2 · 상태 1 · 배경 1 · 예상 크레딧 표시 자리</span>' + B('이 스타일로 전체 생성', 'A3', 'acc') + '</div>';
    return studio({ on: 'Artist', done: ['Producer'], main: main, chat: [['Artist', '스타일을 고르면 인물·배경을 모두 그 스타일로 그려요.']] }) + (extra || '');
  }
  function A3() {
    return A2(modal('애니메이션 스타일로 만들까요?', list([['만드는 것', '인물 시트 2 · 상태 1 · 배경 1'], ['🔒 스타일', '애니메이션으로 잠겨요. 바꾸면 전체를 다시 만들어요'], ['예상 크레딧', '표시 자리']]),
      B('아니오', 'A2') + B('예, 만들기', 'A4', 'acc')));
  }
  function A5(tone, extra) {
    var main = '<div class="w-title"><h3>Artist</h3>' + B('다음: Storyboard로 →', 'A9', 'pri') + '</div>' +
      '<div class="w-stybar"><i style="background:linear-gradient(135deg,#ffb4a2,#8aa6ff)"></i><b>애니메이션</b><span class="w-lock">🔒 스타일</span>' + B('스타일 바꾸기', 'A6', 'warn sm') + '</div>' +
      cards(true, tone) + '<div class="w-foot">' + B('＋ 인물·배경 추가', 'R2') + '</div>';
    return studio({ on: 'Artist', done: ['Producer'], main: main, chatGo: 'A8', chat: [['Artist', '애니메이션으로 4장을 만들었어요. 특정 인물이나 배경만 톤을 바꾸려면 카드의 톤을 눌러 주세요.']] }) + (extra || '');
  }
  function A4() { return A2(busy('그림을 만들고 있어요', ['민호 시트', '민호 · 얼룩 상태', '팀장 시트', '복도 자판기'], 'A5', 2)); }
  function A6() {
    return A5(null, modal('스타일을 바꾸면 전체를 다시 만들어요', list([['다시 만드는 것', '인물 시트 2 · 상태 1 · 배경 1'], ['그대로인 것', '객체별 톤'], ['예상 크레딧', '표시 자리']]),
      B('아니오', 'A5') + B('예, 스타일 다시 고르기', 'A2', 'warn')));
  }
  function A7() {
    return A5(null, modal('민호의 톤', '<p>이 인물에만 적용돼요. 스타일(애니메이션 🔒)과 다른 객체는 그대로예요.</p>' +
      opts(['작품 기본', '코미디', '호러', '로맨스', '직접 입력…'], 2) + '<div class="w-q"><div class="w-q-t">AI에게 고칠 점 <small>선택</small></div><div class="w-ta sm">넥타이를 더 느슨하게</div></div>' +
      list([['다시 만드는 것', '민호 시트 1 · 상태 1'], ['예상 크레딧', '표시 자리']]),
      B('취소', 'A5') + B('민호만 다시 만들기', 'A8', 'acc')));
  }
  function A8() { return A5({ 0: '호러' }, busy('민호를 다시 만들고 있어요', null, 'A5')); }
  function R2() {
    return A5(null, modal('산문으로 돌아갈까요?', '<p>새 인물·배경은 산문에 넣어야 생겨요.</p>' +
      list([['그대로인 것', '바뀌지 않은 인물·배경 그림 (제안 · 개발 확인)'], ['다시 하는 것', '산문 확정 → 브레이크다운 → 새 객체 그림'], ['🔒 스타일', '애니메이션 유지']]),
      B('아니오', 'A5') + B('예, 산문으로', 'P1', 'warn')));
  }
  function A9() {
    return A5(null, modal('Storyboard로 넘길까요?', list([['넘어가는 것', '확정 산문 · 인물 2 · 상태 1 · 배경 1 · 🔒 애니메이션'], ['다음', 'AI가 씬·샷을 나누고 러프를 그려요'], ['나중에 인물·배경을 늘리려면', '산문으로 롤백해야 해요. 상태는 Storyboard에서 추가할 수 있어요']]),
      B('아니오', 'A5') + B('예, 넘기기', 'S0', 'pri')));
  }

  /* ── Storyboard ── */
  var SHOTS = [['S1-1', 3, '와이드 · 고정', '민호가 버튼을 누른다'], ['S1-2', 2, '클로즈업', '반환 레버'], ['S1-3', 2, '미디엄', '자판기를 툭'], ['S2-1', 4, '와이드 · 틸트 다운', '캔이 쏟아진다'], ['S2-2', 3, '미디엄', '팀장 "고마워"'], ['S2-3', 2, '클로즈업', '멍한 민호']];
  function S1(extra) {
    var total = SHOTS.reduce(function (a, s) { return a + s[1]; }, 0);
    var pct = Math.min(100, Math.round(total / 15 * 100));
    var main = '<div class="w-title"><h3>Storyboard <small class="w-tbd">이름 미정</small></h3>' + B('다음: Director로 →', 'S7', 'pri') + '</div>' +
      '<div class="w-rt"><div class="w-rt-h"><span>러닝타임</span><b>' + total + '초</b><span class="w-mut">/ 목표 15초 이하</span></div><div class="w-rt-bar"><i style="width:' + pct + '%"></i></div><small class="w-mut">샷 길이의 합이에요. 고치는 칸이 아니라 지표예요.</small></div>' +
      '<div class="w-tools">' + B('＋ 샷 추가', 'S4') + B('＋ 인물·배경 상태 추가', 'S5') + '<span class="w-mut">대사 언어: 한국어 ▾</span></div>' +
      '<div class="w-shots">' + SHOTS.map(function (s) {
        return '<div class="w-shot"><div class="w-fr"><i></i><i></i><i></i></div><div class="w-shot-c"><b>' + s[0] + '</b><span>' + s[1] + '초</span></div><small>' + s[2] + ' · ' + s[3] + '</small>' +
          '<div class="w-card-acts">' + B('고치기', 'S2', 'sm') + B('다시 그리기', 'S3', 'sm') + '</div></div>';
      }).join('') + '</div><p class="w-note">END 샷은 없어요. 마지막 샷이 끝이에요.</p>';
    return studio({ on: 'Storyboard', done: ['Producer', 'Artist'], main: main, chatGo: 'S3', chat: [['Storyboard', '씬 2개를 샷 6개로 나눴어요. 지금 약 ' + total + '초예요.']] }) + (extra || '');
  }
  function S0() { return S1(busy('씬·샷을 나누고 러프를 그리고 있어요', ['씬 촬영 계획', '샷 나누기', '샷 설계 · 대사', '러프 그리기'], 'S1', 2)); }
  function S2() {
    return S1(modal('S2-2 고치기', list([['길이', '3초 ▾'], ['카메라', '미디엄 · 고정 ▾'], ['인물', '팀장 · 기본']]) +
      '<div class="w-q"><div class="w-q-t">대사 <small>직접 쓴 대사는 그대로 보존돼요</small></div><div class="w-line"><b>팀장</b><span>"고마워."</span>' + opts(['한', '영'], 0) + '</div></div>',
      B('취소', 'S1') + B('적용하고 다시 그리기', 'S3', 'acc'), true));
  }
  function S3() { return S1(busy('샷을 다시 그리고 있어요', null, 'S1')); }
  function S4() {
    return S1(modal('샷 추가', '<div class="w-q"><div class="w-q-t">어디에</div>' + opts(['S2-2 뒤', 'S2-3 뒤'], 0) + '</div>' +
      '<div class="w-q"><div class="w-q-t">인물 <small>지금 목록에서만 골라요</small></div>' + opts(['민호 · 기본', '민호 · 얼룩', '팀장 · 기본'], 1) + '</div>' +
      '<div class="w-q"><div class="w-q-t">배경</div>' + opts(['회사 복도 자판기 앞'], 0) + '</div>' +
      '<button class="w-link" data-go="R3">목록에 없는 인물·배경이 필요해요</button>',
      B('취소', 'S1') + B('추가하고 그리기', 'S3', 'acc'), true));
  }
  function R3() {
    return S1(modal('산문으로 돌아갈까요?', '<p>새 인물·배경은 산문에 넣어야 생겨요. 돌아가면 산문 → 브레이크다운 → Artist → 씬·샷을 다시 거쳐요.</p>' +
      list([['영향받는 것', '샷 6 · 러프 18장 (개발 확인: 바뀌지 않은 샷 유지 여부)'], ['그대로인 것', '🔒 화면 비율 · 🔒 스타일'], ['예상 크레딧', '표시 자리']]),
      B('아니오', 'S4') + B('예, 산문으로', 'P1', 'warn')));
  }
  function S5() {
    return S1(modal('상태 추가', '<p>기본 모습에서 파생된 상태를 더해요. 롤백 없이 돼요.</p>' +
      '<div class="w-q"><div class="w-q-t">누구</div>' + opts(['민호', '팀장', '회사 복도 자판기 앞'], 0) + '</div>' +
      '<div class="w-q"><div class="w-q-t">어떤 상태</div><div class="w-ta sm">10년 뒤, 머리가 희끗한 민호</div></div>' +
      '<div class="w-q"><div class="w-q-t">어느 샷에 쓸까요</div>' + opts(['나중에 고르기', 'S2-3'], 0) + '</div>',
      B('취소', 'S1') + B('상태 만들기', 'S6', 'acc'), true));
  }
  function S6() { return S1(busy('상태 시트를 만들고 있어요', null, 'S1')); }
  function S7() {
    return S1(modal('Director로 넘길까요?', list([['넘어가는 것', '샷 6 · 러프 · 인물 시트 · 배경'], ['다음', 'Director가 시트를 참조해 실사 컷을 만들어요']]),
      B('아니오', 'S1') + B('예, 넘기기', 'D1', 'pri')));
  }
  function D1() {
    return bar({ rail: rail('Director', ['Producer', 'Artist', 'Storyboard']) }) + '<div class="w-entry"><h3>Director → Editor</h3><p class="w-mut">이번 축소 범위 밖이에요. 기존 화면을 그대로 써요.</p>' +
      '<p class="w-note">함께 확인: Director가 Artist 인물 시트를 참조하는지 (오류 13), 러프 마네킹이 인물로 이어지지 않는지 (오류 12).</p></div>';
  }

  window.SCREENS = {
    E1: function () { return E1(false); }, E1f: function () { return E1(true); }, E1m: E1m, E2: E2, E3: E3, E4: E4, E5: E5,
    P1: P1, P1r: P1r, P2: P2, P3: P3, P4: P4, P5: P5, P6: P6,
    A0: A0, A1: function () { return A1(); }, R1: R1, A2: function () { return A2(); }, A3: A3, A4: A4, A5: function () { return A5(); }, A6: A6, A7: A7, A8: A8, R2: R2, A9: A9,
    S0: S0, S1: function () { return S1(); }, S2: S2, S3: S3, S4: S4, R3: R3, S5: S5, S6: S6, S7: S7, D1: D1,
  };
  window.SCREEN_ALIAS = { E1f: 'E1' };
  window.setKind = function (k) { if (KINDS[k]) kind = k; };
  window.cycleKind = function () { var ks = Object.keys(KINDS); kind = ks[(ks.indexOf(kind) + 1) % ks.length]; };
})();
