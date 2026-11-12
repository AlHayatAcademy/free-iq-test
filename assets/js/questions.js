/*
 * Question bank — 24 original items, 6 per domain, ordered easy -> hard inside each section.
 *   d = difficulty weight (1 easiest ... 5 hardest), used in scoring.
 *   answer = index of the correct entry in `options` (options are shuffled on screen).
 * Visual items store cell definitions (see sheet.js) as options.
 */
(function (w) {
  'use strict';

  function C(s, n, f, r) { var o = { s: s, n: n, f: f }; if (r !== undefined) { o.r = r; } return o; }
  function Qd(bits) { return { q: bits }; }

  /* ---------- Patterns ---------- */

  // p1: shape by row, count +1 across columns
  var p1 = [
    C('circle', 1, 'solid'), C('circle', 2, 'solid'), C('circle', 3, 'solid'),
    C('square', 1, 'solid'), C('square', 2, 'solid'), C('square', 3, 'solid'),
    C('triangle', 1, 'solid'), C('triangle', 2, 'solid'), null
  ];

  // p2: shading by row, rotation by column
  var p2 = [], fillsByRow = ['solid', 'empty', 'half'], rotsByCol = [0, 90, 180];
  for (var r = 0; r < 3; r++) {
    for (var c = 0; c < 3; c++) {
      p2.push(r === 2 && c === 2 ? null : C('triangle', 1, fillsByRow[r], rotsByCol[c]));
    }
  }

  // p3: three figures arranged so each appears once per row and column
  var fa = C('circle', 1, 'solid'), fb = C('square', 2, 'empty'), fc = C('triangle', 3, 'half');
  var p3 = [fa, fb, fc, fc, fa, fb, fb, fc, null];

  // p4: Latin square on shape AND shading
  var shp = [['circle', 'square', 'triangle'], ['square', 'triangle', 'circle'], ['triangle', 'circle', 'square']];
  var shd = [['solid', 'empty', 'half'], ['half', 'solid', 'empty'], ['empty', 'half', 'solid']];
  var p4 = [];
  for (r = 0; r < 3; r++) {
    for (c = 0; c < 3; c++) { p4.push(r === 2 && c === 2 ? null : C(shp[r][c], 1, shd[r][c])); }
  }

  // p5: third picture = squares filled in exactly one of the first two (XOR)
  var p5 = [
    Qd([1, 1, 0, 0]), Qd([0, 1, 1, 0]), Qd([1, 0, 1, 0]),
    Qd([1, 0, 0, 1]), Qd([1, 1, 0, 0]), Qd([0, 1, 0, 1]),
    Qd([1, 1, 1, 0]), Qd([0, 1, 0, 1]), null
  ];

  // p6: shape by row, shading by column, count in col 3 = col 1 + col 2
  var shapesByRow = ['circle', 'square', 'diamond'], countRows = [[1, 2, 3], [2, 2, 4], [3, 1, 4]];
  var fillsByCol = ['solid', 'empty', 'half'], p6 = [];
  for (r = 0; r < 3; r++) {
    for (c = 0; c < 3; c++) {
      p6.push(r === 2 && c === 2 ? null : C(shapesByRow[r], countRows[r][c], fillsByCol[c]));
    }
  }

  w.IQ_QUESTIONS = [
    /* ===== Patterns ===== */
    {
      id: 'p1', domain: 'patterns', d: 1,
      prompt: 'Which picture completes the grid?',
      matrix: p1,
      options: [C('triangle', 3, 'solid'), C('triangle', 2, 'solid'), C('triangle', 4, 'solid'),
        C('square', 3, 'solid'), C('circle', 3, 'solid'), C('triangle', 1, 'solid')],
      answer: 0,
      explain: 'Each row uses one shape, and the number of shapes goes up by one from left to right (1, 2, 3). The last row is triangles, so it needs three.'
    },
    {
      id: 'p2', domain: 'patterns', d: 2,
      prompt: 'Which picture completes the grid?',
      matrix: p2,
      options: [C('triangle', 1, 'half', 180), C('triangle', 1, 'half', 90), C('triangle', 1, 'half', 270),
        C('triangle', 1, 'solid', 180), C('triangle', 1, 'empty', 180), C('triangle', 1, 'half', 0)],
      answer: 0,
      explain: 'Shading is set by the row (solid, outlined, shaded). Rotation is set by the column (0°, 90° clockwise, 180°). The missing cell is shaded and turned 180°, so it points down.'
    },
    {
      id: 'p3', domain: 'patterns', d: 2,
      prompt: 'Which picture completes the grid?',
      matrix: p3,
      options: [fa, fb, fc, C('circle', 2, 'solid'), C('circle', 1, 'empty'), C('triangle', 1, 'solid')],
      answer: 0,
      explain: 'Each of the three figures appears exactly once in every row and every column. The bottom row already has the two squares and the three triangles, so it needs the single solid circle.'
    },
    {
      id: 'p4', domain: 'patterns', d: 3,
      prompt: 'Which picture completes the grid?',
      matrix: p4,
      options: [C('square', 1, 'solid'), C('square', 1, 'empty'), C('square', 1, 'half'),
        C('circle', 1, 'solid'), C('triangle', 1, 'solid'), C('circle', 1, 'empty')],
      answer: 0,
      explain: 'Shapes and shadings each appear once per row and per column. The bottom row has a triangle and a circle, so it needs a square; it has outlined and shaded, so it needs solid.'
    },
    {
      id: 'p5', domain: 'patterns', d: 4,
      prompt: 'Which picture completes the grid?',
      matrix: p5,
      options: [Qd([1, 0, 1, 1]), Qd([1, 1, 1, 1]), Qd([0, 1, 0, 0]),
        Qd([1, 0, 0, 1]), Qd([1, 1, 1, 0]), Qd([0, 1, 0, 1])],
      answer: 0,
      explain: 'In every row, a square is filled in the third picture only if it is filled in exactly one of the first two. If both or neither are filled, it stays empty.'
    },
    {
      id: 'p6', domain: 'patterns', d: 5,
      prompt: 'Which picture completes the grid?',
      matrix: p6,
      options: [C('diamond', 4, 'half'), C('diamond', 4, 'solid'), C('diamond', 4, 'empty'),
        C('diamond', 3, 'half'), C('diamond', 5, 'half'), C('square', 4, 'half')],
      answer: 0,
      explain: 'The row sets the shape and the column sets the shading. In the third column the count is the first count plus the second: 1+2=3, 2+2=4, so 3+1=4. Column three is shaded.'
    },

    /* ===== Numbers ===== */
    {
      id: 'n1', domain: 'numbers', d: 1,
      prompt: 'What number comes next?  2, 4, 6, 8, ?',
      options: ['10', '9', '12', '11', '14'], answer: 0,
      explain: 'The numbers go up by 2 each time.'
    },
    {
      id: 'n2', domain: 'numbers', d: 2,
      prompt: 'What number comes next?  3, 6, 12, 24, ?',
      options: ['48', '36', '30', '42', '96'], answer: 0,
      explain: 'Each number is double the one before: 24 × 2 = 48.'
    },
    {
      id: 'n3', domain: 'numbers', d: 3,
      prompt: 'What number comes next?  2, 5, 10, 17, 26, ?',
      options: ['37', '36', '35', '38', '40'], answer: 0,
      explain: 'The gaps are 3, 5, 7, 9, so the next gap is 11 and 26 + 11 = 37. (Each term is a square plus one.)'
    },
    {
      id: 'n4', domain: 'numbers', d: 3,
      prompt: 'What number comes next?  1, 2, 4, 7, 11, 16, ?',
      options: ['22', '21', '23', '20', '24'], answer: 0,
      explain: 'The gaps grow by one each time: 1, 2, 3, 4, 5, so the next gap is 6 and 16 + 6 = 22.'
    },
    {
      id: 'n5', domain: 'numbers', d: 4,
      prompt: 'What number comes next?  5, 10, 8, 16, 14, 28, ?',
      options: ['26', '56', '30', '24', '42'], answer: 0,
      explain: 'The rule alternates: double, then subtract 2. After 28 comes subtract 2, which gives 26.'
    },
    {
      id: 'n6', domain: 'numbers', d: 5,
      prompt: 'What number comes next?  3, 4, 6, 8, 12, 16, 24, ?',
      options: ['32', '28', '30', '36', '48'], answer: 0,
      explain: 'Two sequences are interleaved, and both double: 3, 6, 12, 24 and 4, 8, 16, 32. The next number belongs to the second one: 32.'
    },

    /* ===== Words ===== */
    {
      id: 'w1', domain: 'words', d: 1,
      prompt: 'Hot is to cold as up is to …',
      options: ['down', 'high', 'over', 'hill', 'side'], answer: 0,
      explain: 'Hot and cold are opposites, and the opposite of up is down.'
    },
    {
      id: 'w2', domain: 'words', d: 2,
      prompt: 'Which one does not belong with the others?',
      options: ['Violin', 'Cello', 'Flute', 'Viola', 'Harp'], answer: 2,
      explain: 'Violin, cello, viola and harp are all string instruments. The flute is a woodwind.'
    },
    {
      id: 'w3', domain: 'words', d: 2,
      prompt: 'Author is to novel as composer is to …',
      options: ['symphony', 'orchestra', 'instrument', 'concert', 'audience'], answer: 0,
      explain: 'An author creates a novel; a composer creates a symphony. The relationship is creator and creation.'
    },
    {
      id: 'w4', domain: 'words', d: 3,
      prompt: 'Which word is closest in meaning to “ephemeral”?',
      options: ['fleeting', 'enormous', 'ancient', 'fragile', 'secret'], answer: 0,
      explain: 'Ephemeral means lasting a very short time, so “fleeting” fits. “Fragile” means easily broken, which is a different idea.'
    },
    {
      id: 'w5', domain: 'words', d: 4,
      prompt: 'Verbose is to concise as lavish is to …',
      options: ['frugal', 'generous', 'ornate', 'costly', 'abundant'], answer: 0,
      explain: 'Verbose (too many words) and concise (few words) are opposites. The opposite of lavish (extravagant) is frugal (careful with money).'
    },
    {
      id: 'w6', domain: 'words', d: 4,
      prompt: 'Choose the word that best completes the sentence: “Her argument was so ___ that even her critics struggled to find a flaw in it.”',
      options: ['cogent', 'florid', 'tenuous', 'ostentatious', 'ambiguous'], answer: 0,
      explain: '“Cogent” means clear, logical and convincing. The other words describe arguments that are ornate, weak, showy or unclear.'
    },

    /* ===== Logic ===== */
    {
      id: 'l1', domain: 'logic', d: 1,
      prompt: 'All roses are flowers. All flowers need water. Which statement must be true?',
      options: ['All roses need water', 'All roses are red', 'Some roses are trees', 'Roses need sunlight only', 'No flower is a rose'], answer: 0,
      explain: 'Roses are flowers, and flowers need water, so roses need water. The other statements are not supported by the facts.'
    },
    {
      id: 'l2', domain: 'logic', d: 2,
      prompt: 'Dee finished before Ana. Ana finished before Ben. Cy finished after Ben. Who finished third?',
      options: ['Ben', 'Ana', 'Cy', 'Dee', 'It cannot be determined'], answer: 0,
      explain: 'Putting the clues together gives the order Dee, Ana, Ben, Cy. Ben is third.'
    },
    {
      id: 'l3', domain: 'logic', d: 3,
      prompt: 'If it rains, the match is cancelled. The match was not cancelled. What can you conclude?',
      options: ['It did not rain', 'It rained', 'The match was moved indoors', 'It might have rained', 'Nothing can be concluded'], answer: 0,
      explain: 'If rain always leads to cancellation, then no cancellation means there was no rain. Rain would have forced a cancellation.'
    },
    {
      id: 'l4', domain: 'logic', d: 3,
      prompt: 'Five people each shake hands with every other person exactly once. How many handshakes happen?',
      options: ['10', '5', '15', '20', '25'], answer: 0,
      explain: 'Each of the 5 people shakes 4 hands, which is 20, but every handshake has been counted twice. 20 ÷ 2 = 10.'
    },
    {
      id: 'l5', domain: 'logic', d: 4,
      prompt: 'Some doctors are writers. All writers are readers. No reader is bored. Which statement must be true?',
      options: ['Some doctors are not bored', 'All doctors are readers', 'No doctor is bored', 'Some writers are bored', 'Some readers are not writers'], answer: 0,
      explain: 'At least one doctor is a writer. That doctor is a reader, and no reader is bored, so some doctors are not bored. The other statements go beyond what is given.'
    },
    {
      id: 'l6', domain: 'logic', d: 5,
      prompt: 'On an island, truth-tellers always tell the truth and liars always lie. A says: “B is a liar.” B says: “A and I are both truth-tellers.” What are A and B?',
      options: ['A tells the truth; B lies', 'Both tell the truth', 'Both lie', 'A lies; B tells the truth', 'It cannot be determined'], answer: 0,
      explain: 'If B were truthful, A would be truthful too, but then A’s claim that B is a liar would be false, a contradiction. So B lies. That makes A’s statement true, so A tells the truth.'
    }
  ];
})(window);
