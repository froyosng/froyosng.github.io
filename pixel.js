// Pixel-art desk scene + section icons.
// Everything is drawn at low resolution on a canvas and scaled up with
// `image-rendering: pixelated`, so one canvas pixel = one art pixel.
(function () {
  var FG = '#F7F5F2', DIM = 'rgba(247,245,242,0.4)', BG = '#221A4A';
  var HOT = '#F6EF75', UP = '#93E8FF', DN = '#FF77B7', LIT = '#F6EF75';
  var ICON = '#7657FF', INK = '#17151D', INK_DIM = 'rgba(23,21,29,0.3)', LEMON_BG = '#FBF8D0';
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

  var FONT = {
    P: ['##.', '#.#', '##.', '#..', '#..'],
    Y: ['#.#', '#.#', '.#.', '.#.', '.#.'],
    R: ['##.', '#.#', '##.', '#.#', '#.#'],
    B: ['##.', '#.#', '##.', '#.#', '##.'],
    I: ['###', '.#.', '.#.', '.#.', '###'],
    D: ['##.', '#.#', '#.#', '#.#', '##.'],
    E: ['###', '#..', '##.', '#..', '###'],
    C: ['.##', '#..', '#..', '#..', '.##'],
    M: ['#.#', '###', '###', '#.#', '#.#'],
    N: ['##.', '#.#', '#.#', '#.#', '#.#'],
    A: ['.#.', '#.#', '###', '#.#', '#.#'],
    H: ['#.#', '#.#', '###', '#.#', '#.#'],
    S: ['.##', '#..', '.#.', '..#', '##.']
  };
  function text(d, str, x, y, c) {
    for (var k = 0; k < str.length; k++) d.SPR(FONT[str[k]], x + k * 4, y, { '#': c });
  }

  function animate(cv, tick) {
    if (reduced) return;
    var timer = null;
    function start() { if (!timer) timer = setInterval(tick, 100); }
    function stop() { clearInterval(timer); timer = null; }
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (e) { e[0].isIntersecting ? start() : stop(); }).observe(cv);
    } else {
      start();
    }
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
    star: [
      '    #    ',
      '    #    ',
      '   ###   ',
      '#########',
      ' ####### ',
      '  #####  ',
      '  ## ##  ',
      ' ##   ## ',
      '#       #'
    ],
    heart: [
      ' ##   ## ',
      '#### ####',
      '#########',
      '#########',
      ' ####### ',
      '  #####  ',
      '   ###   ',
      '    #    '
    ],
    frog: [
      ' ###    ### ',
      '#wwk#  #wwk#',
      '#wwk####wwk#',
      '#gggggggggg#',
      '#gg#gggg#gg#',
      '#ggg####ggg#',
      ' #gggggggg# ',
      '##g##  ##g##'
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

  var ICON_MAPS = { frog: { '#': INK, g: '#8FD694', w: '#FFFFFF', k: INK } };

  document.querySelectorAll('canvas[data-icon]').forEach(function (cv) {
    var rows = ICONS[cv.getAttribute('data-icon')];
    if (!rows) return;
    cv.width = Math.max.apply(null, rows.map(function (r) { return r.length; }));
    cv.height = rows.length;
    var map = ICON_MAPS[cv.getAttribute('data-icon')] || { '#': ICON };
    painter(cv.getContext('2d')).SPR(rows, 0, 0, map);
  });

  // ---------- Hawk cam (CV flagship) ----------
  // A mynah lands on the canteen table, gets detected, and a hawk decoy on a
  // ceiling rail swoops down the rail's dip to scare it off, then glides home.
  (function () {
    var cv = document.getElementById('birdcam');
    if (!cv) return;
    var W = 128, H = 72;
    cv.width = W; cv.height = H;
    var d = painter(cv.getContext('2d')), t = 0;
    var YEL = '#D9A900', CYCLE = 110, DOCK = 14, TARGET = 84;

    var MYNAH = [
      '  ###     ',
      ' #y##     ',
      'y#######  ',
      ' ######## ',
      '  ######  ',
      '   y  y   '
    ];
    var MYNAH_FLY = [
      '     # #  ',
      '  ### ##  ',
      ' #y#####  ',
      'y######## ',
      '  ###### #',
      '          '
    ];
    // Hawk seen from below: broad wings, fanned tail
    var HAWK_UP = [
      '#                #',
      '##      ##      ##',
      ' ###   ####   ### ',
      '  ##############  ',
      '   ############   ',
      '       ####       ',
      '       ####       ',
      '      ######      ',
      '     ########     '
    ];
    var HAWK_DOWN = [
      '        ##        ',
      '       ####       ',
      '##   ########   ##',
      '##################',
      ' ################ ',
      '   ##  ####  ##   ',
      '       ####       ',
      '      ######      ',
      '     ########     '
    ];

    // Rollercoaster rail: a small hump, then a deep dip over the plate
    function railY(x) {
      return Math.round(12 - 4 * Math.exp(-Math.pow((x - 40) / 10, 2))
                           + 22 * Math.exp(-Math.pow((x - TARGET) / 13, 2)));
    }

    function dashed(x, y, w, h, c) {
      for (var i = 0; i < w; i += 2) { d.P(x + i, y, c); d.P(x + i, y + h - 1, c); }
      for (var j = 0; j < h; j += 2) { d.P(x, y + j, c); d.P(x + w - 1, y + j, c); }
    }

    // Optional hawk call, synthesised so no audio file is needed. Off by default.
    var audio = null, soundOn = false;
    function screech() {
      if (!audio) return;
      var t0 = audio.currentTime;
      var o = audio.createOscillator(), lfo = audio.createOscillator();
      var lg = audio.createGain(), bp = audio.createBiquadFilter(), g = audio.createGain();
      o.type = 'sawtooth';
      o.frequency.setValueAtTime(2600, t0);
      o.frequency.exponentialRampToValueAtTime(1400, t0 + 0.7);
      lfo.frequency.value = 28; lg.gain.value = 140;
      lfo.connect(lg); lg.connect(o.frequency);
      bp.type = 'bandpass'; bp.frequency.value = 2200; bp.Q.value = 2;
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(0.15, t0 + 0.05);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.8);
      o.connect(bp); bp.connect(g); g.connect(audio.destination);
      o.start(t0); lfo.start(t0); o.stop(t0 + 0.85); lfo.stop(t0 + 0.85);
    }
    var btn = document.querySelector('[data-hawk-sound]');
    if (btn) btn.addEventListener('click', function () {
      soundOn = !soundOn;
      btn.setAttribute('aria-pressed', soundOn);
      btn.textContent = soundOn ? 'SOUND: ON' : 'SOUND: OFF';
      if (soundOn) {
        var AC = window.AudioContext || window.webkitAudioContext;
        if (!audio && AC) audio = new AC();
        if (audio && audio.state === 'suspended') audio.resume();
        screech();
      }
    });

    function hawkX(p) {
      if (p < 40 || p >= 95) return DOCK;
      if (p < 58) { var u = (p - 40) / 18; return DOCK + (TARGET - DOCK) * u * u; }  // accelerate into the dip
      if (p < 70) return TARGET;
      var v = (p - 70) / 25; return TARGET - (TARGET - DOCK) * (1 - (1 - v) * (1 - v)); // coast home
    }

    function draw() {
      var p = t % CYCLE;
      d.R(0, 0, W, H, LEMON_BG);

      // Ceiling, rail supports and the rail itself
      d.H(0, W - 1, 3, INK);
      [14, 40, 62, 106, 120].forEach(function (x) { d.V(x, 4, railY(x) - 2, INK_DIM); });
      for (var x = 4; x < W - 4; x++) {
        var y = railY(x);
        d.P(x, y, INK); d.P(x, y - 1, INK);
        if (x % 4 === 0) d.P(x, y - 2, INK_DIM);
      }
      d.R(DOCK - 4, railY(DOCK) - 4, 9, 3, INK_DIM);

      // Table, plate and food
      d.H(0, W - 1, 56, INK); d.H(0, W - 1, 57, INK);
      d.V(12, 58, 71, INK); d.V(115, 58, 71, INK);
      d.H(TARGET - 8, TARGET + 10, 55, INK); d.H(TARGET - 6, TARGET + 8, 54, INK_DIM);
      d.P(TARGET + 6, 53, YEL); d.P(TARGET + 8, 53, YEL);

      // Mynah: hop to the plate, peck, flee once the hawk arrives
      var bx, by, flying = false;
      if (p < 39) { bx = 4 + p * 2; by = 50 - (p % 4 < 2 ? 0 : 1); }
      else if (p < 58) { bx = TARGET - 6; by = 50 + (p % 4 < 2 ? 1 : 0); }
      else { flying = true; bx = TARGET - 6 + (p - 58) * 3; by = 50 - (p - 58) * 2; }
      if (bx < W && by > -8) {
        d.SPR(flying && (t >> 1) % 2 ? MYNAH_FLY : MYNAH, bx, by,
          { '#': INK, 'y': YEL });
      }
      if (p >= 14 && p < 60) {
        dashed(bx - 2, by - 2, 14, 10, DN);
        d.R(bx - 2, by - 9, 21, 7, DN);
        text(d, 'MYNAH', bx - 1, by - 8, INK);
      }

      // Hawk hangs from a trolley on the rail
      var hx = Math.round(hawkX(p)), ry = railY(hx);
      var moving = p >= 40 && p < 95 && !(p >= 58 && p < 70);
      d.R(hx - 1, ry - 3, 3, 2, INK);
      d.V(hx, ry + 1, ry + 3, INK);
      d.SPR(moving && (t >> 1) % 2 ? HAWK_DOWN : HAWK_UP, hx - 8, ry + 4, { '#': INK });

      // Screech: sound rings from the hawk, and the call if sound is on
      if (p >= 56 && p < 68) {
        var k = (p - 56) % 4;
        for (var r = 0; r < 3; r++) {
          var rad = 11 + k * 2 + r * 5;
          for (var a = -0.9; a <= 0.9; a += 0.12) {
            d.P(Math.round(hx + 1 + rad * Math.cos(a)), Math.round(ry + 8 + rad * Math.sin(a)), DN);
          }
        }
        text(d, 'SCREECH', hx - 38, ry + 2, INK);
      }
      if (p === 56 && soundOn) screech();

      // Viewfinder
      [[3, 7, 1, 1], [124, 7, -1, 1], [3, 68, 1, -1], [124, 68, -1, -1]].forEach(function (c) {
        d.H(Math.min(c[0], c[0] + 4 * c[2]), Math.max(c[0], c[0] + 4 * c[2]), c[1], INK);
        d.V(c[0], Math.min(c[1], c[1] + 4 * c[3]), Math.max(c[1], c[1] + 4 * c[3]), INK);
      });
      if ((t >> 3) % 2 === 0) d.R(18, 63, 3, 3, DN);
      text(d, 'REC', 23, 62, INK);
    }

    if (reduced) t = 60;  // a still frame that still tells the story
    draw();
    animate(cv, function () { t++; draw(); });
  })();

  // ---------- Pixel me ----------
  var SKIN = '#F2C9A5', HAIR = '#1E1B24', COAT = '#D8CBB3', COAT_SH = '#B9AB90';

  // Standing, front view (16 x 32). h hair, s skin, g glasses, k eyes, m mouth,
  // w teeth, c/C coat, t black top, p trousers, b shoes
  var ME = [
    '    hhhhhhhh    ',
    '   hhhhhhhhhh   ',
    '  hhhhhhhhhhhh  ',
    '  hhhhhhhhhhhh  ',
    '  hhhshhhhshhh  ',
    '  hssssssssssh  ',
    '  gggggssggggg  ',
    '  gsksggggsksg  ',
    '  gggggssggggg  ',
    '  ssssssssssss  ',
    '  sssmwwwwmsss  ',
    '  ssssmmmmssss  ',
    '   ssssssssss   ',
    '   ccctttttccc  ',
    ' cccccttttccccc ',
    'cCccctttttcccCcc',
    'cCccctttttcccCcc',
    'cCccctttttcccCcc',
    'cCccctttttcccCcc',
    'cCccctttttcccCcc',
    'cCccctttttcccCcc',
    'cCccctttttcccCcc',
    'sCccctttttcccCcs',
    'sCccctttttcccCcs',
    '  cCccctttccCc  ',
    '  cCccctttccCc  ',
    '  cCccctttccCc  ',
    '  cCccctttccCc  ',
    '   pppp  pppp   ',
    '   pppp  pppp   ',
    '   pppp  pppp   ',
    '  bbbbb  bbbbb  '
  ];
  var HELMET = [
    '    HHHHHHHH    ',
    '   HHHHHHwHHH   ',
    '  HHHHHHHHHwHH  ',
    '  HHHHHHHHHHHH  ',
    '  HhhhshhhhshH  ',
    '  HssssssssssH  '
  ];

  function meGrid(opts) {
    var rows = ME.map(function (r) { return r.split(''); });
    if (opts.ski) {
      HELMET.forEach(function (r, j) { rows[j] = r.split(''); });
      [9, 10, 11].forEach(function (j) { rows[j][2] = 'H'; rows[j][13] = 'H'; });
    }
    if (opts.blink) { rows[7] = '  gkkkggggkkkg  '.split(''); }
    if (opts.wave) {
      // Drop the right arm and raise it instead
      for (var j = 15; j <= 23; j++) { rows[j][15] = '.'; rows[j][14] = 'c'; }
      for (j = 0; j < rows.length; j++) rows[j].push('.', '.');
      for (j = 9; j <= 14; j++) { rows[j][15] = 'c'; rows[j][16] = 'c'; }
      var hx = opts.wave === 2 ? 17 : 16;
      rows[7][hx] = 's'; rows[8][hx] = 's'; rows[7][hx - 1] = 's'; rows[8][hx - 1] = 's';
    }
    return rows;
  }

  // ---------- Hero avatar: blinks, waves on hover, 3 clicks = ski mode ----------
  (function () {
    var btn = document.querySelector('[data-me]');
    if (!btn) return;
    var cv = btn.querySelector('canvas');
    var bubble = btn.querySelector('.me-bubble');
    var W = 28, H = 36, OX = 5, OY = 2;
    cv.width = W; cv.height = H;
    var ctx = cv.getContext('2d'), d = painter(ctx);
    var t = 0, hovering = false, ski = false, clicks = 0;
    var MAP = {
      h: HAIR, s: SKIN, g: INK, k: INK, m: '#9C3550', w: '#FFFFFF',
      c: COAT, C: COAT_SH, t: INK, p: '#2A2733', b: '#4A4752', H: '#26232C'
    };

    function draw() {
      ctx.clearRect(0, 0, W, H);
      var rows = meGrid({
        ski: ski,
        blink: t % 40 < 2,
        wave: hovering && !ski ? (reduced ? 1 : 1 + ((t >> 2) % 2)) : 0
      });
      var map = Object.assign({}, MAP, ski ? { b: '#3D5BD9' } : {});
      var filled = function (x, y) {
        return y >= 0 && y < rows.length && x >= 0 && x < rows[y].length && map[rows[y][x]];
      };
      // 1px ink outline so the beige coat reads on the milk background
      for (var y = -1; y <= rows.length; y++)
        for (var x = -1; x <= 18; x++)
          if (!filled(x, y) && (filled(x - 1, y) || filled(x + 1, y) || filled(x, y - 1) || filled(x, y + 1)))
            d.P(OX + x, OY + y, INK);
      d.SPR(rows.map(function (r) { return r.join(''); }), OX, OY, map);

      if (ski) {
        // Ski in the left hand, pole in the right
        d.R(1, 3, 3, 33, INK); d.R(2, 4, 1, 31, '#D8412F');
        for (var s = 8; s < 30; s += 3) d.P(2, s, '#F6C945');
        d.V(22, 22, 35, '#6B6B68'); d.R(21, 20, 3, 4, '#C8A45A');
      }
    }

    function say(msg) { bubble.textContent = msg; }

    btn.addEventListener('mouseenter', function () { hovering = true; say(ski ? 'BRRR!' : 'HI!'); draw(); });
    btn.addEventListener('mouseleave', function () { hovering = false; draw(); });
    btn.addEventListener('focus', function () { hovering = true; draw(); });
    btn.addEventListener('blur', function () { hovering = false; draw(); });
    btn.addEventListener('click', function () {
      clicks++;
      if (clicks % 3 === 1) say(ski ? 'LEAVING?' : 'HEY!');
      if (clicks % 3 === 2) say('ONE MORE…');
      if (clicks % 3 === 0) {
        ski = !ski;
        say(ski ? 'SKI MODE!' : 'BACK TO WORK');
        btn.setAttribute('aria-label', ski ? 'Pixel Zhenhao in ski gear' : 'Pixel Zhenhao');
        if (ski && clicks === 3 && window.froyoToast) window.froyoToast('+1 SIGNAL', 'Ski mode unlocked.');
      }
      draw();
    });

    draw();
    animate(cv, function () { t++; draw(); });
  })();

  // ---------- Desk scene ----------
  var cv = document.getElementById('scene');
  if (!cv) return;
  var W = 256, H = 96;
  cv.width = W; cv.height = H;
  var ctx = cv.getContext('2d');
  var d = painter(ctx);
  var hover = null, t = 0;
  function col(id) { return hover === id ? HOT : FG; }

  var rnd = seeded(7);

  // Skyline buildings with fixed lit windows
  var buildings = [[12, 4, 12], [16, 6, 18], [45, 5, 15]].map(function (b) {
    var lit = [], top = 55 - b[2] + 1;
    for (var y = top + 2; y < 54; y += 2)
      for (var x = b[0] + 1; x < b[0] + b[1] - 1; x += 2)
        if (rnd() < 0.4) lit.push([x, y, rnd() < 0.3 ? LIT : DIM]);
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
  var ME_SCENE = { o: FG, h: '#0E0C14', s: SKIN, g: '#0E0C14', k: '#0E0C14', m: '#B84A5E', w: '#FFFFFF', c: COAT, p: '#0E0C14' };
  var ME_BACK = [
    '   oooooo   ',
    '  ohhhhhho  ',
    ' ohhhhhhhho ',
    ' ohhhhhhhho ',
    ' ohhhhhhhho ',
    '  ohhhhhho  ',
    '   osssso   ',
    ' occcccccco ',
    'occcccccccco',
    'occcccccccco'
  ];
  var ME_FRONT = [
    '   oooooo   ',
    '  ohhhhhho  ',
    ' ohhhhhhhho ',
    ' ohhshhhsho ',
    ' ogggssgggo ',
    ' ogsggggsgo ',
    ' osssssssso ',
    ' ossmwwmsso ',
    '  osssssso  ',
    '   occcco   ',
    ' occcccccco ',
    'occcccccccco',
    'occcccccccco',
    'occcccccccco',
    ' oppppppppo ',
    ' oppo  oppo '
  ];
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
    d.DISC(62, 25, 3, LIT);
    d.P(61, 24, '#C9C25A'); d.P(63, 26, '#C9C25A');
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
    d.SPR(TROPHY, 80, 28, { '#': LIT });
    d.H(89, 96, 33, c); d.H(90, 95, 31, DIM);
    d.BOX(76, 34, 24, 52, c);
    d.H(76, 99, 50, c); d.H(76, 99, 66, c);
    books.forEach(function (b) {
      d.BOX(b.x, b.base - b.h + 1, b.w, b.h, b.accent ? DN : c);
    });
  }

  function drawPosters() {
    // Option payoff (long call)
    var c = col('finance');
    d.BOX(106, 10, 18, 22, c);
    d.V(109, 13, 28, DIM); d.H(109, 121, 28, DIM);
    d.H(110, 115, 26, DN); d.LINE(115, 26, 121, 15, DN);
    d.BOX(128, 14, 13, 16, FG);
    text(d, 'PY', 131, 18, FG); d.H(131, 137, 25, DIM);
    // Bell curve
    d.BOX(145, 8, 22, 20, FG);
    d.H(147, 164, 24, DIM);
    for (var x = 0; x < 18; x++) {
      var y = 24 - Math.round(12 * Math.exp(-Math.pow(x - 8.5, 2) / 14));
      d.P(147 + x, y, UP);
    }
    d.BOX(171, 13, 11, 14, FG);
    text(d, 'R', 175, 17, FG);
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
      d.R(x, top, 2, Math.max(1, bot - top + 1), k.c >= k.o ? UP : DN);
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
        d.P(x + k, y, k < l[1] ? UP : DIM);
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
    d.P(189, 69, (t >> 3) % 2 ? UP : DIM);

    if (hover !== 'me') d.SPR(ME_BACK, 132, 48, ME_SCENE);

    // Chair, drawn last so it sits in front of the desk
    d.R(130, 58, 16, 14, BG);
    d.BOX(130, 58, 16, 14, FG);
    d.V(134, 60, 69, DIM); d.V(141, 60, 69, DIM);
    d.H(127, 149, 73, FG);
    d.V(138, 74, 80, FG);
    d.LINE(138, 80, 130, 84, FG); d.LINE(138, 80, 146, 84, FG);
    d.P(129, 85, FG); d.P(147, 85, FG); d.P(138, 85, FG);

    if (hover === 'me') {
      d.SPR(ME_FRONT, 132, 46, ME_SCENE);
      var up = (t >> 2) % 2;
      d.LINE(143, 57, 145, 52, COAT);
      d.R(145 + up, 49, 2, 3, SKIN);
    }
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
    d.SPR(PLANT, 212, 62, { '#': v, '+': (t >> 4) % 2 ? DN : v });
    d.H(212, 229, 74, v); d.BOX(214, 75, 14, 11, v);

    // Floor lamp
    d.H(241, 249, 85, FG); d.V(245, 40, 84, FG);
    d.H(241, 249, 32, FG); d.H(239, 251, 39, FG);
    d.LINE(241, 32, 239, 39, FG); d.LINE(249, 32, 251, 39, FG);
    d.P(245, 40, LIT);
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
  animate(cv, tick);
})();
