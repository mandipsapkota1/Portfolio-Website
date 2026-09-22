/* VEIL — bootstrap, input, screens.
 *
 * INPUT, and why it is split in two.
 * A strike commits on pointer-down anywhere in the play field. The secret is a
 * SEPARATE channel: hold the top strip, or hold Space. That split is
 * deliberate — in the shipping Lens the trigger is the player's face, which is
 * independent of their thumb, so the prototype has to be independent too or
 * the timings tuned here will not survive the port.
 */
(function (root) {
  'use strict';

  var V = root.VEIL;
  var CONFIG = V.CONFIG;
  var PHASE = V.PHASE;
  var RESULT = V.RESULT;

  var canvas = document.getElementById('game');
  var ui = document.getElementById('ui');
  var sim = new V.Sim({});
  var rend = new V.Renderer(canvas);
  var audio = new V.Audio();

  var BEST_KEY = 'veil.best';
  var best = +(localStorage.getItem(BEST_KEY) || 0);
  var lastPhase = null;
  var lastLogLen = 0;
  var holds = 0;
  var keyDilate = false;

  function screenTitle() {
    return '' +
      '<div class="card">' +
      '<div class="eyebrow">A GAME OF SIGHT</div>' +
      '<h1>VEIL</h1>' +
      '<p class="lede">The shard is lit for a moment, then the dark takes it.<br>' +
      'The marks are inside the dark. Strike each one blind.</p>' +
      '<ul class="rules">' +
      '<li><b>Tap</b> to strike. A strike always commits.</li>' +
      '<li><b>Broken amber</b> marks are false. Striking one is fatal.</li>' +
      '<li><b>Miss</b> and the run is over. There is no second life.</li>' +
      '<li><b>60 marks</b> will pass you. You need 50.</li>' +
      '</ul>' +
      '<div class="acts">' +
      '<div><b>EASY</b><span>1 MARK</span></div>' +
      '<div><b>MEDIUM</b><span>2 MARKS</span></div>' +
      '<div><b>HARD</b><span>3 MARKS</span></div>' +
      '</div>' +
      (best ? '<div class="best">BEST &nbsp;<b>' + best + '</b> / 50</div>' : '') +
      '<button class="go" id="go">BEGIN</button>' +
      '<div class="whisper">The dark is not empty. It is only unlit.</div>' +
      '</div>';
  }

  function epitaph() {
    var last = sim.log[sim.log.length - 1];
    if (sim.marksLeft <= 0) return 'You ran out of marks. Too many let go.';
    if (last && last.result === RESULT.FALSE_STRUCK) return 'That one was false. Read before you strike.';
    if (sim.score >= 44) return 'The last few are not meant to be read. They are meant to be seen.';
    if (sim.score >= 30) return 'Three marks, no light, and it is still accelerating.';
    if (sim.score >= 20) return 'It changes speed where you cannot see it.';
    if (sim.score >= 10) return 'Two marks now. The second is always the liar.';
    return 'Watch the lit stretch. It is telling you everything.';
  }

  function screenOver() {
    var won = sim.phase === PHASE.WON;
    var fresh = sim.score > best;
    if (fresh) { best = sim.score; localStorage.setItem(BEST_KEY, best); }
    return '' +
      '<div class="card">' +
      (won
        ? '<div class="eyebrow win">FIFTY FOR FIFTY</div><h1 class="win">50 / 50</h1>' +
        '<p class="lede">You saw it all the way through the dark.</p>'
        : '<div class="eyebrow">RUN ENDED</div><h1>' + sim.score + ' <span>/ 50</span></h1>' +
        '<p class="lede">' + epitaph() + '</p>') +
      '<div class="stats">' +
      '<div><b>' + sim.bestStreak + '</b><span>BEST STREAK</span></div>' +
      '<div><b>' + sim.perfects + '</b><span>PERFECT</span></div>' +
      '<div><b>' + sim.marksLeft + '</b><span>MARKS LEFT</span></div>' +
      '</div>' +
      (fresh && !won ? '<div class="best new">NEW BEST</div>'
        : '<div class="best">BEST &nbsp;<b>' + best + '</b> / 50</div>') +
      '<button class="go" id="go">' + (won ? 'AGAIN' : 'RETRY') + '</button>' +
      '<button class="ghost" id="share">SHARE SCORE</button>' +
      '</div>';
  }

  function show(html) {
    ui.innerHTML = html;
    ui.classList.add('on');
    var go = document.getElementById('go');
    if (go) go.onclick = function (e) { e.stopPropagation(); begin(); };
    var sh = document.getElementById('share');
    if (sh) sh.onclick = function (e) { e.stopPropagation(); share(); };
  }

  function hide() { ui.classList.remove('on'); ui.innerHTML = ''; }

  function share() {
    var text = 'VEIL — ' + sim.score + '/50. ' +
      (sim.score >= 50 ? 'Fifty for fifty.' : 'Can you get past ' + sim.score + '?');
    if (navigator.share) navigator.share({ title: 'VEIL', text: text }).catch(function () { });
    else if (navigator.clipboard) navigator.clipboard.writeText(text);
  }

  function begin() {
    hide();
    sim.reset(Math.floor(Math.random() * 0x7fffffff));
    sim.start();
    lastLogLen = 0;
    audio.ensure();
  }

  function inDilateZone(y) { return y < rend.h * 0.15; }

  canvas.addEventListener('pointerdown', function (e) {
    e.preventDefault();
    audio.ensure();
    if (sim.phase === PHASE.READY || sim.phase === PHASE.OVER || sim.phase === PHASE.WON) return;
    if (inDilateZone(e.clientY - canvas.getBoundingClientRect().top)) { holds++; return; }
    sim.strike();
  }, { passive: false });

  function release() { if (holds > 0) holds--; }
  canvas.addEventListener('pointerup', release);
  canvas.addEventListener('pointercancel', release);
  canvas.addEventListener('pointerleave', release);

  window.addEventListener('keydown', function (e) {
    if (e.code === 'Space') { e.preventDefault(); keyDilate = true; }
    else if (e.code === 'Enter') {
      if (sim.phase !== PHASE.FLIGHT) begin(); else sim.strike();
    }
  });
  window.addEventListener('keyup', function (e) { if (e.code === 'Space') keyDilate = false; });
  window.addEventListener('resize', function () { rend.resize(); });

  function drainLog() {
    while (lastLogLen < sim.log.length) {
      var e = sim.log[lastLogLen++];
      var m = (sim.flight && e.mark >= 0) ? sim.flight.marks[e.mark] : null;
      rend.onResult(e.result, rend.markY(sim, m));
      if (e.result === RESULT.PERFECT) audio.perfect(sim.streak);
      else if (e.result === RESULT.HIT) audio.hit(sim.streak);
      else if (e.result === RESULT.MISS || e.result === RESULT.FALSE_STRUCK) audio.miss();
      else audio.pass();
    }
  }

  var prev = performance.now();
  var wasSlow = false;
  var sawEdge = false;

  function frame(now) {
    var dt = now - prev; prev = now;
    if (dt > 120) dt = 120;

    sim.setSlow(holds > 0 || keyDilate);
    sim.update(dt);
    drainLog();

    if (sim.slowActive !== wasSlow) {
      wasSlow = sim.slowActive;
      audio.setDilation(wasSlow);
    }

    if (sim.phase === PHASE.FLIGHT && sim.flight) {
      var past = sim.t >= sim.flight.tVeil;
      if (past && !sawEdge) { sawEdge = true; audio.swallow(); }
      if (!past) sawEdge = false;
    } else sawEdge = false;

    if (sim.phase !== lastPhase) {
      if (sim.phase === PHASE.FLIGHT) audio.launch();
      if (sim.phase === PHASE.READY) show(screenTitle());
      if (sim.phase === PHASE.OVER) {
        audio.setDilation(false);
        setTimeout(function () { show(screenOver()); }, 780);
      }
      if (sim.phase === PHASE.WON) {
        audio.setDilation(false); audio.win();
        setTimeout(function () { show(screenOver()); }, 900);
      }
      lastPhase = sim.phase;
    }

    rend.draw(sim, dt);
    requestAnimationFrame(frame);
  }

  rend.resize();
  show(screenTitle());
  requestAnimationFrame(frame);

  // ---- dev hook ------------------------------------------------------
  // rAF is paused when the browser pane is not composited, so a synchronous
  // stepper is the only way to drive the game from a headless harness.
  if (/[?&]dev=1/.test(location.search)) {
    root.__veil = {
      sim: sim, rend: rend, audio: audio, CONFIG: CONFIG, V: V,
      begin: begin,
      stepOnce: function (dt) { sim.update(dt || 16); drainLog(); return sim.phase; },
      run: function (ms, dt) {
        dt = dt || 8;
        for (var t = 0; t < ms; t += dt) { sim.update(dt); drainLog(); }
        return { phase: sim.phase, score: sim.score, left: sim.marksLeft };
      },
      strike: function () { return sim.strike(); },
      setScore: function (n) { sim.score = n; },
      screen: function (which) { show(which === 'over' ? screenOver() : screenTitle()); },
      shot: function (name, dt) {
        rend.draw(sim, dt || 16);
        return fetch('/__save?name=' + encodeURIComponent(name || 'out.png'), {
          method: 'POST', body: canvas.toDataURL('image/png')
        }).then(function (r) { return r.text(); });
      },
      state: function () {
        var f = sim.flight;
        return {
          phase: sim.phase, score: sim.score, left: sim.marksLeft,
          act: sim.actName(), sub: sim.subName(),
          dilation: Math.round(sim.dilationMs), slow: sim.slowActive,
          t: Math.round(sim.t),
          flight: f ? {
            lit: Math.round(f.litMs), tEnd: Math.round(f.tEnd),
            accel: +f.accelPct.toFixed(2), glyph: f.glyph,
            marks: f.marks.map(function (m) {
              return {
                u: +m.u.toFixed(3), at: Math.round(m.tArrive),
                hit: Math.round(m.hitMs), bias: Math.round(m.tNaive - m.tArrive),
                drift: +m.amp.toFixed(3), isFalse: m.isFalse,
                state: m.resolved || (m.expired ? 'expired' : 'open')
              };
            })
          } : null
        };
      },
      curveAt: function (score) {
        var a = V.actFor(score), p = V.actProgress(score, a), L = V.lerpPair;
        return {
          act: a.name, sub: a.sub,
          flight: Math.round(L(a.flightMs, p)),
          litMs: Math.round(L(a.flightMs, p) * L(a.lit, p)),
          hit: Math.round(L(a.hit, p)), perfect: Math.round(L(a.perfect, p)),
          accel: +L(a.accel, p).toFixed(2), falseP: +L(a.falseP, p).toFixed(2),
          drift: +L(a.drift, p).toFixed(3)
        };
      }
    };
    console.log('[veil] dev hook ready — window.__veil');
  }
})(typeof globalThis !== 'undefined' ? globalThis : this);
