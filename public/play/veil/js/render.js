/* VEIL — canvas renderer.
 *
 * Everything is drawn procedurally: no image assets, so the payload is tiny
 * and the same drawing code ports shape-for-shape into Lens Studio.
 *
 * The rule the art must obey: the veil is genuinely opaque. If a player can
 * make out the shard inside it the game has no teeth, so below the veil edge
 * the only things ever drawn are the marks and — when the secret is running —
 * a deliberately faint ghost.
 */
(function (root) {
  'use strict';

  var V = root.VEIL;
  var CONFIG = V.CONFIG;
  var PHASE = V.PHASE;
  var RESULT = V.RESULT;

  var C = {
    bg0: '#06070A',
    bg1: '#0A0C12',
    trackLit: 'rgba(120,225,255,0.16)',
    shard: '#EAF6FF',
    shardGlow: '#4DE1FF',
    mark: '#FF3F6C',
    falseMark: '#FFB347',
    perfect: '#7CFFB2',
    text: '#F2F5FA',
    dim: 'rgba(242,245,250,0.42)',
    faint: 'rgba(242,245,250,0.16)'
  };

  function Renderer(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.dpr = 1;
    this.fx = [];
    this.shake = 0;
    this.flash = 0;
    this.flashColor = C.mark;
    this.grain = makeGrain(160);
    this.time = 0;
    this.resize();
  }

  function makeGrain(size) {
    var c = document.createElement('canvas');
    c.width = c.height = size;
    var g = c.getContext('2d');
    var img = g.createImageData(size, size);
    for (var i = 0; i < img.data.length; i += 4) {
      var n = (Math.random() * 255) | 0;
      img.data[i] = img.data[i + 1] = img.data[i + 2] = n;
      img.data[i + 3] = 16;
    }
    g.putImageData(img, 0, 0);
    return c;
  }

  Renderer.prototype.resize = function () {
    var dpr = Math.min(window.devicePixelRatio || 1, 2.5);
    var w = this.canvas.clientWidth, h = this.canvas.clientHeight;
    this.dpr = dpr;
    this.canvas.width = Math.round(w * dpr);
    this.canvas.height = Math.round(h * dpr);
    this.w = w; this.h = h;
  };

  Renderer.prototype.layout = function () {
    var w = this.w, h = this.h;
    var top = h * 0.185, bot = h * 0.90;
    return {
      cx: w / 2, trackTop: top, trackBot: bot, trackLen: bot - top,
      half: Math.min(w * 0.30, 132),
      shardR: Math.max(7, Math.min(w * 0.021, 13))
    };
  };

  Renderer.prototype.y = function (L, u) { return L.trackTop + u * L.trackLen; };

  Renderer.prototype.addFx = function (f) { this.fx.push(f); };

  Renderer.prototype.onResult = function (result, y) {
    var x = this.w / 2;
    if (result === RESULT.PERFECT) {
      this.addFx({ t: 0, life: 620, kind: 'burst', x: x, y: y, color: C.perfect, r: 200 });
      this.addFx({ t: 0, life: 900, kind: 'ring', x: x, y: y, color: C.perfect, r: 320 });
      this.flash = 0.28; this.flashColor = C.perfect; this.shake = 5;
    } else if (result === RESULT.HIT) {
      this.addFx({ t: 0, life: 520, kind: 'burst', x: x, y: y, color: C.shardGlow, r: 150 });
      this.flash = 0.14; this.flashColor = C.shardGlow; this.shake = 3;
    } else if (result === RESULT.AVOIDED) {
      this.addFx({ t: 0, life: 640, kind: 'ring', x: x, y: y, color: C.falseMark, r: 150 });
    } else if (result === RESULT.LOST) {
      this.addFx({ t: 0, life: 480, kind: 'ring', x: x, y: y, color: 'rgba(150,168,196,0.45)', r: 100 });
    } else {
      this.addFx({ t: 0, life: 800, kind: 'shatter', x: x, y: y, color: C.mark, r: 250 });
      this.flash = 0.5; this.flashColor = C.mark; this.shake = 16;
    }
  };

  Renderer.prototype.draw = function (sim, dtReal) {
    var ctx = this.ctx, L = this.layout();
    this.time += dtReal;
    var slow = sim.slowActive;

    ctx.save();
    ctx.scale(this.dpr, this.dpr);

    if (this.shake > 0.2) {
      this.shake *= Math.pow(0.9, dtReal / 16);
      ctx.translate((Math.random() * 2 - 1) * this.shake, (Math.random() * 2 - 1) * this.shake);
    } else this.shake = 0;

    this.drawBackground(ctx, L, slow);
    this.drawVeil(ctx, L, sim, slow);
    this.drawTrack(ctx, L, sim);
    this.drawMarks(ctx, L, sim, slow);
    this.drawShard(ctx, L, sim);
    this.drawFx(ctx, dtReal);
    this.drawHud(ctx, L, sim);
    this.drawBanner(ctx, L, sim);

    if (this.flash > 0.004) {
      ctx.globalAlpha = this.flash;
      ctx.fillStyle = this.flashColor;
      ctx.fillRect(-30, -30, this.w + 60, this.h + 60);
      ctx.globalAlpha = 1;
      this.flash *= Math.pow(0.86, dtReal / 16);
    }
    ctx.restore();
  };

  Renderer.prototype.drawBackground = function (ctx, L, slow) {
    var g = ctx.createLinearGradient(0, 0, 0, this.h);
    g.addColorStop(0, slow ? '#07101A' : C.bg1);
    g.addColorStop(0.55, C.bg0);
    g.addColorStop(1, slow ? '#050A12' : '#04050A');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, this.w, this.h);

    var off = (this.time * 0.02) % 160;
    ctx.globalAlpha = slow ? 0.5 : 0.34;
    for (var y = -160 + off; y < this.h; y += 160) {
      for (var x = -160 + off; x < this.w; x += 160) ctx.drawImage(this.grain, x, y);
    }
    ctx.globalAlpha = 1;

    var vr = slow ? 0.52 : 0.78;
    var rg = ctx.createRadialGradient(this.w / 2, this.h * 0.48, this.h * 0.12,
      this.w / 2, this.h * 0.48, this.h * vr);
    rg.addColorStop(0, 'rgba(0,0,0,0)');
    rg.addColorStop(1, slow ? 'rgba(0,6,14,0.92)' : 'rgba(0,0,0,0.75)');
    ctx.fillStyle = rg;
    ctx.fillRect(0, 0, this.w, this.h);
  };

  Renderer.prototype.veilY = function (L, sim) {
    return this.y(L, sim.flight ? sim.flight.uVeil : 0.5);
  };

  Renderer.prototype.drawVeil = function (ctx, L, sim, slow) {
    var vy = this.veilY(L, sim);
    var g = ctx.createLinearGradient(0, vy - 26, 0, vy + 90);
    g.addColorStop(0, 'rgba(2,3,6,0)');
    g.addColorStop(0.32, 'rgba(2,3,6,0.85)');
    g.addColorStop(1, 'rgba(1,2,4,0.985)');
    ctx.fillStyle = g;
    ctx.fillRect(0, vy - 26, this.w, this.h - vy + 26);
    ctx.fillStyle = 'rgba(1,2,4,0.985)';
    ctx.fillRect(0, vy + 90, this.w, this.h - vy);

    ctx.save();
    ctx.strokeStyle = slow ? 'rgba(120,225,255,0.55)' : 'rgba(150,180,215,0.30)';
    ctx.lineWidth = 1;
    ctx.shadowBlur = slow ? 22 : 10;
    ctx.shadowColor = slow ? C.shardGlow : 'rgba(150,180,215,0.7)';
    ctx.beginPath(); ctx.moveTo(0, vy); ctx.lineTo(this.w, vy); ctx.stroke();
    ctx.restore();

    if (slow) {
      var sy = vy + ((this.time * 0.09) % (this.h - vy));
      var sg = ctx.createLinearGradient(0, sy - 40, 0, sy + 40);
      sg.addColorStop(0, 'rgba(77,225,255,0)');
      sg.addColorStop(0.5, 'rgba(77,225,255,0.055)');
      sg.addColorStop(1, 'rgba(77,225,255,0)');
      ctx.fillStyle = sg;
      ctx.fillRect(0, sy - 40, this.w, 80);
    }
  };

  Renderer.prototype.drawTrack = function (ctx, L, sim) {
    var x = L.cx, vy = this.veilY(L, sim);
    ctx.strokeStyle = C.trackLit; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(x, L.trackTop); ctx.lineTo(x, vy); ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,0.035)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(x, vy); ctx.lineTo(x, L.trackBot); ctx.stroke();
    ctx.fillStyle = 'rgba(120,225,255,0.30)';
    ctx.fillRect(x - 11, L.trackTop - 1, 22, 2);
  };

  /* The marks are the only thing you can see in the dark. In HARD they drift
   * along the track, so the strike is a coincidence between a shard you cannot
   * see and a target that will not hold still. */
  Renderer.prototype.drawMarks = function (ctx, L, sim, slow) {
    var views = sim.markViews();
    var pulse = 0.55 + 0.45 * Math.sin(this.time * 0.004);

    for (var i = 0; i < views.length; i++) {
      var v = views[i], m = v.mark;
      var y = this.y(L, v.u);
      var isFalse = m.isFalse;
      var col = isFalse ? C.falseMark : C.mark;

      var alpha = v.open ? (isFalse ? 0.80 : 0.74) : 0.13;
      if (v.open && v.imminent) alpha = 1;
      if (slow && v.open) alpha = Math.min(1, alpha + 0.18);

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.shadowBlur = v.open ? (slow ? 24 : 15) : 0;
      ctx.shadowColor = col;
      ctx.strokeStyle = col;
      ctx.lineWidth = 2;

      if (isFalse) {
        // hollow, broken line — reads as "not a real target" at a glance
        ctx.setLineDash([9, 7]);
        ctx.beginPath();
        ctx.moveTo(L.cx - L.half, y); ctx.lineTo(L.cx + L.half, y);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.beginPath();
        ctx.moveTo(L.cx - 8, y - 8); ctx.lineTo(L.cx + 8, y + 8);
        ctx.moveTo(L.cx + 8, y - 8); ctx.lineTo(L.cx - 8, y + 8);
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.moveTo(L.cx - L.half, y); ctx.lineTo(L.cx + L.half, y);
        ctx.stroke();
        ctx.globalAlpha = alpha * (0.45 + 0.4 * pulse);
        ctx.shadowBlur = 0;
        ctx.fillStyle = col;
        ctx.fillRect(L.cx - L.half - 9, y - 5, 4, 10);
        ctx.fillRect(L.cx + L.half + 5, y - 5, 4, 10);
      }
      ctx.restore();
    }
  };

  Renderer.prototype.drawShard = function (ctx, L, sim) {
    var v = sim.shardView();
    if (!v) return;
    var f = sim.flight;
    var x = L.cx, y = this.y(L, v.u);

    if (v.lit) {
      // trail
      ctx.save();
      for (var k = 1; k <= 9; k++) {
        var tk = sim.t - k * 26;
        if (tk <= 0) break;
        var uk = V.shardU(f, tk);
        if (uk >= f.uVeil) continue;
        ctx.globalAlpha = 0.30 * (1 - k / 9);
        ctx.fillStyle = C.shardGlow;
        ctx.beginPath();
        ctx.arc(x, this.y(L, uk), L.shardR * (1 - k / 9) * 0.85, 0, 6.2832);
        ctx.fill();
      }
      ctx.restore();

      ctx.save();
      ctx.shadowBlur = 28; ctx.shadowColor = C.shardGlow;
      ctx.fillStyle = C.shard;
      ctx.beginPath(); ctx.arc(x, y, L.shardR, 0, 6.2832); ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = 'rgba(255,255,255,0.92)';
      ctx.beginPath(); ctx.arc(x, y, L.shardR * 0.42, 0, 6.2832); ctx.fill();
      ctx.restore();

      this.drawGlyph(ctx, f, x, y, L.shardR);
    } else if (v.ghost) {
      ctx.save();
      ctx.globalAlpha = 0.5;
      ctx.shadowBlur = 18; ctx.shadowColor = C.shardGlow;
      ctx.strokeStyle = C.shard; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(x, y, L.shardR * 0.9, 0, 6.2832); ctx.stroke();
      ctx.globalAlpha = 0.16;
      ctx.fillStyle = C.shardGlow;
      ctx.beginPath(); ctx.arc(x, y, L.shardR * 1.8, 0, 6.2832); ctx.fill();
      ctx.restore();
    }
  };

  /* The only honest warning the game gives: whether the shard will speed up or
   * slow down once it is out of sight. HARD stops drawing it. */
  Renderer.prototype.drawGlyph = function (ctx, f, x, y, r) {
    if (!f.glyph || Math.abs(f.accelPct) < 0.04) return;
    ctx.save();
    ctx.translate(x, y - r - 16);
    ctx.fillStyle = 'rgba(234,246,255,0.82)';
    ctx.beginPath();
    if (f.accelPct > 0) { ctx.moveTo(0, -6); ctx.lineTo(6, 4); ctx.lineTo(-6, 4); }
    else { ctx.moveTo(0, 6); ctx.lineTo(6, -4); ctx.lineTo(-6, -4); }
    ctx.closePath(); ctx.fill();
    ctx.restore();
  };

  Renderer.prototype.drawFx = function (ctx, dt) {
    for (var i = this.fx.length - 1; i >= 0; i--) {
      var f = this.fx[i];
      f.t += dt;
      var p = f.t / f.life;
      if (p >= 1) { this.fx.splice(i, 1); continue; }
      var e = 1 - Math.pow(1 - p, 3);
      ctx.save();
      ctx.globalAlpha = (1 - p) * 0.9;
      if (f.kind === 'burst' || f.kind === 'ring') {
        ctx.strokeStyle = f.color;
        ctx.lineWidth = f.kind === 'burst' ? 3 * (1 - p) + 0.5 : 1.5;
        ctx.beginPath(); ctx.arc(f.x, f.y, f.r * e, 0, 6.2832); ctx.stroke();
      } else if (f.kind === 'shatter') {
        ctx.strokeStyle = f.color;
        ctx.lineWidth = 2 * (1 - p) + 0.5;
        for (var k = 0; k < 10; k++) {
          var a = (k / 10) * 6.2832 + f.t * 0.001;
          ctx.beginPath();
          ctx.moveTo(f.x + Math.cos(a) * f.r * e * 0.35, f.y + Math.sin(a) * f.r * e * 0.35);
          ctx.lineTo(f.x + Math.cos(a) * f.r * e, f.y + Math.sin(a) * f.r * e);
          ctx.stroke();
        }
      }
      ctx.restore();
    }
  };

  Renderer.prototype.drawHud = function (ctx, L, sim) {
    var w = this.w, top = this.h * 0.072;
    ctx.save();

    var x0 = w * 0.075;
    ctx.fillStyle = C.text;
    ctx.font = '700 ' + Math.round(Math.min(w * 0.115, 56)) + 'px ui-sans-serif,system-ui,-apple-system,Segoe UI,sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(String(sim.score), x0, top);
    var sw = ctx.measureText(String(sim.score)).width;

    ctx.fillStyle = C.faint;
    ctx.font = '600 ' + Math.round(Math.min(w * 0.042, 19)) + 'px ui-sans-serif,system-ui,sans-serif';
    ctx.fillText('/ ' + CONFIG.TARGET_SCORE, x0 + sw + 8, top);

    ctx.textAlign = 'right';
    ctx.fillStyle = sim.marksLeft <= 6 ? C.mark : C.dim;
    ctx.font = '600 ' + Math.round(Math.min(w * 0.043, 19)) + 'px ui-sans-serif,system-ui,sans-serif';
    ctx.fillText(sim.marksLeft + ' LEFT', w * 0.925, top);

    // act, then the act's flavour name beneath it
    ctx.textAlign = 'left';
    ctx.fillStyle = 'rgba(242,245,250,0.30)';
    ctx.font = '700 ' + Math.round(Math.min(w * 0.032, 13)) + 'px ui-sans-serif,system-ui,sans-serif';
    ctx.letterSpacing = '2.5px';
    ctx.fillText(sim.actName() + '  ·  ' + sim.subName(), x0, top + 24);
    ctx.letterSpacing = '0px';

    if (sim.streak > 1) {
      ctx.textAlign = 'right';
      ctx.fillStyle = 'rgba(124,255,178,0.75)';
      ctx.font = '700 ' + Math.round(Math.min(w * 0.033, 14)) + 'px ui-sans-serif,system-ui,sans-serif';
      ctx.fillText('×' + sim.streak, w * 0.925, top + 24);
    }

    // how many marks this flight holds — the one thing you may read freely
    if (sim.flight && sim.phase === PHASE.FLIGHT) {
      var n = sim.flight.marks.length;
      var cx = w / 2, gap = 13;
      for (var i = 0; i < n; i++) {
        var m = sim.flight.marks[i];
        var px = cx + (i - (n - 1) / 2) * gap;
        ctx.beginPath();
        ctx.arc(px, top - 8, 3.2, 0, 6.2832);
        ctx.fillStyle = m.resolved || m.expired
          ? 'rgba(242,245,250,0.16)'
          : (m.isFalse ? C.falseMark : C.mark);
        ctx.fill();
      }
    }
    ctx.restore();
  };

  var BANNER = {};
  BANNER[RESULT.PERFECT] = ['PERFECT', C.perfect];
  BANNER[RESULT.HIT] = ['STRUCK', '#9FE8FF'];
  BANNER[RESULT.MISS] = ['MISSED', C.mark];
  BANNER[RESULT.FALSE_STRUCK] = ['THAT WAS FALSE', C.falseMark];
  BANNER[RESULT.AVOIDED] = ['LET IT GO', C.falseMark];
  BANNER[RESULT.LOST] = ['LOST', 'rgba(160,180,205,0.7)'];

  Renderer.prototype.drawBanner = function (ctx, L, sim) {
    if (!sim.lastResult) return;
    if (sim.phase !== PHASE.RESOLVE && sim.phase !== PHASE.FLIGHT) return;
    var b = BANNER[sim.lastResult];
    if (!b) return;
    var age = sim.phase === PHASE.RESOLVE ? (CONFIG.RESOLVE_DELAY_MS - sim.timer) : 9999;
    if (age > 640) return;
    ctx.save();
    ctx.globalAlpha = 1 - age / 640;
    ctx.textAlign = 'center';
    ctx.fillStyle = b[1];
    ctx.font = '700 ' + Math.round(Math.min(this.w * 0.05, 23)) + 'px ui-sans-serif,system-ui,sans-serif';
    ctx.letterSpacing = '3px';
    ctx.fillText(b[0], this.w / 2, this.h * 0.955);
    ctx.letterSpacing = '0px';
    ctx.restore();
  };

  // screen y of a mark, for placing hit effects
  Renderer.prototype.markY = function (sim, m) {
    var L = this.layout();
    return this.y(L, m ? V.markU(m, sim.t) : 0.7);
  };

  root.VEIL.Renderer = Renderer;
  root.VEIL.COLORS = C;
})(typeof globalThis !== 'undefined' ? globalThis : this);
