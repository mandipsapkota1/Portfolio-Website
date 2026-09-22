/* VEIL — game core.
 *
 * No DOM, no canvas, no timers. You drive it with update(dtRealMs). That is
 * deliberate: tools/balance.js runs this exact code headless in Node to
 * measure the difficulty curve, so the numbers we tune are the numbers that
 * ship.
 *
 * A flight is one shard and up to three marks hidden inside the veil. The
 * shard is lit only for the first stretch; everything after that is played
 * from memory. Striking is committal — there is no such thing as a strike
 * that was "too early to count".
 */
(function (root) {
  'use strict';

  var V = root.VEIL;
  var CONFIG = V.CONFIG;

  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  var PHASE = {
    READY: 'ready', LAUNCH: 'launch', FLIGHT: 'flight',
    RESOLVE: 'resolve', OVER: 'over', WON: 'won'
  };

  var RESULT = {
    PERFECT: 'perfect',
    HIT: 'hit',
    MISS: 'miss',           // struck outside every window — fatal
    LOST: 'lost',           // a real mark went by unstruck — safe, but wasted
    FALSE_STRUCK: 'false_struck', // struck a false mark — fatal
    AVOIDED: 'avoided'      // correctly ignored a false mark
  };

  // ---- flight geometry -------------------------------------------------
  function shardU(f, t) {
    if (t <= 0) return 0;
    if (t <= f.tVeil) return f.v * t;
    var tau = t - f.tVeil;
    return f.uVeil + f.v * tau + 0.5 * f.a * tau * tau;
  }

  function markU(m, t) {
    return m.amp === 0 ? m.u : m.u + m.amp * Math.sin(t / m.period * 6.2831853 + m.phase);
  }

  // time to travel `dist` past the veil edge, under constant acceleration
  function solveArrival(v, a, tVeil, dist) {
    if (Math.abs(a) < 1e-12) return tVeil + dist / v;
    var disc = v * v + 2 * a * dist;
    if (disc <= 0) return Infinity;
    return tVeil + (-v + Math.sqrt(disc)) / a;
  }

  /* A drifting mark has no closed form — the shard is a quadratic in t and
   * the mark is a sinusoid — so scan for the first crossing and bisect it.
   * Only HARD drifts, so the cheap path covers most flights. */
  function solveMark(f, m) {
    if (m.amp === 0) return solveArrival(f.v, f.a, f.tVeil, m.u - f.uVeil);
    var lo = f.tVeil, hi = f.tEnd, step = 4;
    var prev = shardU(f, lo) - markU(m, lo);
    for (var t = lo + step; t <= hi; t += step) {
      var cur = shardU(f, t) - markU(m, t);
      if (prev <= 0 && cur >= 0) {
        var a = t - step, b = t;
        for (var i = 0; i < 22; i++) {
          var mid = (a + b) * 0.5;
          if (shardU(f, mid) - markU(m, mid) < 0) a = mid; else b = mid;
        }
        return (a + b) * 0.5;
      }
      prev = cur;
    }
    return Infinity;
  }

  function makeFlight(score, rng) {
    var act = V.actFor(score);
    var p = V.actProgress(score, act);
    var L = V.lerpPair;

    var flightMs = L(act.flightMs, p);
    var litFrac = L(act.lit, p);
    var hitMs = L(act.hit, p);
    var perfectMs = L(act.perfect, p);
    var speedVar = L(act.speedVar, p);
    var accelMax = L(act.accel, p);
    var falseP = L(act.falseP, p);
    var driftMax = L(act.drift, p);

    var f = {};
    f.v = (1 / flightMs) * (1 + (rng() * 2 - 1) * speedVar);
    // Hold the veil edge back far enough that the shard is always visible for
    // a readable moment. Without this a fast roll leaves ~80ms of light, which
    // carries no velocity information and turns the flight into a coin toss.
    f.uVeil = Math.min(CONFIG.LIT_MAX_U,
      Math.max(litFrac, f.v * CONFIG.LIT_FLOOR_MS));
    f.tVeil = f.uVeil / f.v;
    f.litMs = f.tVeil;
    f.glyph = act.glyph;
    f.actName = act.name;
    f.subName = act.sub;

    /* Acceleration is defined across the whole dark stretch. Its MAGNITUDE has
     * a floor: drawn straight from [-max,max] a flight can roll near-zero and
     * become a free constant-speed gift, which is exactly the fluke that let
     * an expert finish HARD without the secret. Sign stays random. */
    if (accelMax === 0) {
      f.accelPct = 0;
    } else {
      var mag = accelMax * (CONFIG.ACCEL_MIN_FRACTION +
        rng() * (1 - CONFIG.ACCEL_MIN_FRACTION));
      f.accelPct = Math.max(-0.55, rng() < 0.5 ? -mag : mag);
    }
    var span = CONFIG.TRACK_END_U - f.uVeil;
    var vf = f.v * (1 + f.accelPct);
    f.a = (vf * vf - f.v * f.v) / (2 * span);
    f.tEnd = solveArrival(f.v, f.a, f.tVeil, span);

    // ---- lay out the marks ----
    var k = V.markCount(score, rng);
    var zLo = f.uVeil + CONFIG.MARK_ZONE_START;
    var zHi = CONFIG.MARK_ZONE_END;
    if (zHi - zLo < 0.10) zLo = zHi - 0.10;
    var slot = (zHi - zLo) / k;

    f.marks = [];
    for (var i = 0; i < k; i++) {
      var u = zLo + slot * (i + 0.5) + (rng() * 2 - 1) * slot * 0.22;
      var m = {
        index: i,
        u: u,
        amp: driftMax === 0 ? 0 : driftMax * (0.45 + rng() * 0.55),
        period: 900 + rng() * 700,
        phase: rng() * 6.2831853,
        isFalse: rng() < falseP,
        hitMs: hitMs,
        perfectMs: perfectMs,
        resolved: null,
        expired: false
      };
      m.tArrive = solveMark(f, m);
      // what a player gets by assuming the speed never changed
      m.tNaive = f.tVeil + (m.u - f.uVeil) / f.v;
      if (isFinite(m.tArrive)) f.marks.push(m);
    }

    /* Separate the arrivals. Two marks whose strike windows overlap would make
     * a single tap ambiguous — the player could not know which one they were
     * committing to — so push the later mark further down the track until it
     * clears, and drop it if it runs out of track. */
    f.marks.sort(function (x, y) { return x.tArrive - y.tArrive; });
    for (var j = 1; j < f.marks.length; j++) {
      var prev = f.marks[j - 1], cur = f.marks[j];
      var need = prev.hitMs + cur.hitMs + CONFIG.MARK_GAP_MARGIN_MS;
      var guard = 0;
      while (cur.tArrive - prev.tArrive < need && guard++ < 30) {
        cur.u += 0.02;
        if (cur.u > CONFIG.MARK_ZONE_END) break;
        cur.tArrive = solveMark(f, cur);
        cur.tNaive = f.tVeil + (cur.u - f.uVeil) / f.v;
      }
    }
    f.marks = f.marks.filter(function (m, idx, arr) {
      if (m.u > CONFIG.MARK_ZONE_END || !isFinite(m.tArrive)) return false;
      if (idx === 0) return true;
      var p = arr[idx - 1];
      return m.tArrive - p.tArrive >= p.hitMs + m.hitMs;
    });

    // a flight of nothing but false marks would be unplayable dead time
    if (f.marks.length && f.marks.every(function (m) { return m.isFalse; })) {
      f.marks[(rng() * f.marks.length) | 0].isFalse = false;
    }
    for (var q = 0; q < f.marks.length; q++) f.marks[q].index = q;
    f.realCount = f.marks.filter(function (m) { return !m.isFalse; }).length;
    return f;
  }

  // ---- sim -------------------------------------------------------------
  function Sim(opts) {
    opts = opts || {};
    this.seed = opts.seed === undefined ? (Date.now() & 0x7fffffff) : opts.seed;
    this.reset(this.seed);
  }

  Sim.prototype.reset = function (seed) {
    if (seed !== undefined) this.seed = seed;
    this.rng = mulberry32(this.seed);

    this.phase = PHASE.READY;
    this.score = 0;
    this.marksLeft = CONFIG.MARK_BUDGET;
    this.dilationMs = CONFIG.DILATION_GAME_MS;
    this.slowHeld = false;
    this.slowActive = false;

    this.flight = null;
    this.flightIndex = 0;
    this.t = 0;
    this.timer = 0;
    this.lastResult = null;
    this.lastError = 0;
    this.streak = 0;
    this.bestStreak = 0;
    this.perfects = 0;
    this.slowUsedMs = 0;
    this.log = [];
  };

  Sim.prototype.start = function () {
    if (this.phase !== PHASE.READY) return;
    this.phase = PHASE.LAUNCH;
    this.timer = CONFIG.LAUNCH_DELAY_MS;
  };

  Sim.prototype.setSlow = function (on) { this.slowHeld = !!on; };
  Sim.prototype.timeScale = function () { return this.slowActive ? CONFIG.SLOW_SCALE : 1; };

  Sim.prototype.actName = function () {
    return V.actFor(Math.min(this.score, CONFIG.TARGET_SCORE - 1)).name;
  };
  Sim.prototype.subName = function () {
    return V.actFor(Math.min(this.score, CONFIG.TARGET_SCORE - 1)).sub;
  };

  // marks still open to a strike, in arrival order
  Sim.prototype.pending = function () {
    var out = [];
    if (!this.flight) return out;
    for (var i = 0; i < this.flight.marks.length; i++) {
      var m = this.flight.marks[i];
      if (!m.resolved && !m.expired) out.push(m);
    }
    return out;
  };

  Sim.prototype._spawn = function () {
    this.flight = makeFlight(this.score, this.rng);
    this.t = 0;
    this.flightIndex++;
    this.phase = PHASE.FLIGHT;
  };

  Sim.prototype._resolve = function (m, result, err) {
    m.resolved = result;
    this.lastResult = result;
    this.lastError = err || 0;
    if (!m.isFalse) this.marksLeft--;

    if (result === RESULT.PERFECT || result === RESULT.HIT) {
      this.score++;
      this.streak++;
      if (result === RESULT.PERFECT) this.perfects++;
    } else if (result === RESULT.AVOIDED) {
      // correct, but it was never worth a point
    } else {
      this.streak = 0;
    }
    if (this.streak > this.bestStreak) this.bestStreak = this.streak;

    this.log.push({
      flight: this.flightIndex, score: this.score, result: result,
      err: err || 0, hitMs: m.hitMs, isFalse: m.isFalse, mark: m.index,
      lit: this.flight.litMs, accel: this.flight.accelPct, slow: this.slowActive
    });

    if (result === RESULT.MISS || result === RESULT.FALSE_STRUCK) {
      this.phase = PHASE.OVER;
      return;
    }
    if (this.score >= CONFIG.TARGET_SCORE) { this.phase = PHASE.WON; return; }
    if (this.marksLeft <= 0) { this.phase = PHASE.OVER; return; }
  };

  Sim.prototype.strike = function () {
    if (this.phase === PHASE.READY) { this.start(); return null; }
    if (this.phase !== PHASE.FLIGHT) return null;

    var open = this.pending();
    // A strike with nothing open is still a strike. Committal means committal.
    if (!open.length) {
      this.phase = PHASE.OVER;
      this.lastResult = RESULT.MISS;
      this.log.push({
        flight: this.flightIndex, score: this.score, result: RESULT.MISS,
        err: 0, hitMs: 0, isFalse: false, mark: -1,
        lit: this.flight ? this.flight.litMs : 0, accel: 0, slow: this.slowActive
      });
      return RESULT.MISS;
    }

    // commit against whichever open mark the strike lands nearest in time
    var best = open[0], bestD = Math.abs(this.t - best.tArrive);
    for (var i = 1; i < open.length; i++) {
      var d = Math.abs(this.t - open[i].tArrive);
      if (d < bestD) { best = open[i]; bestD = d; }
    }

    var err = this.t - best.tArrive;
    if (best.isFalse) { this._resolve(best, RESULT.FALSE_STRUCK, err); return RESULT.FALSE_STRUCK; }

    var ae = Math.abs(err);
    var r = ae <= best.perfectMs ? RESULT.PERFECT
      : ae <= best.hitMs ? RESULT.HIT
        : RESULT.MISS;
    this._resolve(best, r, err);
    return r;
  };

  Sim.prototype.update = function (dtRealMs) {
    if (dtRealMs > 100) dtRealMs = 100;
    if (this.phase === PHASE.OVER || this.phase === PHASE.WON ||
      this.phase === PHASE.READY) return;

    if (this.phase === PHASE.LAUNCH || this.phase === PHASE.RESOLVE) {
      this.slowActive = false;
      this.timer -= dtRealMs;
      if (this.timer <= 0) this._spawn();
      return;
    }

    // the secret draws down a fixed allowance of GAME time
    this.slowActive = this.slowHeld && this.dilationMs > 0;
    var dtGame = dtRealMs * this.timeScale();
    if (this.slowActive) {
      if (dtGame > this.dilationMs) dtGame = this.dilationMs;
      this.dilationMs -= dtGame;
      this.slowUsedMs += dtGame;
    }
    this.t += dtGame;

    // marks close once the strike window has fully passed
    var f = this.flight;
    for (var i = 0; i < f.marks.length; i++) {
      var m = f.marks[i];
      if (m.resolved || m.expired) continue;
      if (this.t > m.tArrive + m.hitMs) {
        m.expired = true;
        this._resolve(m, m.isFalse ? RESULT.AVOIDED : RESULT.LOST, 0);
        if (this.phase !== PHASE.FLIGHT) return;
      }
    }

    // flight is done once the shard is gone and nothing is still open
    if (this.t >= f.tEnd && !this.pending().length) {
      this.phase = PHASE.RESOLVE;
      this.timer = CONFIG.RESOLVE_DELAY_MS;
    }
  };

  // ---- views for rendering --------------------------------------------
  Sim.prototype.shardView = function () {
    var f = this.flight;
    if (!f || this.phase !== PHASE.FLIGHT) return null;
    var u = shardU(f, this.t);
    if (u > 1.04) return null;
    return {
      u: u,
      lit: u < f.uVeil,
      ghost: u >= f.uVeil && this.slowActive
    };
  };

  Sim.prototype.markViews = function () {
    var out = [];
    var f = this.flight;
    if (!f) return out;
    for (var i = 0; i < f.marks.length; i++) {
      var m = f.marks[i];
      out.push({
        mark: m,
        u: markU(m, this.t),
        open: !m.resolved && !m.expired,
        imminent: !m.resolved && !m.expired && Math.abs(this.t - m.tArrive) < m.hitMs
      });
    }
    return out;
  };

  root.VEIL.Sim = Sim;
  root.VEIL.PHASE = PHASE;
  root.VEIL.RESULT = RESULT;
  root.VEIL.makeFlight = makeFlight;
  root.VEIL.shardU = shardU;
  root.VEIL.markU = markU;
  root.VEIL.mulberry32 = mulberry32;
})(typeof globalThis !== 'undefined' ? globalThis : this);
