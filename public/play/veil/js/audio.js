/* VEIL — WebAudio synthesis. No audio files, so nothing to load and nothing
 * to budget for when this ports to a Lens. */
(function (root) {
  'use strict';

  function Audio() {
    this.ctx = null;
    this.muted = false;
    this.drone = null;
  }

  Audio.prototype.ensure = function () {
    if (!this.ctx) {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      this.ctx = new AC();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.22;
      this.master.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') this.ctx.resume();
    return this.ctx;
  };

  Audio.prototype.blip = function (freq, dur, type, gain, sweepTo) {
    if (this.muted) return;
    var c = this.ensure(); if (!c) return;
    var o = c.createOscillator(), g = c.createGain();
    o.type = type || 'sine';
    o.frequency.setValueAtTime(freq, c.currentTime);
    if (sweepTo) o.frequency.exponentialRampToValueAtTime(sweepTo, c.currentTime + dur);
    g.gain.setValueAtTime(0.0001, c.currentTime);
    g.gain.exponentialRampToValueAtTime(gain || 0.5, c.currentTime + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + dur);
    o.connect(g); g.connect(this.master);
    o.start(); o.stop(c.currentTime + dur + 0.02);
  };

  Audio.prototype.noise = function (dur, gain, freq) {
    if (this.muted) return;
    var c = this.ensure(); if (!c) return;
    var n = Math.floor(c.sampleRate * dur);
    var buf = c.createBuffer(1, n, c.sampleRate);
    var d = buf.getChannelData(0);
    for (var i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
    var src = c.createBufferSource(); src.buffer = buf;
    var f = c.createBiquadFilter(); f.type = 'bandpass';
    f.frequency.value = freq || 900; f.Q.value = 1.1;
    var g = c.createGain(); g.gain.value = gain || 0.4;
    src.connect(f); f.connect(g); g.connect(this.master);
    src.start();
  };

  Audio.prototype.launch = function () { this.blip(230, 0.16, 'triangle', 0.20, 520); };
  Audio.prototype.swallow = function () { this.noise(0.22, 0.16, 380); };
  Audio.prototype.hit = function (streak) {
    var f = 440 * Math.pow(1.0595, Math.min(streak, 14) * 2);
    this.blip(f, 0.22, 'sine', 0.42);
    this.blip(f * 2, 0.12, 'sine', 0.12);
  };
  Audio.prototype.perfect = function (streak) {
    var f = 660 * Math.pow(1.0595, Math.min(streak, 12));
    this.blip(f, 0.30, 'sine', 0.45);
    this.blip(f * 1.5, 0.34, 'sine', 0.22);
    this.blip(f * 2, 0.22, 'triangle', 0.10);
  };
  Audio.prototype.miss = function () {
    this.blip(150, 0.42, 'sawtooth', 0.32, 55);
    this.noise(0.30, 0.28, 220);
  };
  Audio.prototype.pass = function () { this.blip(300, 0.10, 'sine', 0.10); };
  Audio.prototype.win = function () {
    var self = this, seq = [523, 659, 784, 1047, 1319];
    seq.forEach(function (f, i) { setTimeout(function () { self.blip(f, 0.45, 'sine', 0.40); }, i * 110); });
  };

  // low drone that fades in while time is dilated — the only audible tell
  Audio.prototype.setDilation = function (on) {
    var c = this.ensure(); if (!c || this.muted) return;
    if (on && !this.drone) {
      var o = c.createOscillator(), o2 = c.createOscillator(), g = c.createGain();
      o.type = 'sine'; o.frequency.value = 58;
      o2.type = 'sine'; o2.frequency.value = 87;
      g.gain.setValueAtTime(0.0001, c.currentTime);
      g.gain.exponentialRampToValueAtTime(0.30, c.currentTime + 0.10);
      o.connect(g); o2.connect(g); g.connect(this.master);
      o.start(); o2.start();
      this.drone = { o: o, o2: o2, g: g };
    } else if (!on && this.drone) {
      var d = this.drone; this.drone = null;
      d.g.gain.cancelScheduledValues(c.currentTime);
      d.g.gain.setValueAtTime(Math.max(d.g.gain.value, 0.0001), c.currentTime);
      d.g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + 0.16);
      d.o.stop(c.currentTime + 0.2); d.o2.stop(c.currentTime + 0.2);
    }
  };

  root.VEIL.Audio = Audio;
})(typeof globalThis !== 'undefined' ? globalThis : this);
