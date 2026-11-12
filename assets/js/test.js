/*
 * IQ Test Lab test engine
 * Flow: intro -> 4 sections (with short breaks) -> confirm -> detailed report.
 * Everything runs in the browser. Progress is saved locally so a refresh never loses work.
 */
(function () {
  'use strict';

  var CFG = window.SITE_CONFIG;
  var Qs = window.IQ_QUESTIONS;
  var Sheet = window.IQSheet;
  var app = document.getElementById('app');
  if (!app || !CFG || !Qs || !Sheet) { return; }

  var N = Qs.length;
  var KEY = 'iqtestlab:session:v1';
  var ORDER = ['patterns', 'numbers', 'words', 'logic'];
  var DOMAINS = {
    patterns: { name: 'Patterns', title: 'Pattern reasoning', what: 'Spotting the rule behind a grid of shapes.',
      intro: 'Each grid follows rules. Work out what changes across rows and columns, then pick the picture that fits.' },
    numbers: { name: 'Numbers', title: 'Number reasoning', what: 'Finding the rule in a sequence of numbers.',
      intro: 'Each sequence follows a rule. Find it and choose the number that comes next. Pen and paper are fine; calculators are not needed.' },
    words: { name: 'Words', title: 'Verbal reasoning', what: 'Understanding how words relate to each other.',
      intro: 'Analogies, odd-one-out and vocabulary. Think about how the words relate, not just what they mean.' },
    logic: { name: 'Logic', title: 'Logical reasoning', what: 'Working out what must be true from the facts given.',
      intro: 'Use only the facts in each question. Choose the answer that must be true, not one that might be.' }
  };
  var BANDS = ['Developing', 'Typical', 'Strong', 'Exceptional'];
  var NARR = {
    patterns: [
      'Visual patterns were the hardest section for you. A reliable method is to name what changes across a row (shape, number, size, rotation or shading) and check one thing at a time.',
      'You solved the clear one-rule grids. Grids where two or three things change at once are where points were lost.',
      'You read visual patterns well and handled most of the multi-rule grids.',
      'You spot visual rules quickly, even when several things change at the same time.'
    ],
    numbers: [
      'Number sequences were the hardest section for you. Try writing the gaps between numbers first, then the gaps between the gaps.',
      'You handled simple steps and doubling. Sequences that mix two rules or interleave two sequences cost you points.',
      'You find number rules reliably, including sequences with growing gaps.',
      'You decode number sequences fluently, including the ones that hide two rules at once.'
    ],
    words: [
      'Word relationships were the hardest section for you. Turning an analogy into a sentence (“A goes with B because…”) helps.',
      'You get everyday word relationships. Less common vocabulary and subtle opposites were harder.',
      'You have a good grip on word relationships and vocabulary.',
      'You handle precise word meanings and abstract relationships with ease.'
    ],
    logic: [
      'Logic puzzles were the hardest section for you. Drawing a quick diagram or ordered list usually makes them much clearer.',
      'You follow direct deductions. Questions that need “must be true” reasoning or several steps were harder.',
      'You reason carefully from facts to conclusions and avoid most traps.',
      'You work through multi-step logic cleanly, including puzzles with contradictions.'
    ]
  };
  var TIPS = {
    patterns: [
      'Predict the missing picture before you look at the options.',
      'List the attributes (shape, count, size, rotation, shading) and track one at a time across each row, then each column.',
      'Practise with matrix and pattern puzzles for ten minutes a day; the skill improves with exposure.'
    ],
    numbers: [
      'Write the differences between neighbours. If those are not constant, write the differences of the differences.',
      'When numbers grow fast, test multiplying, squares and doubling instead of adding.',
      'If the sequence seems to zig-zag, split it into odd and even positions and look at each separately.'
    ],
    words: [
      'Say the relationship out loud as a sentence, then apply the same sentence to the second pair.',
      'Read long-form writing daily and look up every word you cannot define.',
      'For sentence completion, guess the missing word first, then look for the closest option.'
    ],
    logic: [
      'Draw it: circles for “all / some / none” statements and a simple list for rankings.',
      'Test each option by trying to make it false. The right answer is the one you cannot break.',
      'Watch for common traps: “all A are B” does not mean “all B are A”.'
    ]
  };

  var S = null;            // session state
  var qStart = 0;
  var timerId = null;
  var showTimer = true;
  var reduceMotion = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  /* ---------- helpers ---------- */

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function pad2(n) { return (n < 10 ? '0' : '') + n; }
  function mmss(sec) { sec = Math.max(0, Math.round(sec)); return Math.floor(sec / 60) + ':' + pad2(sec % 60); }
  function median(a) {
    if (!a.length) { return 0; }
    var b = a.slice().sort(function (x, y) { return x - y; }), m = Math.floor(b.length / 2);
    return b.length % 2 ? b[m] : (b[m - 1] + b[m]) / 2;
  }
  function erf(x) {
    var s = x < 0 ? -1 : 1; x = Math.abs(x);
    var t = 1 / (1 + 0.3275911 * x);
    var y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x);
    return s * y;
  }
  function cdf(z) { return 0.5 * (1 + erf(z / Math.SQRT2)); }
  function shuffle(a) {
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }
  function tierOf(d) { return d <= 2 ? 'easy' : d === 3 ? 'med' : 'hard'; }
  function tierName(d) { return d <= 2 ? 'Easy' : d === 3 ? 'Medium' : 'Hard'; }
  function plural(n, w) { return n + ' ' + w + (n === 1 ? '' : 's'); }

  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* storage unavailable */ } }
  function load() {
    try {
      var r = JSON.parse(localStorage.getItem(KEY));
      if (r && r.v === 1 && r.ans && r.ans.length === N && Date.now() - r.started < 24 * 3600 * 1000) { return r; }
    } catch (e) { /* ignore */ }
    return null;
  }
  function clearSession() { try { localStorage.removeItem(KEY); } catch (e) { /* ignore */ } }

  function newSession() {
    return {
      v: 1, view: 'q', started: Date.now(), deadline: Date.now() + CFG.testMinutes * 60000,
      i: 0, ans: Qs.map(function () { return null; }), t: Qs.map(function () { return 0; }),
      perm: Qs.map(function (q) { return shuffle(q.options.map(function (_, i) { return i; })); }),
      done: false, timeUp: false, result: null
    };
  }

  function markLeave() {
    if (S && S.view === 'q' && qStart) { S.t[S.i] += Math.round(performance.now() - qStart); }
    qStart = 0;
  }

  function sectionInfo(i) {
    var d = Qs[i].domain, idx = 0, total = 0;
    Qs.forEach(function (q, k) { if (q.domain === d) { total++; if (k <= i) { idx++; } } });
    return { domain: d, idx: idx, total: total, section: ORDER.indexOf(d) + 1 };
  }

  function focusTitle() {
    var el = app.querySelector('[data-focus]');
    if (el) { el.setAttribute('tabindex', '-1'); try { el.focus({ preventScroll: true }); } catch (e) { el.focus(); } }
    window.scrollTo(0, 0);
  }

  /* ---------- scoring ---------- */

  function computeResult() {
    var dom = {}, tiers = { easy: { c: 0, n: 0 }, med: { c: 0, n: 0 }, hard: { c: 0, n: 0 } };
    var answered = 0, correct = 0, total = 0, rows = [], posCount = {}, times = [];
    ORDER.forEach(function (k) { dom[k] = { got: 0, max: 0, correct: 0, n: 0, time: 0 }; });

    Qs.forEach(function (q, i) {
      var k = q.options.length, w = q.d, ch = S.ans[i], ok = ch === q.answer, d = dom[q.domain];
      var t = Math.min(S.t[i] / 1000, 120), tier = tierOf(q.d), pts = 0;
      d.max += w; d.n++; d.time += t; tiers[tier].n++;
      if (ch !== null) {
        answered++;
        var pos = S.perm[i].indexOf(ch);
        posCount[pos] = (posCount[pos] || 0) + 1;
        times.push(t);
        if (ok) { pts = w; correct++; d.correct++; tiers[tier].c++; } else { pts = -w / (k - 1); }
      }
      d.got += pts; total += pts;
      rows.push({ i: i, q: q, ch: ch, ok: ok, t: t });
    });

    total = Math.max(0, total);
    ORDER.forEach(function (k) { dom[k].pct = Math.round(Math.max(0, dom[k].got) / dom[k].max * 100); });

    var iqRaw = 100 + 15 * (total - CFG.norms.mean) / CFG.norms.sd;
    var iq = Math.round(Math.min(145, Math.max(70, iqRaw)));
    var capped = iqRaw >= 145 ? 'high' : iqRaw <= 70 ? 'low' : null;
    var pct = Math.min(99, Math.max(1, Math.round(cdf((iq - 100) / 15) * 100)));

    // Quality checks: warn when the estimate is likely unreliable.
    var notes = [], level = 'good', skipped = N - answered;
    if (skipped > 4) { notes.push('You left ' + plural(skipped, 'question') + ' unanswered, so this estimate is less reliable.'); level = 'low'; }
    else if (S.timeUp && skipped > 0) { notes.push('The time limit ended the test with ' + plural(skipped, 'question') + ' unanswered.'); level = 'moderate'; }
    if (answered >= 10 && median(times) < 4) { notes.push('You answered very quickly (median under 4 seconds per question). Very fast answering often means guessing.'); level = 'low'; }
    var maxPos = 0; Object.keys(posCount).forEach(function (p) { maxPos = Math.max(maxPos, posCount[p]); });
    if (answered >= 12 && maxPos / answered >= 0.7) { notes.push('Most of your answers were in the same position on screen, which can indicate random clicking.'); level = 'low'; }

    var timeTotal = rows.reduce(function (a, r) { return a + r.t; }, 0);
    var id = Math.random().toString(36).slice(2, 6).toUpperCase() + '-' + Math.random().toString(36).slice(2, 6).toUpperCase();

    return {
      id: id, date: Date.now(), score: total, iq: iq, iqRaw: iqRaw, capped: capped, pct: pct,
      low: Math.max(70, iq - CFG.ciHalfWidth), high: Math.min(145, iq + CFG.ciHalfWidth),
      band: bandLabel(iq), answered: answered, skipped: skipped, correct: correct,
      dom: dom, tiers: tiers, rows: rows, timeTotal: timeTotal, timeMedian: median(times),
      quality: { level: level, notes: notes }
    };
  }

  function bandLabel(iq) {
    if (iq >= 130) { return 'Very high range'; }
    if (iq >= 120) { return 'High range'; }
    if (iq >= 110) { return 'Above average'; }
    if (iq >= 90) { return 'Average range'; }
    if (iq >= 80) { return 'Below average'; }
    return 'Low range';
  }
  function bandIdx(p) { return p < 25 ? 0 : p < 50 ? 1 : p < 75 ? 2 : 3; }

  /* ---------- screens ---------- */

  function render() {
    stopTimer();
    if (!S) { return renderIntro(); }
    if (S.view === 'result') { return renderResult(); }
    if (S.view === 'break') { return renderBreak(); }
    if (S.view === 'confirm') { return renderConfirm(); }
    return renderQuestion();
  }

  function renderIntro() {
    app.innerHTML =
      '<div class="intro">' +
      '<h1 data-focus>Free IQ test</h1>' +
      '<p class="lede">24 questions in four sections. Most people finish in 15 to 22 minutes. Your detailed report appears the moment you finish.</p>' +
      '<dl class="facts">' +
      '<div><dt>Sections</dt><dd>Patterns, Numbers, Words, Logic. Six questions each, easy to hard.</dd></div>' +
      '<div><dt>Time</dt><dd>' + CFG.testMinutes + ' minutes in total, shown on screen. You can hide the timer.</dd></div>' +
      '<div><dt>Guessing</dt><dd>If you are unsure, pick your best answer. Scoring adjusts for lucky guesses, so guessing never hurts you on average.</dd></div>' +
      '<div><dt>Saving</dt><dd>Your progress saves on this device, so a refresh will not lose your answers.</dd></div>' +
      '</dl>' +
      '<div class="tips"><h2>For the most accurate result</h2><ul>' +
      '<li>Sit somewhere quiet and take it in one go.</li>' +
      '<li>Do not search for answers or use a calculator. Pen and paper are fine.</li>' +
      '<li>This test is designed for ages 16 and over.</li></ul></div>' +
      '<label class="check"><input type="checkbox" id="opt-timer" checked> Show the countdown timer</label>' +
      '<div class="row"><button type="button" class="btn btn-primary btn-lg" data-act="begin">Begin the test</button>' +
      '<a class="btn btn-ghost" href="how-iq-tests-work.html">How scoring works</a></div>' +
      '<p class="small muted">An online test gives an estimate for curiosity and self-insight. It is not a clinical assessment.</p>' +
      '</div>';
    focusTitle();
  }

  function renderResume() {
    var left = Math.max(0, Math.round((S.deadline - Date.now()) / 1000));
    var answered = S.ans.filter(function (a) { return a !== null; }).length;
    app.innerHTML =
      '<div class="intro"><h1 data-focus>Welcome back</h1>' +
      '<p class="lede">You have answered ' + answered + ' of ' + N + ' questions. ' +
      (left > 0 ? 'Time left: <strong>' + mmss(left) + '</strong>.' : 'The time limit has passed.') + '</p>' +
      '<div class="row">' +
      (left > 0 ? '<button type="button" class="btn btn-primary btn-lg" data-act="resume">Continue the test</button>'
        : '<button type="button" class="btn btn-primary btn-lg" data-act="finish-now">See my results</button>') +
      '<button type="button" class="btn btn-ghost" data-act="restart">Start over</button></div></div>';
    focusTitle();
  }

  function renderQuestion() {
    var q = Qs[S.i], info = sectionInfo(S.i), dom = DOMAINS[q.domain];
    var perm = S.perm[S.i], chosen = S.ans[S.i];
    var opts = perm.map(function (orig, pos) {
      var sel = chosen === orig, letter = 'ABCDEF'.charAt(pos), content, label;
      if (q.matrix) { content = Sheet.cellSVG(q.options[orig]); label = Sheet.describe(q.options[orig]); }
      else { content = '<span class="otext">' + esc(q.options[orig]) + '</span>'; label = q.options[orig]; }
      return '<button type="button" class="opt' + (q.matrix ? ' opt-visual' : '') + (sel ? ' is-sel' : '') + '" role="radio" aria-checked="' + sel +
        '" aria-label="Option ' + letter + ': ' + esc(label) + '" data-act="pick" data-o="' + orig + '">' +
        '<span class="bubble" aria-hidden="true">' + letter + '</span>' + content + '</button>';
    }).join('');

    var last = S.i === N - 1;
    app.innerHTML =
      '<div class="qwrap">' +
      '<div class="qhead"><div class="qsection"><strong>' + dom.name + '</strong> <span class="muted">question ' + info.idx + ' of ' + info.total + '</span></div>' +
      '<div class="qtools"><span class="timer' + (showTimer ? '' : ' is-hidden') + '" id="timer" role="timer" aria-live="off"></span>' +
      '<button type="button" class="linkbtn" data-act="toggle-timer">' + (showTimer ? 'Hide timer' : 'Show timer') + '</button></div></div>' +
      '<div class="progress" role="progressbar" aria-label="Test progress" aria-valuemin="0" aria-valuemax="' + N + '" aria-valuenow="' + (S.i + 1) + '"><span id="pbar"></span></div>' +
      '<h2 class="qprompt" data-focus>' + esc(q.prompt) + '</h2>' +
      (q.matrix ? Sheet.matrixHTML(q.matrix) : '') +
      '<div class="opts' + (q.matrix ? ' opts-visual' : '') + '" role="radiogroup" aria-label="Answer options">' + opts + '</div>' +
      '<div class="qnav"><button type="button" class="btn btn-ghost" data-act="prev"' + (S.i === 0 ? ' disabled' : '') + '>Back</button>' +
      '<button type="button" class="btn ' + (chosen !== null ? 'btn-primary' : 'btn-ghost') + '" data-act="next">' +
      (last ? 'Finish test' : chosen !== null ? 'Next question' : 'Skip for now') + '</button></div>' +
      '<p class="kbd small muted">Keyboard: press A to ' + 'ABCDEF'.charAt(perm.length - 1) + ' to answer, Enter for next.</p>' +
      '</div>';

    var bar = document.getElementById('pbar');
    if (bar) { bar.style.width = Math.round((S.i / N) * 100) + '%'; requestAnimationFrame(function () { bar.style.width = Math.round(((S.i + 1) / N) * 100) + '%'; }); }
    qStart = performance.now();
    startTimer();
    focusTitle();
  }

  function renderBreak() {
    var info = sectionInfo(S.i), dom = DOMAINS[info.domain];
    var doneSections = info.section - 1;
    var dots = ORDER.map(function (k, i) {
      return '<li class="' + (i < doneSections ? 'done' : i === doneSections ? 'now' : '') + '">' + DOMAINS[k].name + '</li>';
    }).join('');
    var left = Math.max(0, Math.round((S.deadline - Date.now()) / 1000));
    app.innerHTML =
      '<div class="break">' +
      '<ol class="dots" aria-label="Sections">' + dots + '</ol>' +
      '<h2 data-focus>' + DOMAINS[ORDER[doneSections - 1]].name + ' done. ' + (4 - doneSections === 1 ? 'One section left.' : (4 - doneSections) + ' sections left.') + '</h2>' +
      '<p class="lede">Next: <strong>' + dom.title + '</strong>. ' + esc(dom.intro) + '</p>' +
      '<p class="muted">Time left: ' + mmss(left) + '</p>' +
      '<div class="row"><button type="button" class="btn btn-primary btn-lg" data-act="continue">Start ' + dom.name + '</button></div></div>';
    focusTitle();
  }

  function renderConfirm() {
    var open = [];
    S.ans.forEach(function (a, i) { if (a === null) { open.push(i); } });
    app.innerHTML =
      '<div class="confirm"><h2 data-focus>' + (open.length ? 'You have ' + plural(open.length, 'unanswered question') : 'Ready to see your results?') + '</h2>' +
      (open.length
        ? '<p class="lede">Unanswered questions count as zero. You can go back and answer them, or finish now.</p><div class="chips">' +
        open.map(function (i) { return '<button type="button" class="chip" data-act="jump" data-i="' + i + '">Question ' + (i + 1) + ' · ' + DOMAINS[Qs[i].domain].name + '</button>'; }).join('') + '</div>'
        : '<p class="lede">You answered all ' + N + ' questions. Your report is generated instantly.</p>') +
      '<div class="row"><button type="button" class="btn btn-primary btn-lg" data-act="finish-now">Show my results</button>' +
      '<button type="button" class="btn btn-ghost" data-act="back-to-q">Go back</button></div></div>';
    focusTitle();
  }

  /* ---------- timer ---------- */

  function startTimer() { stopTimer(); tick(); timerId = window.setInterval(tick, 1000); }
  function stopTimer() { if (timerId) { window.clearInterval(timerId); timerId = null; } }
  function tick() {
    var left = Math.round((S.deadline - Date.now()) / 1000), el = document.getElementById('timer');
    if (el) { el.textContent = mmss(left); el.classList.toggle('warn', left <= 300); }
    if (left <= 0) { S.timeUp = true; finish(); }
  }

  /* ---------- actions ---------- */

  function begin() {
    var cb = document.getElementById('opt-timer');
    showTimer = cb ? cb.checked : true;
    S = newSession(); save(); render();
  }
  function pick(o) {
    S.ans[S.i] = o; save();
    Array.prototype.forEach.call(app.querySelectorAll('.opt'), function (b) {
      var sel = parseInt(b.getAttribute('data-o'), 10) === o;
      b.classList.toggle('is-sel', sel);
      b.setAttribute('aria-checked', sel ? 'true' : 'false');
    });
    var nx = app.querySelector('[data-act="next"]');
    if (nx) {
      nx.classList.remove('btn-ghost'); nx.classList.add('btn-primary');
      nx.textContent = S.i === N - 1 ? 'Finish test' : 'Next question';
    }
  }
  function next() {
    markLeave();
    if (S.i < N - 1) {
      var cross = Qs[S.i + 1].domain !== Qs[S.i].domain;
      S.i++; S.view = cross ? 'break' : 'q'; save(); render();
    } else { S.view = 'confirm'; save(); render(); }
  }
  function prev() { markLeave(); if (S.i > 0) { S.i--; S.view = 'q'; save(); render(); } }
  function finish() {
    markLeave(); stopTimer();
    S.result = computeResult(); S.done = true; S.view = 'result'; save(); render();
  }

  /* ---------- result ---------- */

  function ordinalPct(p) { return p + '%'; }

  function bellSVG(iq) {
    var W = 600, H = 210, pad = 24, x0 = 55, x1 = 145, top = 24, base = H - 36;
    function X(v) { return Math.round((pad + (v - x0) / (x1 - x0) * (W - 2 * pad)) * 10) / 10; }
    function Y(v) { return Math.round((base - Math.exp(-0.5 * Math.pow((v - 100) / 15, 2)) * (base - top)) * 10) / 10; }
    var v, all = 'M' + X(x0) + ',' + base, mine = 'M' + X(x0) + ',' + base;
    for (v = x0; v <= x1; v++) { all += ' L' + X(v) + ',' + Y(v); }
    all += ' L' + X(x1) + ',' + base + ' Z';
    for (v = x0; v <= Math.floor(iq); v++) { mine += ' L' + X(v) + ',' + Y(v); }
    mine += ' L' + X(iq) + ',' + Y(iq) + ' L' + X(iq) + ',' + base + ' Z';
    var ticks = [70, 85, 100, 115, 130].map(function (t) {
      return '<line class="bell-tick" x1="' + X(t) + '" x2="' + X(t) + '" y1="' + base + '" y2="' + (base + 5) + '"/>' +
        '<text class="bell-lbl" x="' + X(t) + '" y="' + (base + 20) + '" text-anchor="middle">' + t + '</text>';
    }).join('');
    var anchor = iq > 125 ? 'end' : iq < 75 ? 'start' : 'middle';
    var lx = anchor === 'end' ? X(iq) - 8 : anchor === 'start' ? X(iq) + 8 : X(iq);
    return '<svg class="bell" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Bell curve of IQ scores with your estimated score of ' + iq + ' marked">' +
      '<path class="bell-all" d="' + all + '"/><path class="bell-mine" d="' + mine + '"/>' +
      '<line class="bell-base" x1="' + pad + '" x2="' + (W - pad) + '" y1="' + base + '" y2="' + base + '"/>' + ticks +
      '<line class="bell-you" x1="' + X(iq) + '" x2="' + X(iq) + '" y1="' + (Y(iq) - 6) + '" y2="' + base + '"/>' +
      '<circle class="bell-dot" cx="' + X(iq) + '" cy="' + Y(iq) + '" r="5"/>' +
      '<text class="bell-you-lbl" x="' + lx + '" y="' + (Math.max(14, Y(iq) - 14)) + '" text-anchor="' + anchor + '">You: ' + iq + '</text></svg>';
  }

  function domainRows(r) {
    return ORDER.map(function (k) {
      var d = r.dom[k], b = bandIdx(d.pct);
      return '<li class="drow"><div class="dtop"><span class="dlabel">' + DOMAINS[k].title + '</span><span class="dval">' + d.pct + '%</span></div>' +
        '<div class="dbar" role="img" aria-label="' + DOMAINS[k].title + ': ' + d.pct + ' percent, ' + BANDS[b] + '"><span class="dfill" data-w="' + d.pct + '"></span></div>' +
        '<div class="dtext"><strong>' + BANDS[b] + '.</strong> ' + esc(NARR[k][b]) + '</div></li>';
    }).join('');
  }

  function profileSummary(r) {
    var ks = ORDER.slice().sort(function (a, b) { return r.dom[b].pct - r.dom[a].pct; });
    var hi = ks[0], lo = ks[ks.length - 1], spread = r.dom[hi].pct - r.dom[lo].pct;
    return { hi: hi, lo: lo, spread: spread,
      text: spread >= 30
        ? 'Your profile is uneven: ' + DOMAINS[hi].title.toLowerCase() + ' is your strongest area and ' + DOMAINS[lo].title.toLowerCase() + ' is your weakest, a gap of ' + spread + ' points.'
        : 'Your profile is fairly balanced. Your strongest area is ' + DOMAINS[hi].title.toLowerCase() + ' and your weakest is ' + DOMAINS[lo].title.toLowerCase() + ', only ' + spread + ' points apart.' };
  }

  function difficultyBlock(r) {
    var names = { easy: 'Easy questions', med: 'Medium questions', hard: 'Hard questions' };
    var rows = ['easy', 'med', 'hard'].map(function (t) {
      var x = r.tiers[t], p = x.n ? Math.round(x.c / x.n * 100) : 0;
      return '<li class="drow"><div class="dtop"><span class="dlabel">' + names[t] + '</span><span class="dval">' + x.c + ' of ' + x.n + '</span></div>' +
        '<div class="dbar" role="img" aria-label="' + names[t] + ': ' + x.c + ' of ' + x.n + ' correct"><span class="dfill" data-w="' + p + '"></span></div></li>';
    }).join('');
    var e = r.tiers.easy, m = r.tiers.med, h = r.tiers.hard, msg;
    if (e.c < e.n - 2) { msg = 'You missed several easy questions. That usually points to rushing, distraction or a few unfamiliar formats rather than reasoning ability, so a calm retake could score higher.'; }
    else if (h.c >= h.n - 1) { msg = 'You solved nearly every hard question. This test has a ceiling, so your true ability may sit above the top of this scale.'; }
    else if (m.c >= m.n - 1 && h.c < h.n / 2) { msg = 'You are consistent through the medium questions. The hard questions, where several rules combine, are the clearest place to gain points.'; }
    else if (m.c < m.n / 2) { msg = 'Your accuracy dropped from the medium level. Slowing down on multi-step questions is the quickest improvement.'; }
    else { msg = 'Your accuracy fell gradually as questions got harder, which is the normal pattern.'; }
    return '<ul class="drows">' + rows + '</ul><p>' + msg + '</p>';
  }

  function paceBlock(r) {
    var avg = r.answered ? r.timeTotal / r.answered : 0;
    var perDom = ORDER.map(function (k) { return '<li><strong>' + DOMAINS[k].name + ':</strong> ' + mmss(r.dom[k].time) + '</li>'; }).join('');
    var ans = r.rows.filter(function (x) { return x.ch !== null; });
    var med = r.timeMedian, fast = ans.filter(function (x) { return x.t <= med; }), slow = ans.filter(function (x) { return x.t > med; });
    function acc(a) { return a.length ? Math.round(a.filter(function (x) { return x.ok; }).length / a.length * 100) : 0; }
    var af = acc(fast), as = acc(slow), insight;
    if (ans.length < 10) { insight = 'Answer more questions to see how your speed relates to accuracy.'; }
    else if (as - af >= 15) { insight = 'Taking longer paid off: you got ' + as + '% right on your slower questions versus ' + af + '% on your quicker ones. Do not be afraid to use the time on hard questions.'; }
    else if (af - as >= 15) { insight = 'Your first instincts were strong: ' + af + '% correct on quick answers versus ' + as + '% when you deliberated. Long deliberation did not help, so trust your first read.'; }
    else { insight = 'Speed and accuracy were closely matched (' + af + '% on quicker questions, ' + as + '% on slower ones), a sign of well-judged pacing.'; }
    var longest = r.rows.filter(function (x) { return x.ch !== null; }).sort(function (a, b) { return b.t - a.t; }).slice(0, 3)
      .map(function (x) { return 'Q' + (x.i + 1) + ' (' + mmss(x.t) + ')'; }).join(', ');
    return '<div class="statgrid"><div class="stat"><span class="statn">' + mmss(r.timeTotal) + '</span><span class="statl">total time</span></div>' +
      '<div class="stat"><span class="statn">' + Math.round(avg) + 's</span><span class="statl">average per answer</span></div>' +
      '<div class="stat"><span class="statn">' + Math.round(med) + 's</span><span class="statl">median per answer</span></div></div>' +
      '<ul class="plain">' + perDom + '</ul><p>' + insight + '</p>' + (longest ? '<p class="muted">Longest on: ' + longest + '.</p>' : '');
  }

  function reviewBlock(r) {
    var items = r.rows.map(function (x) {
      var q = x.q, st = x.ch === null ? 'skip' : x.ok ? 'ok' : 'bad';
      var res = st === 'skip' ? 'Skipped' : st === 'ok' ? 'Correct' : 'Incorrect';
      function show(o) { return q.matrix ? '<span class="rv-cell">' + Sheet.cellSVG(q.options[o]) + '</span>' : esc(q.options[o]); }
      var yours = x.ch === null ? '<em>No answer</em>' : show(x.ch);
      return '<li class="rev ' + st + '"><div class="rv-top"><span class="rv-n">Q' + (x.i + 1) + '</span>' +
        '<span class="rv-meta">' + DOMAINS[q.domain].name + ' · ' + tierName(q.d) + ' · ' + mmss(x.t) + '</span>' +
        '<span class="rv-res">' + res + '</span></div>' +
        '<p class="rv-prompt">' + esc(q.prompt) + '</p>' + (q.matrix ? Sheet.matrixHTML(q.matrix) : '') +
        '<div class="rv-ans"><div><span class="rv-k">Your answer</span>' + yours + '</div>' +
        (st === 'ok' ? '' : '<div><span class="rv-k">Correct answer</span>' + show(q.answer) + '</div>') + '</div>' +
        '<p class="rv-why">' + esc(q.explain) + '</p></li>';
    }).join('');
    return '<div class="rv-tools"><button type="button" class="linkbtn" data-act="toggle-missed" id="btn-missed">Show only questions I missed</button></div>' +
      '<ol class="rev-list" id="rev-list">' + items + '</ol>';
  }

  function planBlock(r) {
    var p = profileSummary(r), lo = p.lo, hi = p.hi;
    return '<p>' + p.text + '</p>' +
      '<h4>Focus: ' + DOMAINS[lo].title + '</h4><ul class="plain">' + TIPS[lo].map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('') + '</ul>' +
      '<h4>Keep sharp: ' + DOMAINS[hi].title + '</h4><ul class="plain"><li>' + esc(TIPS[hi][0]) + '</li></ul>' +
      '<h4>A simple routine</h4><ul class="plain">' +
      '<li>Ten minutes a day, five days a week, on puzzles from your weakest area.</li>' +
      '<li>After each puzzle, say the rule out loud in one sentence before checking.</li>' +
      '<li>Retake this test after at least four weeks. Retaking sooner mostly measures memory of these questions.</li></ul>';
  }

  function reportSections(r) {
    return '<section class="rsec"><h3>Where your accuracy fell by difficulty</h3>' + difficultyBlock(r) + '</section>' +
      '<section class="rsec"><h3>Pace and timing</h3>' + paceBlock(r) + '</section>' +
      '<section class="rsec"><h3>Question-by-question review</h3>' + reviewBlock(r) + '</section>' +
      '<section class="rsec"><h3>Your next steps</h3>' + planBlock(r) + '</section>';
  }

  function paywallCard() {
    var has = !!CFG.checkoutUrl;
    return '<section class="rsec paywall"><h3>Unlock your detailed report</h3>' +
      '<p>Your score, percentile and skills profile above are free. The full report adds:</p>' +
      '<ul class="plain"><li>Accuracy by difficulty, showing where your ceiling is</li><li>Pace and timing analysis</li>' +
      '<li>All 24 questions reviewed with the reasoning explained</li><li>A personal improvement plan and a printable PDF</li></ul>' +
      (has ? '<p><a class="btn btn-primary btn-lg" href="' + esc(CFG.checkoutUrl) + '">Get the full report · ' + esc(CFG.priceLabel) + '</a></p><p class="small muted">One-time payment. No subscription.</p>'
        : '<p><button type="button" class="btn btn-ghost" disabled>Coming soon</button></p>') + '</section>';
  }

  function renderResult() {
    var r = S.result, p = profileSummary(r);
    var d = new Date(r.date), dateStr = d.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
    var capNote = r.capped === 'high' ? ' This test tops out at 145, so your true score may be higher.'
      : r.capped === 'low' ? ' This test cannot distinguish scores below 70.' : '';
    var warn = r.quality.notes.length
      ? '<div class="banner ' + (r.quality.level === 'low' ? 'banner-warn' : '') + '" role="note"><strong>' + (r.quality.level === 'low' ? 'Treat this score as provisional.' : 'A note on this result.') + '</strong><ul class="plain">' +
      r.quality.notes.map(function (n) { return '<li>' + esc(n) + '</li>'; }).join('') + '</ul></div>'
      : '';
    var pctLine = 'On the IQ scale (average 100), this is higher than about <strong>' + ordinalPct(r.pct) + '</strong> of people.';

    app.innerHTML =
      '<article class="report">' +
      '<header class="rhead"><div><h1 data-focus>Your IQ report</h1><p class="muted">Report ' + r.id + ' · ' + dateStr + '</p></div>' +
      '<div class="rbtns"><button type="button" class="btn btn-ghost" data-act="print">Save as PDF</button>' +
      '<button type="button" class="btn btn-ghost" data-act="share">Share result image</button></div></header>' +
      warn +
      '<section class="score"><p class="score-lbl">Estimated IQ</p>' +
      '<p class="iqnum" id="iqnum" data-to="' + r.iq + '">' + r.iq + '</p>' +
      '<p class="iqband">' + r.band + '</p>' +
      '<p class="iqrange">Likely range: <strong>' + r.low + ' to ' + r.high + '</strong> (90% confidence).' + capNote + '</p>' +
      '<p>' + pctLine + '</p>' +
      '<p class="muted">' + r.correct + ' of ' + N + ' correct · ' + mmss(r.timeTotal) + ' total · ' + p.text + '</p></section>' +
      '<section class="rsec"><h3>Where you sit on the curve</h3>' + bellSVG(r.iq) + '</section>' +
      '<section class="rsec"><h3>Your skills profile</h3><ul class="drows">' + domainRows(r) + '</ul>' +
      '<p class="small muted">Percentages show how much of each section’s weighted points you earned, after adjusting for guessing.</p></section>' +
      (CFG.fullReportFree ? reportSections(r) : paywallCard()) +
      '<section class="rsec disclaimer"><h3>Read this before you rely on the score</h3>' +
      '<p>This is a short online test. It is an estimate for curiosity and self-insight, not a clinical or diagnostic assessment, and it is not age-adjusted. The margin of error is wide (about ±' + CFG.ciHalfWidth + ' points). Sleep, stress, language and unfamiliarity with puzzle formats all affect results. ' +
      '<a href="how-iq-tests-work.html">Read how scoring works and what it cannot tell you.</a></p></section>' +
      '<div class="row"><button type="button" class="btn btn-ghost" data-act="restart">Retake the test</button>' +
      '<a class="btn btn-ghost" href="iq-score-chart.html">IQ score chart</a></div>' +
      '</article>';

    // animate bars and number
    var fills = app.querySelectorAll('[data-w]');
    Array.prototype.forEach.call(fills, function (el) {
      el.style.setProperty('--w', '0%');
      requestAnimationFrame(function () { requestAnimationFrame(function () { el.style.setProperty('--w', el.getAttribute('data-w') + '%'); }); });
    });
    countUp(document.getElementById('iqnum'), r.iq);
    focusTitle();
  }

  function countUp(el, to) {
    if (!el || reduceMotion) { return; }
    var from = 70, dur = 1100, t0 = performance.now();
    function step(now) {
      var k = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - k, 3);
      el.textContent = Math.round(from + (to - from) * e);
      if (k < 1) { requestAnimationFrame(step); }
    }
    requestAnimationFrame(step);
  }

  /* ---------- share image ---------- */

  function shareCanvas(r) {
    var c = document.createElement('canvas'); c.width = 1080; c.height = 1080;
    var g = c.getContext('2d');
    if (!g) { return null; }
    var serif = 'Charter, "Bitstream Charter", "Sitka Text", Cambria, Georgia, serif';
    var sans = 'system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif';
    g.fillStyle = '#F4F7FB'; g.fillRect(0, 0, 1080, 1080);
    g.fillStyle = '#2342F5'; g.fillRect(0, 0, 1080, 14);
    g.fillStyle = '#0E1A33'; g.textAlign = 'left';
    g.font = '700 44px ' + serif; g.fillText(CFG.siteName, 80, 120);
    g.font = '400 30px ' + sans; g.fillStyle = '#46536B'; g.fillText('Free IQ test · estimated result', 80, 170);
    g.fillStyle = '#0E1A33'; g.font = '700 300px ' + serif; g.fillText(String(r.iq), 74, 470);
    g.font = '400 40px ' + sans; g.fillText(r.band + ' · higher than about ' + r.pct + '% of people', 80, 540);
    g.fillStyle = '#46536B'; g.font = '400 30px ' + sans; g.fillText('Likely range ' + r.low + ' to ' + r.high, 80, 590);
    var y = 680;
    ORDER.forEach(function (k) {
      g.fillStyle = '#0E1A33'; g.font = '600 30px ' + sans; g.fillText(DOMAINS[k].title, 80, y);
      g.fillStyle = '#D3DBE8'; g.fillRect(500, y - 26, 440, 28);
      g.fillStyle = '#2342F5'; g.fillRect(500, y - 26, Math.max(6, 440 * r.dom[k].pct / 100), 28);
      g.fillStyle = '#0E1A33'; g.textAlign = 'right'; g.fillText(r.dom[k].pct + '%', 1000, y); g.textAlign = 'left';
      y += 62;
    });
    g.fillStyle = '#46536B'; g.font = '400 28px ' + sans;
    g.fillText('An online estimate, not a clinical assessment.', 80, 990);
    g.fillStyle = '#2342F5'; g.font = '700 34px ' + sans; g.fillText(location.host || CFG.siteName, 80, 1035);
    return c;
  }

  function shareResult() {
    var r = S.result, c = shareCanvas(r);
    if (!c) { return; }
    c.toBlob(function (blob) {
      if (!blob) { return; }
      var file = null;
      try { file = new File([blob], 'my-iq-result.png', { type: 'image/png' }); } catch (e) { /* old browser */ }
      if (file && navigator.canShare && navigator.canShare({ files: [file] }) && navigator.share) {
        navigator.share({ files: [file], title: CFG.siteName + ' result', text: 'My estimated IQ on the ' + CFG.siteName + ' free test: ' + r.iq }).catch(function () { /* cancelled */ });
      } else {
        var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'my-iq-result.png';
        document.body.appendChild(a); a.click(); document.body.removeChild(a);
        setTimeout(function () { URL.revokeObjectURL(a.href); }, 2000);
      }
    }, 'image/png');
  }

  /* ---------- events ---------- */

  app.addEventListener('click', function (e) {
    var b = e.target.closest('[data-act]');
    if (!b || b.disabled) { return; }
    var a = b.getAttribute('data-act');
    if (a === 'begin') { begin(); }
    else if (a === 'resume') { S.view = 'q'; save(); render(); }
    else if (a === 'restart') { clearSession(); S = null; renderIntro(); }
    else if (a === 'pick') { pick(parseInt(b.getAttribute('data-o'), 10)); }
    else if (a === 'next') { next(); }
    else if (a === 'prev') { prev(); }
    else if (a === 'continue') { S.view = 'q'; save(); render(); }
    else if (a === 'jump') { S.i = parseInt(b.getAttribute('data-i'), 10); S.view = 'q'; save(); render(); }
    else if (a === 'back-to-q') { S.view = 'q'; S.i = N - 1; save(); render(); }
    else if (a === 'finish-now') { if (Date.now() > S.deadline) { S.timeUp = true; } finish(); }
    else if (a === 'toggle-timer') {
      showTimer = !showTimer;
      var t = document.getElementById('timer'); if (t) { t.classList.toggle('is-hidden', !showTimer); }
      b.textContent = showTimer ? 'Hide timer' : 'Show timer';
    }
    else if (a === 'toggle-missed') {
      var list = document.getElementById('rev-list');
      if (list) { var on = list.classList.toggle('only-missed'); b.textContent = on ? 'Show all questions' : 'Show only questions I missed'; }
    }
    else if (a === 'print') { window.print(); }
    else if (a === 'share') { shareResult(); }
  });

  document.addEventListener('keydown', function (e) {
    if (!S || S.view !== 'q' || e.ctrlKey || e.metaKey || e.altKey) { return; }
    var tag = (document.activeElement && document.activeElement.tagName) || '';
    if (tag === 'INPUT' || tag === 'TEXTAREA') { return; }
    var q = Qs[S.i], k = e.key.toLowerCase(), pos = 'abcdef'.indexOf(k);
    if (k.length === 1 && pos > -1 && pos < q.options.length) { pick(S.perm[S.i][pos]); e.preventDefault(); }
    else if (e.key === 'Enter' && tag !== 'BUTTON') { next(); e.preventDefault(); }
    else if (e.key === 'ArrowRight') { next(); }
    else if (e.key === 'ArrowLeft') { prev(); }
  });

  document.addEventListener('visibilitychange', function () {
    if (document.hidden && S && S.view === 'q') { markLeave(); save(); }
    else if (!document.hidden && S && S.view === 'q') { qStart = performance.now(); }
  });

  /* ---------- init ---------- */

  S = load();
  if (!S) { renderIntro(); }
  else if (S.done && S.result) { renderResult(); }
  else { S.view = 'q'; renderResume(); }
})();
