import test from 'node:test';
import assert from 'node:assert/strict';
import { ComparisonAudio } from '../public/audio.js';
test('ABC sources share a clock and switching changes gains without restarting', async () => { const starts = [], ramps = [], stops = []; const engine = new ComparisonAudio(() => { }); engine.ctx = { currentTime: 5, resume: async () => { }, createBufferSource: () => ({ connect() { }, start: (at, offset) => starts.push([at, offset]), stop: () => stops.push(true) }), createGain: () => ({ connect() { }, gain: { value: 0, cancelAndHoldAtTime() { }, linearRampToValueAtTime: (value, at) => ramps.push([value, at]) } }) }; engine.master = {}; engine.buffers = [{ duration: 12 }, { duration: 12 }, { duration: 12 }]; engine.offset = 3; await engine.play(); assert.ok(engine.sources.every(source => source.loop === true)); assert.deepEqual(starts, [[5.035, 3], [5.035, 3], [5.035, 3]]); engine.ctx.currentTime = 7; const before = engine.position; engine.select(2); assert.equal(starts.length, 3); assert.equal(engine.position, before); assert.deepEqual(ramps, [[0, 7.015], [0, 7.015], [1, 7.015]]); engine.pause(); assert.equal(stops.length, 3); assert.equal(engine.offset, before); });

test("scheduled start never produces negative playback positions",async()=>{const e=new ComparisonAudio(()=>{});e.ctx={currentTime:5};e.started=5.035;e.offset=0;e.playing=true;e.buffers=[{duration:12}];assert.equal(e.position,0);});


test('loop position wraps and switching at the boundary does not stop playback', () => {
    const engine = new ComparisonAudio(() => {});
    engine.ctx = { currentTime: 16.1 };
    engine.started = 4;
    engine.offset = 0;
    engine.playing = true;
    engine.buffers = [{ duration: 12 }];
    engine.gains = [0,1,2].map(() => ({gain:{cancelAndHoldAtTime(){},linearRampToValueAtTime(){}}}));
    assert.ok(Math.abs(engine.position - .1) < 1e-8);
    engine.select(2);
    assert.equal(engine.playing, true);
    assert.ok(Math.abs(engine.position - .1) < 1e-8);
    engine.ctx.currentTime = 40.5;
    assert.equal(engine.position, .5);
});
