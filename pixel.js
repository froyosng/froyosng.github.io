// Pixel-art desk scene + section icons.
// Everything is drawn at low resolution on a canvas and scaled up with
// `image-rendering: pixelated`, so one canvas pixel = one art pixel.
(function () {
  var FG = '#ffffff', AC = '#00F0FF', DIM = 'rgba(255,255,255,0.35)', BG = '#000000';
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function painter(ctx) {
    var d = {};
    d.R = function (x, y, w, h, c) { ctx.fillStyle = c; ctx.fillRect(x, y, w, h); };
    d.P = function (x, y, c) { d.R(x, y, 1, 1, c); };
    d.H = function (x1, x2, y, c) { d.R(x1, y, x2 - x1 + 1, 1, c); };
    d.V = function (x, y1, y2, c) { d.R(x, y1, 1, y2 - y1 + 1, c); };
    d.BOX = function (x, y, w, h, c) {
      d.H(x, x + w - 1, y, c); d.H(x, x + w - 1, y + h - 1, c);
      d.V(x, y, y + h - 1, c); d.V(x + w - 1, y, y + h - 1, c);
    };
    d.SPR = function (rows, x, y, map) {
      for (var j = 0; j < rows.length; j++)
        for (var i = 0; i < rows[j].length; i++) {
          var c = map[rows[j][i]];
          if (c) d.P(x + i, y + j, c);
        }
    };
    d.LINE = function (x0, y0, x1, y1, c) {
      var dx = Math.abs(x1 - x0), sx = x0 < x1 ? 1 : -1;
      var dy = -Math.abs(y1 - y0), sy = y0 < y1 ? 1 : -1, e = dx + dy;
      for (;;) {
        d.P(x0, y0, c);
        if (x0 === x1 && y0 === y1) break;
        var e2 = 2 * e;
        if (e2 >= dy) { e += dy; x0 += sx; }
        if (e2 <= dx) { e += dx; y0 += sy; }
      }
    };
    d.RING = function (cx, cy, r, c) {
      var x = r, y = 0, e = 1 - r;
      while (x >= y) {
        [[x, y], [y, x], [-y, x], [-x, y], [-x, -y], [-y, -x], [y, -x], [x, -y]]
          .forEach(function (p) { d.P(cx + p[0], cy + p[1], c); });
        y++;
        if (e < 0) e += 2 * y + 1; else { x--; e += 2 * (y - x) + 1; }
      }
    };
    d.DISC = function (cx, cy, r, c) {
      for (var y = -r; y <= r; y++)
        for (var x = -r; x <= r; x++)
          if (x * x + y * y <= r * r + r) d.P(cx + x, cy + y, c);
    };
    return d;
  }

  function seeded(s) {
    return function () { s = (s * 9301 + 49297) % 233280; return s / 233280; };
  }

  // ---------- Section icons ----------
  var ICONS = {
    chart: [
      '        #',
      '       # ',
      '   #  #  ',
      '  # ##   ',
      ' #       ',
      '#        ',
      '         ',
      '#########'
    ],
    chip: [
      '  # # #  ',
      ' ####### ',
      '##     ##',
      ' # ### # ',
      '## ### ##',
      ' # ### # ',
      '##     ##',
      ' ####### ',
      '  # # #  '
    ],
    flask: [
      '  #####  ',
      '   # #   ',
      '   # #   ',
      '  #   #  ',
      ' #  #  # ',
      '#  ###  #',
      '# ##### #',
      '#########'
    ],
    coin: [
      '  #####  ',
      ' #     # ',
      '#  ###  #',
      '#  #    #',
      '#  ###  #',
      '#    #  #',
      '#  ###  #',
      ' #     # ',
      '  #####  '
    ],
    rocket: [
      '    #    ',
      '   ###   ',
      '   # #   ',
      '   ###   ',
      '  #####  ',
      ' ## # ## ',
      ' #  #  # ',
      '   # #   ',
      '  #   #  '
    ],
    code: [
      '      #    ',
      '  #   # #  ',
      ' #   #   # ',
      '#    #    #',
      ' #  #    # ',
      '  # #   #  ',
      '    #      '
    ]
  };

  document.querySelectorAll('canvas[data-icon]').forEach(function (cv) {
    var rows = ICONS[cv.getAttribute('data-icon')];
    if (!rows) return;
    cv.width = Math.max.apply(null, rows.map(function (r) { return r.length; }));
    cv.height = rows.length;
    painter(cv.getContext('2d')).SPR(rows, 0, 0, { '#': AC });
  });

  // ---------- Desk scene ----------
  var cv = document.getElementById('scene');
  if (!cv) return;
  var W = 256, H = 96;
  cv.width = W; cv.height = H;
  var ctx = cv.getContext('2d');
  var d = painter(ctx);
  var hover = null, t = 0;
  function col(id) { return hover === id ? AC : FG; }

  var rnd = seeded(7);

  // Skyline buildings with fixed lit windows
  var buildings = [[12, 4, 12], [16, 6, 18], [45, 5, 15]].map(function (b) {
    var lit = [], top = 55 - b[2] + 1;
    for (var y = top + 2; y < 54; y += 2)
      for (var x = b[0] + 1; x < b[0] + b[1] - 1; x += 2)
        if (rnd() < 0.4) lit.push([x, y, rnd() < 0.2 ? AC : DIM]);
    return { x: b[0], w: b[1], h: b[2], top: top, lit: lit };
  });

  var STARS = [[14, 23], [20, 28], [30, 22], [44, 26], [50, 21], [36, 29], [16, 33], [53, 30], [26, 26]];

  // Candles: random walk with a slight upward drift
  var candles = [], last = 10;
  function nextCandle() {
    var o = last, c = o + (Math.random() - 0.42) * 2.2;
    var hi = Math.max(o, c) + Math.random() * 0.9, lo = Math.min(o, c) - Math.random() * 0.9;
    last = c;
    return { o: o, c: c, h: hi, l: lo };
  }
  for (var i = 0; i < 12; i++) candles.push(nextCandle());

  // Code lines: [indent, token length, rest length]
  var CODE = [[0, 3, 14], [2, 4, 11], [2, 2, 16], [4, 5, 9], [2, 3, 12], [0, 2, 6]];
  var codeTotal = CODE.reduce(function (s, l) { return s + l[1] + 1 + l[2]; }, 0);
  var typed = 0;

  var FONT = {
    P: ['##.', '#.#', '##.', '#..', '#..'],
    Y: ['#.#', '#.#', '.#.', '.#.', '.#.'],
    R: ['##.', '#.#', '##.', '#.#', '#.#']
  };
  function text(str, x, y, c) {
    for (var k = 0; k < str.length; k++) d.SPR(FONT[str[k]], x + k * 4, y, { '#': c });
  }

  var CAT = [
    ' #   #         t',
    ' ## ##        t ',
    '#     ######## #',
    '# - -         # ',
    '#             # ',
    ' #            # ',
    '  ############  '
  ];
  var Z = ['####', '..#.', '.#..', '####'];
  var TROPHY = [
    '#######',
    '#.###.#',
    ' ##### ',
    '  ###  ',
    '   #   ',
    '  ###  '
  ];
  var PLANT = [
    '       #        ',
    '      ###    +  ',
    '  #    #    ##  ',
    '  ##   #   ##   ',
    '   ##  #  ##    ',
    ' +  ## # ##     ',
    ' ##  ####   #   ',
    '  ##  ##  ###   ',
    '   ### # ##     ',
    '     #####      ',
    '       #        ',
    '       #        '
  ];

  // Books per shelf: [x, width, height]
  var books = [];
  [[49, 14], [65, 14], [84, 17]].forEach(function (shelf, s) {
    var x = 78;
    while (x < 95) {
      var w = rnd() < 0.5 ? 2 : 3, h = 8 + Math.floor(rnd() * (shelf[1] - 9));
      if (x + w > 97) break;
      books.push({ x: x, w: w, h: h, base: shelf[0], accent: s === 1 && x > 84 && x < 90 });
      x += w + (rnd() < 0.3 ? 1 : 0);
    }
  });

  function drawWindow() {
    d.BOX(8, 12, 62, 48, FG);
    d.BOX(10, 14, 58, 44, FG);
    for (var y = 15; y <= 19; y += 2) d.H(11, 66, y, FG);
    STARS.forEach(function (s, k) { if (((t >> 3) + k) % 5) d.P(s[0], s[1], DIM); });
    d.DISC(62, 25, 3, FG);
    d.P(61, 24, '#666'); d.P(63, 26, '#666');
    buildings.forEach(function (b) {
      d.R(b.x, b.top, b.w, b.h, BG);
      d.BOX(b.x, b.top, b.w, b.h, FG);
      b.lit.forEach(function (w) { d.P(w[0], w[1], w[2]); });
    });
    // Marina Bay Sands: three towers under a skypark
    [25, 31, 37].forEach(function (x) { d.R(x, 36, 4, 20, BG); d.BOX(x, 36, 4, 20, FG); });
    d.H(23, 44, 34, FG); d.H(24, 42, 35, FG);
    // Singapore Flyer with rotating spokes
    var a = t * 0.04;
    for (var k = 0; k < 4; k++) {
      var ang = a + k * Math.PI / 4;
      d.LINE(58, 44, Math.round(58 + 6 * Math.cos(ang)), Math.round(44 + 6 * Math.sin(ang)), DIM);
      d.LINE(58, 44, Math.round(58 - 6 * Math.cos(ang)), Math.round(44 - 6 * Math.sin(ang)), DIM);
    }
    d.RING(58, 44, 7, FG);
    d.LINE(58, 44, 54, 55, FG); d.LINE(58, 44, 62, 55, FG);
    for (var x = 11; x <= 66; x++) if ((x + (t >> 2)) % 5 === 0) d.P(x, 56, DIM);
    d.H(6, 71, 60, FG); d.H(6, 71, 61, FG);
  }

  function drawShelf() {
    var c = col('research');
    d.SPR(TROPHY, 80, 28, { '#': AC });
    d.H(89, 96, 33, c); d.H(90, 95, 31, DIM);
    d.BOX(76, 34, 24, 52, c);
    d.H(76, 99, 50, c); d.H(76, 99, 66, c);
    books.forEach(function (b) {
      d.BOX(b.x, b.base - b.h + 1, b.w, b.h, b.accent ? AC : c);
    });
  }

  function drawPosters() {
    // Option payoff (long call)
    var c = col('finance');
    d.BOX(106, 10, 18, 22, c);
    d.V(109, 13, 28, DIM); d.H(109, 121, 28, DIM);
    d.H(110, 115, 26, AC); d.LINE(115, 26, 121, 15, AC);
    d.BOX(128, 14, 13, 16, FG);
    text('PY', 131, 18, FG); d.H(131, 137, 25, DIM);
    // Bell curve
    d.BOX(145, 8, 22, 20, FG);
    d.H(147, 164, 24, DIM);
    for (var x = 0; x < 18; x++) {
      var y = 24 - Math.round(12 * Math.exp(-Math.pow(x - 8.5, 2) / 14));
      d.P(147 + x, y, AC);
    }
    d.BOX(171, 13, 11, 14, FG);
    text('R', 175, 17, FG);
  }

  function drawDesk() {
    d.H(106, 206, 62, FG); d.H(106, 206, 63, FG);
    d.V(108, 64, 85, FG); d.V(204, 64, 85, FG);
    d.BOX(110, 64, 20, 8, FG); d.H(118, 122, 67, DIM);

    // Chart monitor
    var q = col('quant');
    d.BOX(114, 36, 40, 24, q);
    d.V(133, 60, 61, q); d.H(128, 138, 61, q);
    var lo = Infinity, hi = -Infinity;
    candles.forEach(function (k) { lo = Math.min(lo, k.l); hi = Math.max(hi, k.h); });
    function py(v) { return Math.round(56 - (v - lo) / (hi - lo || 1) * 17); }
    candles.forEach(function (k, i) {
      var x = 116 + i * 3, top = py(Math.max(k.o, k.c)), bot = py(Math.min(k.o, k.c));
      d.V(x, py(k.h), py(k.l), DIM);
      d.R(x, top, 2, Math.max(1, bot - top + 1), k.c >= k.o ? AC : FG);
    });

    // Code monitor
    var cc = col('code');
    d.BOX(158, 38, 34, 22, cc);
    d.V(174, 60, 61, cc); d.H(170, 178, 61, cc);
    var left = typed, cursor = null;
    CODE.forEach(function (l, j) {
      var y = 41 + j * 3, x = 161 + l[0], n = l[1] + 1 + l[2];
      var shown = Math.max(0, Math.min(n, left));
      for (var k = 0; k < shown; k++) {
        if (k === l[1]) continue;
        d.P(x + k, y, k < l[1] ? AC : DIM);
      }
      if (left >= 0 && left < n) cursor = [x + shown, y];
      left -= n;
    });
    if (!cursor) cursor = [161, 41 + CODE.length * 3];
    if ((t >> 2) % 2 === 0 && cursor[1] < 58) d.V(cursor[0], cursor[1] - 1, cursor[1], FG);

    // Mug + steam
    d.BOX(196, 56, 5, 6, FG);
    d.V(202, 57, 59, FG); d.P(201, 57, FG); d.P(201, 59, FG);
    for (var s = 0; s < 3; s++) d.P(197 + (((t >> 2) + s) % 2) * 2, 53 - s, DIM);

    // PC tower
    var sc = col('systems');
    d.R(186, 66, 13, 20, BG);
    d.BOX(186, 66, 13, 20, sc);
    [72, 74, 76].forEach(function (y) { d.H(189, 196, y, DIM); });
    d.P(189, 69, (t >> 3) % 2 ? AC : DIM);

    // Chair, drawn last so it sits in front of the desk
    d.R(130, 58, 16, 14, BG);
    d.BOX(130, 58, 16, 14, FG);
    d.V(134, 60, 69, DIM); d.V(141, 60, 69, DIM);
    d.H(127, 149, 73, FG);
    d.V(138, 74, 80, FG);
    d.LINE(138, 80, 130, 84, FG); d.LINE(138, 80, 146, 84, FG);
    d.P(129, 85, FG); d.P(147, 85, FG); d.P(138, 85, FG);
  }

  function drawRoom() {
    d.H(0, 255, 2, FG);
    d.H(0, 255, 86, FG);
    for (var x = 0; x < 256; x += 12) { d.P(x, 89, DIM); d.P(x + 6, 92, DIM); }

    // Cat asleep on the floor
    d.SPR(CAT, 54, 79, { '#': FG, '-': DIM, 't': (t >> 4) % 3 ? FG : null });
    if ((t >> 4) % 3 === 0) { d.P(69, 79, FG); d.P(70, 80, FG); }
    var zy = 74 - ((t >> 3) % 6);
    if ((t >> 3) % 6 < 5) d.SPR(Z, 50, zy, { '#': DIM });

    // Plant
    var v = col('ventures');
    d.SPR(PLANT, 212, 62, { '#': v, '+': (t >> 4) % 2 ? AC : v });
    d.H(212, 229, 74, v); d.BOX(214, 75, 14, 11, v);

    // Floor lamp
    d.H(241, 249, 85, FG); d.V(245, 40, 84, FG);
    d.H(241, 249, 32, FG); d.H(239, 251, 39, FG);
    d.LINE(241, 32, 239, 39, FG); d.LINE(249, 32, 251, 39, FG);
    d.P(245, 40, AC);
  }

  function draw() {
    d.R(0, 0, W, H, BG);
    drawRoom();
    drawWindow();
    drawShelf();
    drawPosters();
    drawDesk();
  }

  function tick() {
    t++;
    if (t % 8 === 0) { candles.shift(); candles.push(nextCandle()); }
    typed = typed > codeTotal + 25 ? 0 : typed + 1;
    draw();
  }

  // Hotspots recolour their object on hover/focus
  document.querySelectorAll('.hot').forEach(function (a) {
    var id = a.getAttribute('data-id');
    function on() { hover = id; draw(); }
    function off() { if (hover === id) { hover = null; draw(); } }
    a.addEventListener('mouseenter', on); a.addEventListener('focus', on);
    a.addEventListener('mouseleave', off); a.addEventListener('blur', off);
  });

  typed = codeTotal;
  draw();
  if (reduced) return;

  // Only animate while the scene is on screen
  var timer = null;
  function start() { if (!timer) timer = setInterval(tick, 100); }
  function stop() { clearInterval(timer); timer = null; }
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (e) { e[0].isIntersecting ? start() : stop(); }).observe(cv);
  } else {
    start();
  }
})();
