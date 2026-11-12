/*
 * Homepage sample question: one tap-to-try puzzle (not part of the real test).
 */
(function () {
  'use strict';
  var host = document.getElementById('sample');
  var Sheet = window.IQSheet;
  if (!host || !Sheet) { return; }

  function C(s, n) { return { s: s, n: n, f: 'solid' }; }

  var cells = [
    C('triangle', 1), C('triangle', 2), C('triangle', 3),
    C('circle', 1), C('circle', 2), C('circle', 3),
    C('square', 1), C('square', 2), null
  ];
  var options = [C('square', 2), C('square', 3), C('circle', 3), C('square', 4), C('triangle', 3), C('square', 1)];
  var answer = 1, letters = 'ABCDEF';

  var opts = options.map(function (o, i) {
    return '<button type="button" class="opt opt-visual" data-i="' + i + '" aria-label="Option ' + letters.charAt(i) + ': ' + Sheet.describe(o) + '">' +
      '<span class="bubble" aria-hidden="true">' + letters.charAt(i) + '</span>' + Sheet.cellSVG(o) + '</button>';
  }).join('');

  host.innerHTML =
    '<p class="sample-q"><strong>Try one.</strong> Which picture completes the grid?</p>' +
    Sheet.matrixHTML(cells) +
    '<div class="opts opts-visual" id="sample-opts">' + opts + '</div>' +
    '<p class="sample-fb" id="sample-fb" role="status" aria-live="polite"></p>';

  var fb = document.getElementById('sample-fb');
  var wrap = document.getElementById('sample-opts');
  wrap.addEventListener('click', function (e) {
    var b = e.target.closest('.opt');
    if (!b) { return; }
    var i = parseInt(b.getAttribute('data-i'), 10);
    Array.prototype.forEach.call(wrap.children, function (el) { el.classList.remove('is-sel', 'is-right', 'is-wrong'); });
    b.classList.add('is-sel');
    if (i === answer) {
      b.classList.add('is-right');
      fb.innerHTML = '<strong>Correct.</strong> Each row uses one shape and adds one more each step, so squares reach three. The real test goes up from here. <a class="btn btn-primary" href="test.html">Start the full test</a>';
    } else {
      b.classList.add('is-wrong');
      fb.innerHTML = 'Not quite. Look along the last row: one square, then two. What comes next? Try another option.';
    }
  });
})();
