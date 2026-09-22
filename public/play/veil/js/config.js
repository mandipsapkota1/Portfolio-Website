/* VEIL — tuning constants.
 *
 * Times are milliseconds of GAME time unless a name says REAL. Track position
 * is normalised: u=0 launch, u=1 end of track.
 *
 * THE SHAPE OF THE GAME
 * A flight sends one shard down one track. It is lit for the first stretch,
 * then crosses the veil edge and is invisible for the rest of its life. The
 * marks it must strike are all inside that dark, and there can be up to three
 * of them. So a flight is not one guess, it is a short rhythm played blind —
 * and because the shard accelerates once it is out of sight, the gaps between
 * marks are not the gaps you would predict from the lit stretch.
 */
(function (root) {
  'use strict';

  var CONFIG = {
    // ---- run economy -------------------------------------------------
    // Marks PRESENTED, not flights. You can afford to let ten go by.
    MARK_BUDGET: 60,
    TARGET_SCORE: 50,

    // ---- the secret --------------------------------------------------
    // One secret, one resource. Holding the trigger slows game time and makes
    // the shard faintly visible inside the veil. There is no way to earn more:
    // this is the whole allowance for a run, and nothing on screen reports it.
    SLOW_SCALE: 0.25,
    DILATION_GAME_MS: 3600,
    // Dilation's real gift is sight, not the time factor: you track a visible
    // ghost instead of extrapolating, which collapses prediction error.
    SLOW_PERCEPTION_GAIN: 0.15,

    // ---- track geometry ----------------------------------------------
    // How far past the veil edge the first mark sits. This is the quiet
    // difficulty lever: a mark just inside the dark is nearly free, because
    // prediction error grows with how long the shard has been invisible.
    MARK_ZONE_START: 0.15,

    // Floor on |accel| as a fraction of the act's maximum, so no flight ever
    // rolls near-zero acceleration and becomes a free constant-speed read.
    ACCEL_MIN_FRACTION: 0.45,

    // A fast roll can cut the lit flash to almost nothing, which stops being
    // difficulty and starts being a coin toss. The veil edge is pushed back
    // until the shard has been visible at least this long.
    LIT_FLOOR_MS: 105,
    LIT_MAX_U: 0.55,

    // Two marks whose strike windows overlap would make a single tap
    // ambiguous, so arrivals are separated by both windows plus this.
    MARK_GAP_MARGIN_MS: 70,
    MARK_ZONE_END: 0.93,
    TRACK_END_U: 1.0,

    // ---- pacing ------------------------------------------------------
    RESOLVE_DELAY_MS: 460,
    LAUNCH_DELAY_MS: 320,

    /* ---- how many marks per flight ------------------------------------
     * The single biggest difficulty lever, so it steps rather than ramps —
     * a player should be able to feel the moment the game asks for more.
     */
    MARK_STEPS: [
      { upTo: 9, weights: [1, 0, 0] },
      { upTo: 15, weights: [0.5, 0.5, 0] },
      { upTo: 29, weights: [0, 1, 0] },
      { upTo: 37, weights: [0, 0.45, 0.55] },
      { upTo: 49, weights: [0, 0, 1] }
    ],

    /* ---- the three acts -------------------------------------------------
     * Each value interpolates from its first entry at `lo` to its second at
     * `hi`.
     *
     *   flightMs   nominal time to run the whole track
     *   lit        fraction of the track that is VISIBLE
     *   hit        half-width of a mark's scoring window
     *   perfect    half-width of the PERFECT window (style only)
     *   speedVar   per-flight speed randomisation, +/- fraction
     *   accel      speed change across the veil, +/- fraction
     *   glyph      is the accel direction telegraphed while still lit
     *   falseP     probability any given mark is false (must NOT be struck)
     *   drift      how far a mark oscillates along the track, +/- in u
     */
    ACTS: [
      {
        name: 'EASY', sub: 'FIRST LIGHT', lo: 0, hi: 9,
        flightMs: [1250, 1150], lit: [0.62, 0.55],
        hit: [240, 205], perfect: [80, 66],
        speedVar: [0.00, 0.10], accel: [0.00, 0.00],
        glyph: true, falseP: [0.00, 0.00], drift: [0.000, 0.000]
      },
      {
        name: 'MEDIUM', sub: 'DRIFT', lo: 10, hi: 29,
        flightMs: [1150, 1000], lit: [0.50, 0.30],
        hit: [180, 105], perfect: [60, 36],
        speedVar: [0.16, 0.36], accel: [0.06, 0.30],
        glyph: true, falseP: [0.05, 0.14], drift: [0.000, 0.000]
      },
      {
        name: 'HARD', sub: 'THE VEIL', lo: 30, hi: 49,
        flightMs: [980, 850], lit: [0.20, 0.065],
        hit: [95, 26], perfect: [32, 11],
        speedVar: [0.36, 0.48], accel: [0.36, 0.66],
        glyph: false, falseP: [0.14, 0.20], drift: [0.012, 0.036]
      }
    ]
  };

  function actFor(score) {
    var a = CONFIG.ACTS;
    for (var i = 0; i < a.length; i++) if (score <= a[i].hi) return a[i];
    return a[a.length - 1];
  }

  function actProgress(score, act) {
    if (act.hi === act.lo) return 0;
    var p = (score - act.lo) / (act.hi - act.lo);
    return p < 0 ? 0 : p > 1 ? 1 : p;
  }

  function lerpPair(pair, p) { return pair[0] + (pair[1] - pair[0]) * p; }

  function markCount(score, rng) {
    var steps = CONFIG.MARK_STEPS, w = steps[steps.length - 1].weights;
    for (var i = 0; i < steps.length; i++) {
      if (score <= steps[i].upTo) { w = steps[i].weights; break; }
    }
    var r = rng(), acc = 0;
    for (var k = 0; k < w.length; k++) {
      acc += w[k];
      if (r < acc) return k + 1;
    }
    return w.length;
  }

  root.VEIL = root.VEIL || {};
  root.VEIL.CONFIG = CONFIG;
  root.VEIL.actFor = actFor;
  root.VEIL.actProgress = actProgress;
  root.VEIL.lerpPair = lerpPair;
  root.VEIL.markCount = markCount;
})(typeof globalThis !== 'undefined' ? globalThis : this);
