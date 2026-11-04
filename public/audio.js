// One AudioContext clock, three aligned looping sources, 15 ms linear crossfade.
// Linear fades avoid an equal-power gain bump with strongly correlated versions.
export class ComparisonAudio {
    constructor(onEvent) { this.onEvent = onEvent; this.selected = 0; this.offset = 0; this.playing = false; this.buffers = null; }
    async init() { if (!this.ctx) {
        this.ctx = new AudioContext();
        this.master = this.ctx.createGain();
        this.master.gain.value = .42;
        this.master.connect(this.ctx.destination);
    } await this.ctx.resume(); if (!this.buffers)
        this.buffers = this.synthesize(); }
    synthesize() {
        const rate = this.ctx.sampleRate, n = rate * 12, base = new Float32Array(n), notes = [130.81, 164.81, 196, 164.81, 146.83, 174.61, 220, 174.61];
        let seed = 42;
        for (let i = 0; i < n; i++) {
            const t = i / rate, beat = t % .5, note = notes[Math.floor(t / .5) % 8];
            seed = (1664525 * seed + 1013904223) >>> 0;
            const noise = (seed / 4294967296) * 2 - 1;
            const pluck = Math.exp(-beat * 9) * Math.min(1, beat * 300);
            const kick = Math.sin(2 * Math.PI * (48 * beat + 3 * (1 - Math.exp(-beat * 30)))) * Math.exp(-beat * 22);
            const hat = noise * Math.exp(-(t % .25) * 100) * .04;
            const pad = .035 * (Math.sin(2 * Math.PI * 261.625 * t) + Math.sin(2 * Math.PI * 329.628 * t));
            const edge = Math.min(1, t / .02, (12 - t) / .02);
            base[i] = edge * (.22 * pluck * (Math.sin(2 * Math.PI * note * t) + .22 * Math.sin(2 * Math.PI * note * 2 * t)) + .22 * kick + hat + pad);
        }
        return [1, 3, 8].map(drive => { const b = this.ctx.createBuffer(2, n, rate); let energy = 0; const ch = b.getChannelData(0); for (let i = 0; i < n; i++) {
            ch[i] = Math.tanh(base[i] * drive);
            energy += ch[i] * ch[i];
        } const gain = .12 / Math.sqrt(energy / n); for (let i = 0; i < n; i++)
            ch[i] *= gain; b.copyToChannel(ch, 1); return b; });
    }
    async import(files) { await this.init(); if (files.length !== 3 || files.some(f => f.size > 30 * 1024 * 1024))
        throw Error('Choose three audio files under 30 MB each.'); const buffers = await Promise.all(files.map(async (f) => this.ctx.decodeAudioData(await f.arrayBuffer()))); if (buffers.some(b => b.length !== buffers[0].length || b.numberOfChannels !== buffers[0].numberOfChannels || b.sampleRate !== buffers[0].sampleRate))
        throw Error('The decoded files must have matching durations and channel counts.'); if (buffers[0].duration < 2 || buffers[0].duration > 60)
        throw Error('Use excerpts between 2 and 60 seconds.'); this.pause(); this.buffers = buffers; this.offset = 0; }
    get duration() { return this.buffers?.[0].duration || 12; }
    get position() { return this.playing ? Math.max(0, this.ctx.currentTime - this.started + this.offset) % this.duration : this.offset; }
    async play() { await this.init(); if (this.playing)
        return; this.sources = []; this.gains = []; const start = this.ctx.currentTime + .035; this.started = start; this.buffers.forEach((buffer, i) => { const source = this.ctx.createBufferSource(), gain = this.ctx.createGain(); source.buffer = buffer; source.loop = true; gain.gain.value = i === this.selected ? 1 : 0; source.connect(gain); gain.connect(this.master); source.start(start, this.offset); this.sources.push(source); this.gains.push(gain); }); this.playing = true; this.onEvent('play', { position: this.offset }); }
    pause() { if (!this.playing)
        return; this.offset = Math.max(0, this.position); this.sources.forEach(s => s.stop()); this.sources = []; this.playing = false; this.onEvent('pause', { position: this.offset }); }
    select(index) { if (index === this.selected)
        return; this.selected = index; if (this.playing) {
        const now = this.ctx.currentTime;
        this.gains.forEach((g, i) => { g.gain.cancelAndHoldAtTime(now); g.gain.linearRampToValueAtTime(i === index ? 1 : 0, now + .015); });
    } this.onEvent('switch', { index, position: this.position }); }
}
