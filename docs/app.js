(function () {
  'use strict';
  var G = window.GUIDE;
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  var WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
  function word(n) { return n <= 10 ? WORDS[n] : String(n); }
  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
  var narrowMQ = matchMedia('(max-width: 879px)');
  function narrow() { return narrowMQ.matches; }
  function tierOf(id) { return G.tiers.filter(function (t) { return t.id === id; })[0]; }

  /* ---------- sources ---------- */
  var DOCNAME = { EX: 'Excavator manual', SV: 'Survey manual', WL: 'Wheel loader manual', RN: 'Release notes' };
  function pageUrl(d, p) {
    var u = G.sources[d].url;
    return d === 'RN' || !p ? u : u + '#page=' + p;
  }
  /* short label under a ladder row: "p. 13, 143, 172 · notes 2.33.5" */
  function shortRefs(src) {
    var by = {}, order = [];
    src.forEach(function (s) { if (!by[s[0]]) { by[s[0]] = []; order.push(s[0]); } if (s[1]) by[s[0]].push(s[1]); });
    return order.map(function (d) {
      var ps = by[d];
      if (d === 'EX') return 'p. ' + ps.join(', ');
      if (d === 'RN') return ps.length ? 'notes ' + ps.join(', ') : 'release notes';
      return (d === 'SV' ? 'Survey' : 'Wheel loader') + ' p. ' + ps.join(', ');
    }).join(' · ');
  }
  /* linked references for the "why" of a question */
  function linkRefs(src) {
    if (!src || !src.length) return '';
    return ' (' + src.map(function (s) {
      var d = s[0], p = s[1];
      var label = d === 'RN' ? (p ? 'release notes ' + p : 'release notes') : (d === 'EX' ? 'p. ' + p : DOCNAME[d] + ', p. ' + p);
      return '<a href="' + pageUrl(d, p) + '" target="_blank" rel="noopener">' + label + '</a>';
    }).join('; ') + ')';
  }
  function quoteHTML(q) {
    var label = q.d === 'RN' ? 'Release notes, version ' + q.p : DOCNAME[q.d] + ', p. ' + q.p;
    return '<p><q>' + esc(q.t) + '</q> <a href="' + pageUrl(q.d, q.p) + '" target="_blank" rel="noopener">' + label + '</a></p>';
  }
  var GTAG = '<span class="gtag">general practice, not Makin\'s procedure</span>';
  function meansHTML(m) {
    return '<ul class="means">' + m.map(function (x) {
      return '<li' + (x.g ? ' class="g"' : '') + '>' + esc(x.t) + (x.g ? ' ' + GTAG : '') + '</li>';
    }).join('') + '</ul>';
  }
  function askHTML(t) {
    return '<ol class="askl">' + t.ask.map(function (a) {
      return '<li><b>' + esc(a.q) + '</b><span class="why">' + esc(a.why) + linkRefs(a.src) + '</span>' + (a.g ? ' ' + GTAG : '') + '</li>';
    }).join('') + '</ol>';
  }
  function quotesBlock(s) {
    if (!s.quotes || !s.quotes.length) return '';
    return '<div class="qs">' + s.quotes.map(quoteHTML).join('') + '</div>';
  }

  /* ---------- counts, computed from the step list ---------- */
  var C = {};
  function counts() {
    C.per = G.tickets.map(function (t) {
      var n = t.steps.length;
      var before = t.steps.filter(function (s) { return s.tier <= 3; }).length;
      var tablet = t.steps.filter(function (s) { return s.tier === 1; }).length;
      return { n: n, before: before, tablet: tablet };
    });
    var steps = [], lines = 0, gen = 0, quotes = 0, pages = {};
    G.tickets.forEach(function (t) {
      t.ask.forEach(function (a) { lines++; if (a.g) gen++; });
      t.steps.forEach(function (s) {
        steps.push(s);
        s.means.forEach(function (m) { lines++; if (m.g) gen++; });
        quotes += (s.quotes || []).length;
        s.src.forEach(function (r) { if (r[0] === 'EX') pages[r[1]] = 1; });
      });
    });
    C.steps = steps.length;
    C.cited = steps.filter(function (s) { return s.src && s.src.length; }).length;
    C.lines = lines; C.gen = gen; C.quotes = quotes; C.pages = Object.keys(pages).length;
  }
  function fillNumbers() {
    var a = C.per[0], b = C.per[1];
    var same = a.before === b.before && a.n === b.n;
    var N = {
      beforeTech: (same ? 'In both tickets, ' + a.before + ' of the ' + a.n + ' checks come before that point.' :
        'In ticket one ' + a.before + ' of ' + a.n + ' checks come before that point, and in ticket two ' + b.before + ' of ' + b.n + '.') +
        ' The rest are technician work and the escalation to Makin.',
      tabletOnly: 'Ticket one has ' + a.tablet + ' such checks and ticket two has ' + b.tablet + '. They are the first rows of each list, and the machine does not have to move for them.',
      share: (C.cited === C.steps ? 'All ' + C.steps + ' steps cite' : C.cited + ' of ' + C.steps + ' steps cite') + ' a page of Makin\'s manuals or release notes. The ' + C.gen + ' lines that are my general practice instead of Makin\'s procedure are each marked.',
      quotes: String(C.quotes)
    };
    $$('[data-n]').forEach(function (e) { var k = e.getAttribute('data-n'); if (N[k] != null) e.textContent = N[k]; });
  }

  /* ---------- the triage ---------- */
  var TI = 0, SEL = -1;
  function T() { return G.tickets[TI]; }
  function rowHTML(i, s) {
    if (i === 0) {
      return '<button class="row ask" data-i="0" aria-pressed="false"><span class="bar"></span><span class="n">?</span><span class="tx"><span class="tt">Ask the distributor first</span><span class="pg">' + word(T().ask.length) + ' questions</span></span></button>';
    }
    var only = s.only ? '<span class="only">' + s.only + ' only</span>' : '';
    return '<button class="row" data-i="' + i + '" aria-pressed="false" style="--tc:var(--t' + s.tier + ')"><span class="bar"></span><span class="n">' + i + '</span><span class="tx"><span class="tt">' + esc(s.title) + only + '</span><span class="pg">' + shortRefs(s.src) + '</span></span></button>';
  }
  function renderLadder() {
    var t = T(), c = C.per[TI], h = '';
    h += '<div class="tgroup" data-g="0"><div class="tlab"><i style="border:1.5px dashed var(--soft)"></i>Before any check <em>for the distributor</em></div>' + rowHTML(0) + '</div>';
    var cur = null;
    t.steps.forEach(function (s, k) {
      if (s.tier !== cur) {
        if (cur !== null) h += '</div>';
        if (s.tier === 4) h += '<div class="cut">Technician work starts below this line. ' + cap(word(c.before)) + ' of ' + word(c.n) + ' checks come before it.</div>';
        var tr = tierOf(s.tier);
        h += '<div class="tgroup" data-g="' + s.tier + '"><div class="tlab"><i style="background:var(--t' + s.tier + ')"></i>' + tr.name + ' <em>' + tr.cost + '</em></div>';
        cur = s.tier;
      }
      h += rowHTML(k + 1, s);
    });
    h += '</div>';
    var lad = $('#ladder');
    var panel = $('#panel');
    $('.tri').appendChild(panel); /* take the panel out before the ladder is rewritten */
    lad.innerHTML = h;
    $$('.row', lad).forEach(function (b) { b.addEventListener('click', function () { select(+b.getAttribute('data-i'), true); }); });
    $('#laddersay').textContent = cap(word(c.before)) + ' of ' + word(c.n) + ' checks for this ticket come before anyone recalibrates or repairs anything, and ' + word(c.tablet) + ' of them need nothing but the tablet.';
  }
  function panelHTML(i) {
    var t = T(), n = t.steps.length, h = '';
    if (i === 0) {
      h += '<div class="pk">Before any check · ' + esc(t.title) + '</div><h3>Ask the distributor first</h3>';
      h += '<p style="color:var(--soft);font-size:15px">' + esc(t.summary) + '</p>';
      h += askHTML(t);
      h += '<div class="pnav"><button class="btn primary" data-go="1">Step 1: ' + esc(t.steps[0].title) + '</button></div>';
      return h;
    }
    var s = t.steps[i - 1], tr = tierOf(s.tier);
    h += '<div id="panelhead"><div class="pk">Step ' + i + ' of ' + n + ' · ' + tr.name + (s.only ? ' · ' + s.only + ' only' : '') + '</div>';
    h += '<h3>' + esc(s.title) + '</h3><p>' + esc(s.check) + '</p></div>';
    h += '<div class="ml">What the result means</div>' + meansHTML(s.means);
    if (s.calc) h += '<p style="margin:4px 0 0"><a href="#calc">Put the readings into the calculator</a></p>';
    h += quotesBlock(s);
    h += '<div class="pnav"><button class="btn" data-go="' + (i - 1) + '">' + (i === 1 ? 'Questions' : 'Previous step') + '</button>' +
      (i < n ? '<button class="btn primary" data-go="' + (i + 1) + '">Next step</button>' : '') + '</div>';
    return h;
  }
  function placePanel() {
    var panel = $('#panel');
    if (SEL < 0) { panel.style.display = 'none'; $('.tri').appendChild(panel); return; }
    panel.style.display = '';
    if (narrow()) {
      var row = $('#ladder .row[data-i="' + SEL + '"]');
      row.parentNode.insertBefore(panel, row.nextSibling);
      panel.classList.add('inline');
    } else {
      $('.tri').appendChild(panel);
      panel.classList.remove('inline');
    }
  }
  function select(i, user) {
    SEL = i;
    $$('#ladder .row').forEach(function (b) { b.setAttribute('aria-pressed', String(+b.getAttribute('data-i') === i)); });
    var panel = $('#panel');
    if (i >= 0) {
      panel.innerHTML = panelHTML(i);
      $$('[data-go]', panel).forEach(function (b) { b.addEventListener('click', function () { select(+b.getAttribute('data-go'), true); }); });
    }
    placePanel();
    if (user && i >= 0) {
      var target = narrow() ? $('#ladder .row[data-i="' + i + '"]') : panel;
      var r = target.getBoundingClientRect();
      if (r.top < 0 || r.top > innerHeight * 0.6) window.scrollTo({ top: r.top + scrollY - 12, behavior: 'smooth' });
    }
  }
  function renderChips() {
    var box = $('#ticketchips');
    box.innerHTML = G.tickets.map(function (t, k) { return '<button class="chip" data-t="' + k + '" aria-pressed="' + (k === TI) + '">' + esc(t.chip) + '</button>'; }).join('');
    $$('.chip', box).forEach(function (b) {
      b.addEventListener('click', function () {
        TI = +b.getAttribute('data-t');
        $$('.chip', box).forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
        renderLadder();
        select(narrow() ? -1 : 0, false);
      });
    });
    $('#tierlegend').innerHTML = G.tiers.map(function (t) { return '<span><i style="background:var(--t' + t.id + ')"></i>' + t.name + '</span>'; }).join('') +
      '<span><i style="border:1px dashed var(--soft);width:22px;height:12px"></i>general practice tag: my addition, not Makin\'s procedure</span>';
  }

  /* ---------- each ticket in full ---------- */
  function renderFull() {
    G.tickets.forEach(function (t, k) {
      var id = 't' + (k + 1);
      $('#' + id + 'title').textContent = t.title;
      $('#' + id + 'lede').textContent = t.summary;
      $('#' + id + 'count').textContent = word(t.ask.length) + ' questions, then ' + word(t.steps.length) + ' checks, cheapest first';
      var h = '<div class="askbox"><div class="pk">Before any check</div><h3>Ask the distributor first</h3>' + askHTML(t) + '</div>';
      t.steps.forEach(function (s, j) {
        var tr = tierOf(s.tier);
        h += '<article class="stepcard" id="' + id + '-s' + (j + 1) + '" style="--tc:var(--t' + s.tier + ')"><span class="bar"></span><div>' +
          '<div class="pk">Step ' + (j + 1) + ' of ' + t.steps.length + ' · ' + tr.name + (s.only ? ' · ' + s.only + ' only' : '') + '</div>' +
          '<h3>' + esc(s.title) + '</h3><p>' + esc(s.check) + '</p><div class="ml">What the result means</div>' + meansHTML(s.means) +
          (s.calc ? '<p style="margin:4px 0 0"><a href="#calc">Put the readings into the calculator</a></p>' : '') +
          quotesBlock(s) + '</div></article>';
      });
      $('#' + id + 'body').innerHTML = h;
    });
  }

  /* ---------- the machine drawing ---------- */
  var BOX = {
    tip: [452, 240, 30, 30], antenna: [158, 116, 38, 76], receiver: [250, 154, 32, 22], corr: [10, 146, 112, 120],
    arm: [316, 132, 152, 82], body: [200, 196, 28, 26], box: [276, 128, 40, 56]
  };
  function drawMachine() {
    var P = 'var(--posn)', A = 'var(--geo)';
    var s = '<svg viewBox="0 0 496 290" role="img" aria-label="Schematic excavator with the parts of a machine control system">';
    s += '<line x1="0" y1="264" x2="496" y2="264" stroke="#c9c5be" stroke-width="1.5"/>';
    /* satellites and their signals, decoration of the position chain */
    s += '<g stroke="' + P + '" stroke-width="1.2" stroke-dasharray="4 4" fill="none"><line x1="70" y1="40" x2="176" y2="128"/><line x1="200" y1="30" x2="178" y2="126"/></g>';
    [[70, 34], [200, 24]].forEach(function (c) {
      s += '<g transform="translate(' + c[0] + ',' + c[1] + ') rotate(-20)"><rect x="-5" y="-4" width="10" height="8" rx="1.5" fill="' + P + '"/><rect x="-19" y="-2.5" width="12" height="5" fill="none" stroke="' + P + '" stroke-width="1.4"/><rect x="7" y="-2.5" width="12" height="5" fill="none" stroke="' + P + '" stroke-width="1.4"/></g>';
    });
    s += '<text x="12" y="20" style="font:600 12px var(--mono);fill:' + P + ';letter-spacing:.06em">POSITION</text>';
    /* machine body */
    s += '<rect x="145" y="236" width="168" height="27" rx="13" fill="#e8e5e0" stroke="#8b95a1" stroke-width="1.5"/>';
    for (var w = 160; w <= 298; w += 23) s += '<circle cx="' + w + '" cy="249.5" r="6" fill="#fff" stroke="#8b95a1" stroke-width="1.2"/>';
    s += '<rect x="185" y="228" width="96" height="9" fill="#d6d2cb"/>';
    s += '<path d="M138 228 L322 228 L322 188 L168 188 Q138 188 138 210 Z" fill="#efece7" stroke="#8b95a1" stroke-width="1.5"/>';
    s += '<path d="M248 188 L248 128 Q248 122 254 122 L294 122 L318 152 L318 188 Z" fill="#efece7" stroke="#8b95a1" stroke-width="1.5"/>';
    s += '<path d="M256 131 L290 131 L309 155 L256 155 Z" fill="#fff" stroke="#b9b4ac" stroke-width="1"/>';
    /* boom, stick, bucket */
    s += '<polyline points="308,192 372,98 428,110" fill="none" stroke="#c4bfb7" stroke-width="13" stroke-linecap="round" stroke-linejoin="round"/>';
    s += '<line x1="428" y1="110" x2="452" y2="214" stroke="#c4bfb7" stroke-width="9" stroke-linecap="round"/>';
    s += '<path d="M446 206 Q476 206 480 238 L470 258 L452 251 Q440 236 446 206 Z" fill="#d6d2cb" stroke="#8b95a1" stroke-width="1.5"/>';
    s += '<text x="372" y="84" style="font:600 12px var(--mono);fill:' + A + ';letter-spacing:.06em" text-anchor="middle">GEOMETRY</text>';
    /* corrections: base station and mobile network */
    s += '<g class="hit" data-part="corr"><rect x="10" y="146" width="112" height="120" fill="transparent"/>';
    s += '<g stroke="#5b6470" stroke-width="2" fill="none"><line x1="38" y1="214" x2="24" y2="263"/><line x1="38" y1="214" x2="52" y2="263"/><line x1="38" y1="214" x2="38" y2="263"/><line x1="38" y1="204" x2="38" y2="186"/>';
    s += '<path d="M88 263 L100 160 L112 263 M93.5 222 L106.5 222 M96.5 192 L103.5 192"/></g>';
    s += '<rect x="31" y="204" width="14" height="10" rx="2" fill="#5b6470"/><ellipse cx="38" cy="184" rx="9" ry="3" fill="' + P + '"/><circle cx="100" cy="156" r="4" fill="' + P + '"/>';
    s += '<g stroke="' + P + '" stroke-width="1.4" stroke-dasharray="1.5 4" fill="none" stroke-linecap="round"><path d="M46 180 Q110 140 172 132"/><path d="M106 154 Q200 120 296 146"/></g></g>';
    /* antenna */
    s += '<g class="hit" data-part="antenna"><rect x="158" y="116" width="38" height="76" fill="transparent"/><line x1="177" y1="188" x2="177" y2="136" stroke="#5b6470" stroke-width="3"/><ellipse cx="177" cy="132" rx="13" ry="4.5" fill="' + P + '"/><path d="M168 131 Q177 121 186 131" fill="' + P + '"/></g>';
    /* receiver, interface box, tablet in the cab */
    s += '<g class="hit" data-part="receiver"><rect x="250" y="154" width="32" height="22" fill="transparent"/><rect x="258" y="160" width="17" height="11" rx="2" fill="' + P + '"/></g>';
    s += '<g class="hit" data-part="box"><rect x="276" y="128" width="40" height="56" fill="transparent"/><rect x="284" y="166" width="16" height="11" rx="2" fill="#5b6470"/><rect x="296" y="137" width="11" height="15" rx="1.5" fill="#1a1d21" transform="rotate(-12 301 144)"/></g>';
    /* angle sensors */
    s += '<g class="hit" data-part="arm"><rect x="316" y="132" width="152" height="82" fill="transparent"/><rect x="333" y="146" width="10" height="10" rx="2" fill="' + A + '"/><rect x="432" y="146" width="10" height="10" rx="2" fill="' + A + '"/><rect x="447" y="193" width="10" height="10" rx="2" fill="' + A + '"/></g>';
    s += '<g class="hit" data-part="body"><rect x="200" y="196" width="28" height="26" fill="transparent"/><rect x="209" y="204" width="10" height="10" rx="2" fill="' + A + '"/></g>';
    /* bucket tip */
    s += '<g class="hit" data-part="tip"><rect x="452" y="240" width="30" height="30" fill="transparent"/><circle cx="469" cy="257" r="5" fill="#1a1d21"/></g>';
    s += '<rect id="selbox" fill="none" stroke="#1a1d21" stroke-width="2" rx="6"/><text id="sellab" style="font:500 13px var(--sans);fill:#1a1d21" text-anchor="middle"></text>';
    s += '</svg>';
    $('#drawing').innerHTML = s;
    $$('#drawing .hit').forEach(function (g) { g.addEventListener('click', function () { selectPart(g.getAttribute('data-part')); }); });
    var chips = $('#partchips');
    chips.innerHTML = G.parts.map(function (p) { return '<button class="chip" data-p="' + p.id + '" aria-pressed="false">' + esc(p.name) + '</button>'; }).join('');
    $$('.chip', chips).forEach(function (b) { b.addEventListener('click', function () { selectPart(b.getAttribute('data-p')); }); });
  }
  function selectPart(id) {
    var p = G.parts.filter(function (x) { return x.id === id; })[0];
    $$('#partchips .chip').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-p') === id)); });
    var b = BOX[id], sb = $('#selbox'), sl = $('#sellab');
    sb.setAttribute('x', b[0]); sb.setAttribute('y', b[1]); sb.setAttribute('width', b[2]); sb.setAttribute('height', b[3]);
    var lx = Math.max(60, Math.min(420, b[0] + b[2] / 2)), ly = b[1] - 7;
    var anchor = 'middle';
    if (id === 'arm') { lx = 392; ly = b[1] + b[3] + 16; }
    if (id === 'tip') { lx = b[0] - 8; ly = b[1] + b[3] / 2 + 5; anchor = 'end'; }
    sl.setAttribute('x', lx); sl.setAttribute('y', ly); sl.setAttribute('text-anchor', anchor); sl.textContent = p.name;
    var chain = p.chain === 'position' ? '<span class="chainlab" style="background:var(--posn)">position chain</span>' :
      p.chain === 'geometry' ? '<span class="chainlab" style="background:var(--geo)">geometry chain</span>' :
        '<span class="chainlab" style="background:#5b6470">both chains</span>';
    $('#partread').innerHTML = '<b>' + esc(p.name) + '</b>' + chain + '<br>' + esc(p.does) + ' <span style="color:var(--soft)">' + esc(p.checks) + '</span>';
  }

  /* ---------- the calculator ---------- */
  var ROWS = [
    { k: 'open', label: 'Open bucket', short: 'Open', ref: 'the open bucket' },
    { k: 'closed', label: 'Closed bucket', short: 'Closed', ref: 'the closed bucket' },
    { k: 'tl', label: 'Full tilt left', short: 'Tilt L', ref: 'the bucket at full tilt left' },
    { k: 'tr', label: 'Full tilt right', short: 'Tilt R', ref: 'the bucket at full tilt right' }
  ];
  var KNOWN = [6136250.000, 589410.000, 14.250];
  var EX = {
    a: { label: 'Within tolerance', tilt: false, v: { open: [6136250.008, 589409.990, 14.262], closed: [6136249.995, 589410.011, 14.243] } },
    b: { label: 'Same height error open and closed', tilt: false, v: { open: [6136250.006, 589410.004, 14.297], closed: [6136250.003, 589409.995, 14.301] } },
    c: { label: 'Open and closed disagree', tilt: false, v: { open: [6136250.004, 589410.006, 14.236], closed: [6136250.021, 589409.991, 14.297] } },
    d: { label: 'Only the tilted readings miss', tilt: true, v: { open: [6136250.008, 589409.990, 14.262], closed: [6136249.995, 589410.011, 14.243], tl: [6136250.031, 589410.012, 14.262], tr: [6136249.990, 589410.008, 14.244] } }
  };
  function buildInputs() {
    $$('.xyz[data-r]').forEach(function (box) {
      var r = box.getAttribute('data-r');
      box.innerHTML = [['n', 'North, m'], ['e', 'East, m'], ['h', 'Height, m']].map(function (f) {
        return '<label class="fld"><span>' + f[1] + '</span><input id="' + r + '-' + f[0] + '" inputmode="decimal" autocomplete="off" spellcheck="false"></label>';
      }).join('');
    });
    $$('#calccard input').forEach(function (i) { i.addEventListener('input', function () { markCustom(); calc(); }); });
    $('#tilton').addEventListener('change', function () { $('#tiltrows').hidden = !this.checked; markCustom(); calc(); });
    var chips = $('#exchips');
    chips.innerHTML = Object.keys(EX).map(function (k) { return '<button class="chip" data-x="' + k + '" aria-pressed="false">Example: ' + esc(EX[k].label) + '</button>'; }).join('');
    $$('.chip', chips).forEach(function (b) { b.addEventListener('click', function () { loadExample(b.getAttribute('data-x')); }); });
  }
  function markCustom() { $$('#exchips .chip').forEach(function (b) { b.setAttribute('aria-pressed', 'false'); }); }
  function setVal(id, v) { $('#' + id).value = v == null ? '' : v; }
  function loadExample(k) {
    var e = EX[k];
    ['n', 'e', 'h'].forEach(function (f, j) { setVal('known-' + f, KNOWN[j].toFixed(3)); });
    ROWS.forEach(function (r) {
      var v = e.v[r.k];
      ['n', 'e', 'h'].forEach(function (f, j) { setVal(r.k + '-' + f, v ? v[j].toFixed(3) : ''); });
    });
    setVal('tolh', '3.0'); setVal('tolv', '3.0'); setVal('dop', '0.9');
    $('#tilton').checked = e.tilt; $('#tiltrows').hidden = !e.tilt;
    $$('#exchips .chip').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-x') === k)); });
    calc();
  }
  function rd(id) {
    var s = ($('#' + id).value || '').trim().replace(/\s/g, '').replace(',', '.');
    if (s === '') return NaN;
    var x = Number(s);
    return isFinite(x) ? x : NaN;
  }
  function r2(x) { return Math.round(x * 100) / 100; }
  function f1(x) { return (Math.round(x * 10) / 10).toFixed(1); }
  function sgn(x) { var v = Math.round(x * 10) / 10; return (v > 0 ? '+' : v < 0 ? '−' : '') + Math.abs(v).toFixed(1); }

  function calc() {
    var K = { n: rd('known-n'), e: rd('known-e'), h: rd('known-h') };
    var tolH = rd('tolh'), tolV = rd('tolv'), dop = rd('dop');
    var tilt = $('#tilton').checked;
    var res = [];
    ROWS.forEach(function (r) {
      if (!tilt && (r.k === 'tl' || r.k === 'tr')) return;
      var n = rd(r.k + '-n'), e = rd(r.k + '-e'), h = rd(r.k + '-h');
      if (!isFinite(h) || !isFinite(K.h)) return;
      var dN = (n - K.n) * 100, dE = (e - K.e) * 100, hasH = isFinite(dN) && isFinite(dE);
      var horiz = hasH ? r2(Math.hypot(dN, dE)) : null, dV = r2((h - K.h) * 100);
      var okH = horiz === null || !(tolH >= 0) ? true : horiz <= tolH;
      var okV = !(tolV >= 0) ? true : Math.abs(dV) <= tolV;
      res.push({ r: r, dN: hasH ? dN : null, dE: hasH ? dE : null, horiz: horiz, dV: dV, okH: okH, okV: okV, ok: okH && okV });
    });
    drawTop(res, tolH); drawHeight(res, tolV); table(res); verdict(res, tolH, tolV, dop);
  }
  function table(res) {
    var h = '<thead><tr><th>Reading</th><th>Horizontal, cm</th><th>Height, cm</th><th>Within tolerance</th></tr></thead><tbody>';
    res.forEach(function (x) {
      h += '<tr><td>' + x.r.label + '</td><td>' + (x.horiz === null ? 'not entered' : f1(x.horiz)) + '</td><td>' + sgn(x.dV) + '</td><td class="' + (x.ok ? 'ok' : 'bad') + '">' + (x.ok ? 'yes' : 'no') + '</td></tr>';
    });
    if (!res.length) h += '<tr><td colspan="4">Enter the known point and at least one reading.</td></tr>';
    $('#calctable').innerHTML = h + '</tbody>';
  }
  function verdict(res, tolH, tolV, dop) {
    var v = $('#calcverdict'), say = $('#calcsay'), out = [];
    v.className = 'verdict';
    if (!(tolV >= 0) || !(tolH >= 0)) { v.innerHTML = '<p class="first">Enter a horizontal and a height tolerance to get a verdict.</p>'; say.textContent = 'A verdict needs a tolerance, and the manual does not give one.'; return; }
    if (!res.length) { v.innerHTML = '<p class="first">Enter the known point and at least one reading.</p>'; say.textContent = 'Nothing to judge yet.'; return; }
    var bad = res.filter(function (x) { return !x.ok; });
    var worst = null, wr = -1, wdim = '';
    res.forEach(function (x) {
      var rh = x.horiz === null || !tolH ? 0 : x.horiz / Math.max(tolH, 1e-9), rv = Math.abs(x.dV) / Math.max(tolV, 1e-9);
      if (rh > wr) { wr = rh; worst = x; wdim = 'h'; }
      if (rv > wr) { wr = rv; worst = x; wdim = 'v'; }
    });
    if (!bad.length) {
      v.classList.add('okv');
      out.push('<p class="first">The calibration is correct: every reading is within the tolerance of the known point.</p>');
      out.push('<p>That is the manual\'s test: a reading "within a few centimetres of the target" means the calibration is correct (Excavator manual, p. 173), with the tolerance you entered standing in for "a few".</p>');
      say.textContent = 'Every reading is within the tolerance, so by Makin\'s check the calibration is correct.';
    } else {
      v.classList.add('badv');
      var x = worst, what;
      if (wdim === 'v') what = x.r.ref + ' reads ' + f1(Math.abs(x.dV)) + ' cm ' + (x.dV > 0 ? 'above' : 'below') + ' the known point, against a ' + f1(tolV) + ' cm tolerance';
      else what = x.r.ref + ' lands ' + f1(x.horiz) + ' cm from the known point, against a ' + f1(tolH) + ' cm tolerance';
      out.push('<p class="first">Recalibrate: ' + what + '.</p>');
      out.push('<p>Outside the tolerance, the manual\'s answer is to recalibrate (Excavator manual, p. 173). Recalibrating the bucket is step 8 of ticket one, after the cheaper checks.</p>');
      var vw = res.slice().sort(function (p, q) { return Math.abs(q.dV) - Math.abs(p.dV); })[0];
      if (!vw.okV) out.push('<p>In grading terms: the tablet places ' + vw.r.ref + ' ' + f1(Math.abs(vw.dV)) + ' cm too ' + (vw.dV > 0 ? 'high, so work to this calibration would end about ' + f1(vw.dV) + ' cm too deep.' : 'low, so work to this calibration would stop about ' + f1(-vw.dV) + ' cm too high and leave material.') + '</p>');
      out.push('<p><b>Where to look first.</b> ' + pattern(res, tolH, tolV) + ' <span class="gtag">my rule of thumb, not Makin\'s procedure</span></p>');
      say.textContent = cap(worst.r.ref) + ' misses by more than the tolerance, so by Makin\'s check the bucket needs recalibrating, and the pattern under the table says where to look before doing it.';
    }
    if (!isFinite(dop)) out.push('<p>No DOP entered. The manual asks for a DOP as close to 1.0 or below as possible during the check (p. 172).</p>');
    else if (dop > 1.0) out.push('<p>The DOP of ' + dop + ' is above the manual\'s guidance of 1.0 or below (p. 172). If the result is close to the tolerance, repeat the check when the DOP is lower.</p>');
    v.innerHTML = out.join('');
  }
  function pattern(res, tolH, tolV) {
    var by = {}; res.forEach(function (x) { by[x.r.k] = x; });
    var o = by.open, c = by.closed;
    if (o && c) {
      var tiltBad = ['tl', 'tr'].some(function (k) { return by[k] && !by[k].ok; });
      if (o.ok && c.ok && tiltBad) return 'Open and closed are within the tolerance and only the tilted readings miss. That points at the tilt sensor or its calibration: read the sensor warning and check the version for the tilt fixes in 2.33.5 and 2.33.7 (ticket one, step 4).';
      var sV = Math.abs(o.dV - c.dV);
      var sH = o.dN === null || c.dN === null ? null : Math.hypot(o.dN - c.dN, o.dE - c.dE);
      var agree = sV <= tolV && (sH === null || sH <= tolH);
      var gap = sH === null ? f1(sV) + ' cm in height' : f1(sV) + ' cm in height and ' + f1(sH) + ' cm across';
      if (agree) return 'Open and closed agree with each other (they differ by ' + gap + '), so the bucket geometry is probably fine and the error sits upstream: check the position (step 1) and any offset (step 3) before recalibrating. If only the height is off and the calibration is otherwise confirmed, the manual\'s project offset exists for that case (p. 72).';
      var over = [];
      if (sV > tolV) over.push(f1(sV) + ' cm in height against a ' + f1(tolV) + ' cm tolerance');
      if (sH !== null && sH > tolH) over.push(f1(sH) + ' cm across against a ' + f1(tolH) + ' cm tolerance');
      return 'Open and closed differ from each other by ' + over.join(' and ') + '. Between the two readings the antenna stays put and the bucket angle changes most, so the bucket calibration or the bucket sensor is the likely cause (ticket one, steps 6 and 8).';
    }
    return 'With only one bucket position entered, the pattern cannot be read. Measure the open and the closed bucket on the same point (p. 172).';
  }
  function tick(t) { var v = Math.round(t * 10) / 10; return (v < 0 ? '\u2212' : '') + Math.abs(v); }
  function svgEl(w, h) { return '<svg viewBox="0 0 ' + w + ' ' + h + '" role="img">'; }
  function niceStep(R) { var c = [0.5, 1, 2, 2.5, 5, 10, 20, 25, 50, 100, 200, 500]; for (var i = 0; i < c.length; i++) if (R / c[i] <= 3.2) return c[i]; return 1000; }
  function drawTop(res, tolH) {
    var W = 320, H = 300, cx = 175, cy = 142, rad = 104;
    var withH = res.filter(function (x) { return x.horiz !== null; });
    var R = Math.max(isFinite(tolH) ? tolH : 0, 1);
    withH.forEach(function (x) { R = Math.max(R, Math.abs(x.dN), Math.abs(x.dE)); });
    R *= 1.3;
    var k = rad / R, st = niceStep(R), s = svgEl(W, H);
    s += '<text class="ttl" x="4" y="14">Seen from above</text>';
    s += '<rect x="' + (cx - rad) + '" y="' + (cy - rad) + '" width="' + 2 * rad + '" height="' + 2 * rad + '" fill="#fff" stroke="#e2e0dc"/>';
    for (var t = -Math.floor(R / st) * st; t <= R + 1e-9; t += st) {
      var px = cx + t * k, py = cy - t * k;
      s += '<line x1="' + px + '" y1="' + (cy - rad) + '" x2="' + px + '" y2="' + (cy + rad) + '" stroke="#efece7"/>';
      s += '<line x1="' + (cx - rad) + '" y1="' + py + '" x2="' + (cx + rad) + '" y2="' + py + '" stroke="#efece7"/>';
      s += '<text x="' + px + '" y="' + (cy + rad + 14) + '" text-anchor="middle">' + tick(t) + '</text>';
      s += '<text x="' + (cx - rad - 5) + '" y="' + (py + 4) + '" text-anchor="end">' + tick(t) + '</text>';
    }
    s += '<line x1="' + (cx - rad) + '" y1="' + cy + '" x2="' + (cx + rad) + '" y2="' + cy + '" stroke="#c9c5be"/><line x1="' + cx + '" y1="' + (cy - rad) + '" x2="' + cx + '" y2="' + (cy + rad) + '" stroke="#c9c5be"/>';
    if (isFinite(tolH) && tolH > 0) {
      s += '<circle cx="' + cx + '" cy="' + cy + '" r="' + tolH * k + '" fill="rgba(47,125,84,.07)" stroke="#2f7d54" stroke-width="1.3" stroke-dasharray="5 4"/>';
      s += '<text x="' + (cx + tolH * k * 0.72 + 4) + '" y="' + (cy - tolH * k * 0.72 - 4) + '" style="fill:#2f7d54">' + f1(tolH) + ' cm</text>';
    }
    s += '<path d="M' + (cx - 5) + ' ' + cy + ' L' + (cx + 5) + ' ' + cy + ' M' + cx + ' ' + (cy - 5) + ' L' + cx + ' ' + (cy + 5) + '" stroke="#1a1d21" stroke-width="2"/>';
    var off = [[9, -8, 'start'], [9, 15, 'start'], [-9, -8, 'end'], [-9, 15, 'end']];
    withH.forEach(function (x, i) {
      var px = cx + x.dE * k, py = cy - x.dN * k, o = off[ROWS.indexOf(x.r)];
      s += '<circle cx="' + px + '" cy="' + py + '" r="6" fill="' + (x.okH ? '#2f7d54' : '#b03a3a') + '" stroke="#fff" stroke-width="1.5"/>';
      s += '<text class="lbl" x="' + (px + o[0]) + '" y="' + (py + o[1]) + '" text-anchor="' + o[2] + '">' + x.r.short + '</text>';
    });
    if (!withH.length) s += '<text class="lbl" x="' + cx + '" y="' + (cy - 12) + '" text-anchor="middle">No north and east entered</text>';
    s += '<text class="ttl" x="' + cx + '" y="' + (H - 6) + '" text-anchor="middle">East error, cm</text>';
    s += '<text class="ttl" transform="translate(16 ' + cy + ') rotate(-90)" text-anchor="middle">North error, cm</text>';
    $('#topview').innerHTML = s + '</svg>';
  }
  function drawHeight(res, tolV) {
    var W = 320, H = 300, x0 = 78, x1 = 312, cy = 142, half = 104;
    var R = Math.max(isFinite(tolV) ? tolV : 0, 1);
    res.forEach(function (x) { R = Math.max(R, Math.abs(x.dV)); });
    R *= 1.3;
    var k = half / R, st = niceStep(R), s = svgEl(W, H);
    s += '<text class="ttl" x="4" y="14">Height error</text>';
    s += '<rect x="' + x0 + '" y="' + (cy - half) + '" width="' + (x1 - x0) + '" height="' + 2 * half + '" fill="#fff" stroke="#e2e0dc"/>';
    for (var t = -Math.floor(R / st) * st; t <= R + 1e-9; t += st) {
      var py = cy - t * k;
      s += '<line x1="' + x0 + '" y1="' + py + '" x2="' + x1 + '" y2="' + py + '" stroke="#efece7"/>';
      s += '<text x="' + (x0 - 5) + '" y="' + (py + 4) + '" text-anchor="end">' + (t > 0 ? '+' : '') + tick(t) + '</text>';
    }
    if (isFinite(tolV) && tolV > 0) {
      s += '<rect x="' + x0 + '" y="' + (cy - tolV * k) + '" width="' + (x1 - x0) + '" height="' + 2 * tolV * k + '" fill="rgba(47,125,84,.07)"/>';
      s += '<line x1="' + x0 + '" y1="' + (cy - tolV * k) + '" x2="' + x1 + '" y2="' + (cy - tolV * k) + '" stroke="#2f7d54" stroke-width="1.3" stroke-dasharray="5 4"/>';
      s += '<line x1="' + x0 + '" y1="' + (cy + tolV * k) + '" x2="' + x1 + '" y2="' + (cy + tolV * k) + '" stroke="#2f7d54" stroke-width="1.3" stroke-dasharray="5 4"/>';
    }
    s += '<line x1="' + x0 + '" y1="' + cy + '" x2="' + x1 + '" y2="' + cy + '" stroke="#1a1d21" stroke-width="1.5"/>';
    var n = res.length, gap = (x1 - x0) / (n + 1);
    res.forEach(function (x, i) {
      var px = x0 + gap * (i + 1), py = cy - x.dV * k;
      s += '<line x1="' + px + '" y1="' + cy + '" x2="' + px + '" y2="' + py + '" stroke="' + (x.okV ? '#2f7d54' : '#b03a3a') + '" stroke-width="2"/>';
      s += '<circle cx="' + px + '" cy="' + py + '" r="6" fill="' + (x.okV ? '#2f7d54' : '#b03a3a') + '" stroke="#fff" stroke-width="1.5"/>';
      s += '<text class="lbl" x="' + (px + 9) + '" y="' + (py + 4) + '">' + sgn(x.dV) + '</text>';
      s += '<text class="lbl" x="' + px + '" y="' + (cy + half + 16) + '" text-anchor="middle">' + x.r.short + '</text>';
    });
    s += '<text class="ttl" transform="translate(16 ' + cy + ') rotate(-90)" text-anchor="middle">Tablet minus known height, cm</text>';
    $('#heightview').innerHTML = s + '</svg>';
  }

  /* ---------- the walkthrough ---------- */
  function tour() {
    var root = $('#tour'), hl = $('.tour-hl', root), card = $('.tour-card', root), idx = 0;
    var reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    var STEPS = [
      { sel: '#ticketchips', k: 'The two tickets · 1 of 7', html: 'This page is a knowledge-base entry for two machine control tickets. <b>Tap Ticket two</b> to switch; the list underneath follows.' },
      { sel: '#ladder .tgroup[data-g="1"]', k: 'The triage · 2 of 7', html: 'One row per check, cheapest first, after the questions to ask the distributor. The shade at the left is the cost class. <b>Tap a row</b> to open it.' },
      { sel: '#panel', selN: '#panelhead', before: function () { if (SEL < 1) select(1, false); }, k: 'One step · 3 of 7', html: 'What to check, what the result means, and the page of Makin\'s manual it comes from. Lines tagged general practice are mine, not Makin\'s procedure. <b>Tap Next step</b> to walk the ticket.' },
      { sel: '#qa', selN: '#qa li:nth-child(3)', k: 'In numbers · 4 of 7', html: 'Questions a reader asks of a guide like this, answered with counts computed in your browser from the step list the page ships.' },
      { sel: '#drawing', k: 'The machine · 5 of 7', html: 'Where the two tickets sit on the machine. <b>Tap a part</b> to see what it does and which steps check it.' },
      { sel: '#calctop', k: 'The calculator · 6 of 7', html: 'Makin\'s calibration check as arithmetic. <b>Tap an example</b>, or type the readings an operator reads out; the plots, the table and the verdict recompute.' },
      { sel: '#kbnext h2', k: 'Next entries · 7 of 7', html: 'Three entries I would add to the knowledge base next, written as suggestions from the public material.' }
    ];
    function place() {
      var st = STEPS[idx];
      if (st.before) st.before();
      var elm = document.querySelector(narrow() && st.selN ? st.selN : st.sel);
      if (!elm) { next(); return; }
      var r = elm.getBoundingClientRect(), sx = window.scrollX, sy = window.scrollY;
      var docTop = r.top + sy, docLeft = r.left + sx;
      root.style.height = document.documentElement.scrollHeight + 'px';
      var maxScroll = Math.max(0, document.documentElement.scrollHeight - innerHeight);
      var target = Math.max(0, Math.min(docTop - 14, maxScroll)), vTop = docTop - target;
      var cw = Math.min(400, innerWidth - 32), ch = 230;
      var fitsRight = r.left + r.width + 18 + cw <= innerWidth - 16;
      var hh = fitsRight ? Math.min(r.height, innerHeight - vTop - 24) : Math.min(r.height, Math.max(110, innerHeight - vTop - ch - 40));
      hl.style.left = (docLeft - 8) + 'px'; hl.style.top = (docTop - 8) + 'px';
      hl.style.width = (r.width + 16) + 'px'; hl.style.height = (hh + 16) + 'px';
      var dots = STEPS.map(function (_, i) { return '<i class="' + (i === idx ? 'on' : '') + '"></i>'; }).join('');
      card.innerHTML = '<div class="tk">' + st.k + '</div><p>' + st.html + '</p><div class="tour-nav"><div class="dots">' + dots + '</div>' +
        (idx > 0 ? '<button class="tour-btn" id="tprev">Back</button>' : '') +
        '<button class="tour-btn" id="tskip">Close</button><button class="tour-btn primary" id="tnext">' + (idx < STEPS.length - 1 ? 'Next' : 'Done') + '</button></div>';
      var cx0, cy0;
      if (fitsRight) { cx0 = docLeft + r.width + 18; cy0 = docTop; }
      else { cx0 = Math.min(docLeft, sx + innerWidth - 16 - cw); cy0 = docTop + hh + 22; }
      card.style.left = Math.max(sx + 16, cx0) + 'px';
      card.style.top = Math.max(target + 16, cy0) + 'px';
      $('#tnext').onclick = next; $('#tskip').onclick = stop;
      var pv = $('#tprev'); if (pv) pv.onclick = function () { idx = Math.max(0, idx - 1); place(); };
      window.scrollTo({ top: target, behavior: reduced ? 'auto' : 'smooth' });
      window.__tourLast = { idx: idx, hlTop: docTop - 8, hlH: hh + 16, cardTop: parseFloat(card.style.top), elH: r.height };
    }
    function next() { if (idx >= STEPS.length - 1) { stop(); return; } idx++; place(); }
    function stop() { root.classList.remove('on'); try { localStorage.setItem('fieldfix-tour', 'seen'); } catch (e) { } }
    function start() { idx = 0; root.classList.add('on'); place(); }
    $('#tourbtn').addEventListener('click', start);
    var replace = function () { if (root.classList.contains('on')) place(); };
    window.addEventListener('resize', replace);
    var seen = false; try { seen = localStorage.getItem('fieldfix-tour') === 'seen'; } catch (e) { }
    if (!seen && location.search.indexOf('tour=off') < 0) setTimeout(start, 900);
    window.__tour = { steps: STEPS.length, go: function (i) { idx = i; root.classList.add('on'); place(); } };
  }

  document.addEventListener('DOMContentLoaded', function () {
    counts(); fillNumbers();
    renderChips(); renderLadder(); select(narrow() ? -1 : 0, false);
    renderFull();
    drawMachine(); selectPart('tip');
    buildInputs(); loadExample('c');
    var wasNarrow = narrow();
    window.addEventListener('resize', function () { if (narrow() !== wasNarrow) { wasNarrow = narrow(); placePanel(); } });
    tour();
  });
})();
