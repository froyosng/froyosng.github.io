// Live bubble-stabilisation simulator for the HST flagship.
// Runs the true nonlinear model from the 40.018 report (Schmitt, Tramontana &
// Westerhoff 2020, Eqs. 1-3) with and without the reduced-order state feedback.
(function () {
  var root = document.querySelector('[data-sim]');
  if (!root) return;

  var P = { r: 0.1, alpha: 1, s2: 1, phi: 1, kappa: 1, beta: 3.6, N: 60 };
  var X3_STAR = Math.tanh(-P.beta * P.kappa / 2);
  var K_BASE = [0.3431, 0.1540, 0];     // poles {0.35, 0.40, 0} at chi = 0.2
  var K_RETUNED = [1.1218, 0.1540, 0];  // same poles, re-linearised at chi = 1.0

  var W = 560, H = 280, M = { l: 44, r: 16, t: 16, b: 34 };
  var Y_MIN = -1.5, Y_MAX = 3.5;
  var C_OPEN = '#FF77B7', C_CTRL = '#7657FF', GRID = '#E7E4EA', INK = '#17151D', MUTED = '#69666F';

  var svg = root.querySelector('svg');
  var tip = root.querySelector('.sim-tip');
  var slider = root.querySelector('[data-sim-a]');
  var aOut = root.querySelector('[data-sim-a-out]');
  var chiBtns = root.querySelectorAll('[data-sim-chi]');
  var retune = root.querySelector('[data-sim-retune]');
  var stats = {
    peak: root.querySelector('[data-stat="peak"]'),
    final: root.querySelector('[data-stat="final"]'),
    u: root.querySelector('[data-stat="u"]')
  };
  var tbody = root.querySelector('tbody');

  var chi = 0.2, data = null;

  function simulate(a, K) {
    var x1 = a, x2 = a, x3 = X3_STAR, xs = [x1], us = [];
    for (var t = 1; t <= P.N; t++) {
      var u = K ? -(K[0] * x1 + K[1] * x2 + K[2] * (x3 - X3_STAR)) : 0;
      us.push(u);
      var n1 = ((1 - x3) / 2 * (1 + chi) * x1 + (1 + x3) / 2 * (1 - P.phi) * x1 + P.alpha * P.s2 * u) / (1 + P.r);
      var n3 = Math.tanh(P.beta / 2 * ((n1 - (1 + P.r) * x1) * (-(chi + P.phi) * x2 / (P.alpha * P.s2)) - P.kappa));
      x2 = x1; x1 = n1; x3 = n3;
      xs.push(x1);
    }
    return { x: xs, u: us };
  }

  var sx = function (t) { return M.l + t / P.N * (W - M.l - M.r); };
  var sy = function (v) { return M.t + (Y_MAX - v) / (Y_MAX - Y_MIN) * (H - M.t - M.b); };

  function fmt(v) {
    var a = Math.abs(v);
    if (a !== 0 && (a < 1e-3 || a >= 1e5)) return v.toExponential(1).replace('e+', 'e').replace('e', '×10^');
    return v.toFixed(a < 10 ? 3 : 1);
  }

  function fmtHTML(v) {
    var s = fmt(v);
    return s.indexOf('^') > -1 ? s.replace(/\^\+?(-?\d+)/, '<sup>$1</sup>') : s;
  }

  // Path that stops (and reports where) once the series leaves the plot range
  function path(xs) {
    var d = '', out = null;
    for (var t = 0; t < xs.length; t++) {
      var v = xs[t];
      if (!isFinite(v) || v > Y_MAX || v < Y_MIN) {
        // Run the line to the plot edge, then stop
        var prev = xs[t - 1], edge = v > Y_MAX || !isFinite(v) ? Y_MAX : Y_MIN;
        var f = isFinite(v) ? (edge - prev) / (v - prev) : 0;
        var tx = t - 1 + f;
        d += 'L' + sx(tx).toFixed(1) + ',' + sy(edge).toFixed(1);
        out = { t: tx };
        break;
      }
      d += (t ? 'L' : 'M') + sx(t).toFixed(1) + ',' + sy(v).toFixed(1);
    }
    return { d: d, out: out };
  }

  function render() {
    var a = parseFloat(slider.value);
    var K = chi === 1 && retune.checked ? K_RETUNED : K_BASE;
    var open = simulate(a, null), ctrl = simulate(a, K);
    data = { open: open, ctrl: ctrl };

    var g = '';
    for (var v = -1; v <= 3; v++) {
      g += '<line x1="' + M.l + '" x2="' + (W - M.r) + '" y1="' + sy(v) + '" y2="' + sy(v) + '" stroke="' + (v === 0 ? '#B9B6C2' : GRID) + '" stroke-width="1"/>';
      g += '<text x="' + (M.l - 8) + '" y="' + (sy(v) + 4) + '" text-anchor="end" class="tick">' + v + '</text>';
    }
    g += '<text x="' + (W - M.r) + '" y="' + (sy(0) - 6) + '" text-anchor="end" class="tick">fair value</text>';
    for (var t = 0; t <= P.N; t += 10) {
      g += '<text x="' + sx(t) + '" y="' + (H - M.b + 18) + '" text-anchor="middle" class="tick">' + t + '</text>';
    }
    g += '<text x="' + (W - M.r) + '" y="' + (H - 2) + '" text-anchor="end" class="axis">period t</text>';
    g += '<text x="' + M.l + '" y="' + (M.t - 4) + '" class="axis">price deviation x₁ = P − F</text>';

    var po = path(open.x), pc = path(ctrl.x);
    g += '<path d="' + po.d + '" fill="none" stroke="' + C_OPEN + '" stroke-width="2" stroke-dasharray="6 4" stroke-linejoin="round" stroke-linecap="round"/>';
    g += '<path d="' + pc.d + '" fill="none" stroke="' + C_CTRL + '" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>';

    // Label one thing: the uncontrolled peak, or where a series escapes the plot
    var gone = [[po, 'no regulator'], [pc, 'regulated']].filter(function (s) { return s[0].out; });
    if (gone.length) {
      var tEdge = Math.max.apply(null, gone.map(function (s) { return s[0].out.t; }));
      var msg = gone.length === 2 ? '↑ both diverge' : '↑ ' + gone[0][1] + ' diverges';
      g += '<text x="' + Math.min(sx(tEdge) + 10, W - M.r - 130) + '" y="' + (M.t + 18) + '" class="note">' + msg + '</text>';
    }
    if (!po.out) {
      var pk = 0;
      open.x.forEach(function (v, i) { if (v > open.x[pk]) pk = i; });
      g += '<circle cx="' + sx(pk) + '" cy="' + sy(open.x[pk]) + '" r="4" fill="' + C_OPEN + '" stroke="#FFFDFC" stroke-width="2"/>';
      g += '<text x="' + (sx(pk) + (pk > 45 ? -8 : 8)) + '" y="' + (sy(open.x[pk]) - 8) + '" text-anchor="' + (pk > 45 ? 'end' : 'start') + '" class="note">peak ' + open.x[pk].toFixed(2) + '</text>';
    }

    g += '<g class="hover" visibility="hidden"><line class="xhair" y1="' + M.t + '" y2="' + (H - M.b) + '" stroke="' + INK + '" stroke-opacity="0.3"/>' +
         '<circle class="d-open" r="4" fill="' + C_OPEN + '" stroke="#FFFDFC" stroke-width="2"/>' +
         '<circle class="d-ctrl" r="4" fill="' + C_CTRL + '" stroke="#FFFDFC" stroke-width="2"/></g>';
    g += '<rect class="hit" x="' + M.l + '" y="' + M.t + '" width="' + (W - M.l - M.r) + '" height="' + (H - M.t - M.b) + '" fill="transparent"/>';
    svg.innerHTML = g;

    var peakOpen = Math.max.apply(null, open.x.map(Math.abs));
    var peakU = Math.max.apply(null, ctrl.u.map(Math.abs));
    stats.peak.innerHTML = fmtHTML(peakOpen);
    stats.final.innerHTML = fmtHTML(Math.abs(ctrl.x[P.N]));
    stats.u.innerHTML = fmtHTML(peakU);

    var rows = '';
    for (var k = 0; k <= P.N; k += 5) {
      rows += '<tr><td>' + k + '</td><td>' + fmtHTML(open.x[k]) + '</td><td>' + fmtHTML(ctrl.x[k]) + '</td><td>' + (k < P.N ? fmtHTML(ctrl.u[k]) : '—') + '</td></tr>';
    }
    tbody.innerHTML = rows;

    svg.setAttribute('aria-label', 'Simulated price deviation over 60 periods from an initial bubble of ' + a +
      ' with chartist strength ' + chi + '. Peak without a regulator: ' + fmt(peakOpen) +
      '. Final deviation with state feedback: ' + fmt(Math.abs(ctrl.x[P.N])) + '.');
    bindHover();
  }

  function bindHover() {
    var hit = svg.querySelector('.hit'), hover = svg.querySelector('.hover');
    function show(e) {
      var box = svg.getBoundingClientRect();
      var px = (e.clientX - box.left) / box.width * W;
      var t = Math.max(0, Math.min(P.N, Math.round((px - M.l) / (W - M.l - M.r) * P.N)));
      var vo = data.open.x[t], vc = data.ctrl.x[t];
      hover.setAttribute('visibility', 'visible');
      hover.querySelector('.xhair').setAttribute('x1', sx(t));
      hover.querySelector('.xhair').setAttribute('x2', sx(t));
      var clamp = function (v) { return Math.max(Y_MIN, Math.min(Y_MAX, isFinite(v) ? v : Y_MAX)); };
      hover.querySelector('.d-open').setAttribute('cx', sx(t));
      hover.querySelector('.d-open').setAttribute('cy', sy(clamp(vo)));
      hover.querySelector('.d-ctrl').setAttribute('cx', sx(t));
      hover.querySelector('.d-ctrl').setAttribute('cy', sy(clamp(vc)));
      tip.innerHTML = '<b>t = ' + t + '</b>' +
        '<span><i style="border-color:' + C_OPEN + ';border-style:dashed"></i>No regulator ' + fmtHTML(vo) + '</span>' +
        '<span><i style="border-color:' + C_CTRL + '"></i>Regulated ' + fmtHTML(vc) + '</span>' +
        (t < P.N ? '<span class="u">Intervention u ' + fmtHTML(data.ctrl.u[t]) + '</span>' : '');
      tip.hidden = false;
      var left = sx(t) / W * box.width;
      tip.style.left = svg.offsetLeft + Math.min(Math.max(left, 90), box.width - 90) + 'px';
      tip.style.top = svg.offsetTop + 24 + 'px';
    }
    function hide() { hover.setAttribute('visibility', 'hidden'); tip.hidden = true; }
    hit.addEventListener('pointermove', show);
    hit.addEventListener('pointerdown', show);
    hit.addEventListener('pointerleave', hide);
  }

  slider.addEventListener('input', function () { aOut.textContent = parseFloat(slider.value).toFixed(1); render(); });
  chiBtns.forEach(function (b) {
    b.addEventListener('click', function () {
      chi = parseFloat(b.getAttribute('data-sim-chi'));
      chiBtns.forEach(function (o) { o.setAttribute('aria-pressed', o === b); });
      retune.disabled = chi !== 1;
      if (chi !== 1) retune.checked = false;
      render();
    });
  });
  retune.addEventListener('change', render);

  render();
})();
