/*
 * IQSheet — draws the visual puzzles (shapes, grids) as inline SVG.
 * Cell definitions:
 *   { s:'circle|square|triangle|diamond', n:1..5, f:'solid|empty|half', r:rotationDegrees }
 *   { q:[1,0,1,1] }   -> 2x2 block, 1 = filled square (TL, TR, BL, BR)
 *   null              -> the missing cell ("?")
 */
(function (w) {
  'use strict';

  var LAYOUT = {
    1: { pos: [[50, 50]], size: 22 },
    2: { pos: [[30, 50], [70, 50]], size: 16 },
    3: { pos: [[50, 27], [27, 70], [73, 70]], size: 13 },
    4: { pos: [[30, 30], [70, 30], [30, 70], [70, 70]], size: 12 },
    5: { pos: [[27, 27], [73, 27], [27, 73], [73, 73], [50, 50]], size: 10 }
  };

  var FILL_WORD = { solid: 'solid', empty: 'outlined', half: 'shaded' };
  var DIR_WORD = { 0: 'up', 90: 'right', 180: 'down', 270: 'left' };
  var QUAD_NAMES = ['top-left', 'top-right', 'bottom-left', 'bottom-right'];

  function r1(n) { return Math.round(n * 10) / 10; }

  function shape(s, cx, cy, size, fill, rot) {
    var cls = 'sh sh-' + fill;
    var tr = rot ? ' transform="rotate(' + rot + ' ' + cx + ' ' + cy + ')"' : '';
    if (s === 'circle') {
      return '<circle class="' + cls + '" cx="' + cx + '" cy="' + cy + '" r="' + r1(size) + '"' + tr + '/>';
    }
    if (s === 'square') {
      var h = size * 0.85;
      return '<rect class="' + cls + '" x="' + r1(cx - h) + '" y="' + r1(cy - h) +
        '" width="' + r1(2 * h) + '" height="' + r1(2 * h) + '"' + tr + '/>';
    }
    var pts;
    if (s === 'triangle') {
      pts = [cx, cy - size * 1.1, cx + size * 1.05, cy + size * 0.8, cx - size * 1.05, cy + size * 0.8];
    } else { // diamond
      pts = [cx, cy - size * 1.25, cx + size * 1.25, cy, cx, cy + size * 1.25, cx - size * 1.25, cy];
    }
    var p = '';
    for (var i = 0; i < pts.length; i += 2) { p += r1(pts[i]) + ',' + r1(pts[i + 1]) + ' '; }
    return '<polygon class="' + cls + '" points="' + p.trim() + '"' + tr + '/>';
  }

  function describe(c) {
    if (c === null) { return 'missing cell'; }
    if (c.q) {
      var on = [];
      c.q.forEach(function (b, i) { if (b) { on.push(QUAD_NAMES[i]); } });
      return 'square split into four, filled: ' + (on.length ? on.join(', ') : 'none');
    }
    var t = c.n + ' ' + FILL_WORD[c.f] + ' ' + c.s + (c.n > 1 ? 's' : '');
    if (c.r !== undefined && c.s === 'triangle') { t += ' pointing ' + DIR_WORD[c.r]; }
    return t;
  }

  function cellSVG(c) {
    var out = '<svg class="cell" viewBox="0 0 100 100" aria-hidden="true" focusable="false">';
    if (c === null) {
      out += '<text class="qmark" x="50" y="64" text-anchor="middle">?</text>';
    } else if (c.q) {
      var P = [[17, 17], [53, 17], [17, 53], [53, 53]];
      for (var i = 0; i < 4; i++) {
        out += '<rect class="qd' + (c.q[i] ? ' on' : '') + '" x="' + P[i][0] + '" y="' + P[i][1] + '" width="30" height="30"/>';
      }
    } else {
      var L = LAYOUT[c.n];
      for (var j = 0; j < c.n; j++) {
        out += shape(c.s, L.pos[j][0], L.pos[j][1], L.size, c.f, c.r || 0);
      }
    }
    return out + '</svg>';
  }

  function matrixHTML(cells) {
    var label = 'Three by three grid. The bottom-right cell is missing. ' + cells.map(function (c, i) {
      return 'Row ' + (Math.floor(i / 3) + 1) + ', column ' + ((i % 3) + 1) + ': ' + describe(c) + '.';
    }).join(' ');
    var h = '<div class="matrix" role="img" aria-label="' + label + '">';
    cells.forEach(function (c) {
      h += '<div class="mcell' + (c === null ? ' missing' : '') + '">' + cellSVG(c) + '</div>';
    });
    return h + '</div>';
  }

  w.IQSheet = { cellSVG: cellSVG, matrixHTML: matrixHTML, describe: describe };
})(window);
