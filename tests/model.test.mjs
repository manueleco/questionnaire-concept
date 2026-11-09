import test from 'node:test';
import assert from 'node:assert/strict';
import { shuffle, validAnswer, toggleRank, csvCell } from '../public/model.js';
test('rankings reject duplicates and retain explicit ties and uncertainty', () => { assert.equal(validAnswer({ kind: 'rank', order: ['A', 'A', 'C'] }), false); assert.equal(validAnswer({ kind: 'rank', order: ['C', 'A', 'B'] }), true); assert.equal(validAnswer({ kind: 'tie' }), true); assert.equal(validAnswer({ kind: 'unsure' }), true); assert.equal(validAnswer({ kind: 'rank', order: ['A'] }), false); });
test('rank selection can be undone without inventing an order', () => { assert.deepEqual(toggleRank({ kind: 'rank', order: ['C', 'B'] }, 'C').order, ['B']); assert.deepEqual(toggleRank({ kind: 'tie' }, 'A').order, ['A']); });
test('randomization preserves a permutation for boundary random values', () => { for (const random of [() => 0, () => .999999, () => .5]) {
    assert.deepEqual(shuffle(['A', 'B', 'C'], random).sort(), ['A', 'B', 'C']);
} });
test('CSV escapes quotes and neutralizes spreadsheet formulas', () => { assert.equal(csvCell('=IMPORTXML("x")'), '"\'=IMPORTXML(""x"")"'); assert.equal(csvCell('plain, text'), '"plain, text"'); });


test('two explicit picks complete all six possible rankings without mutating prior answers', () => {
    for (const first of ['A', 'B', 'C']) for (const second of ['A', 'B', 'C'].filter(x => x !== first)) {
        const initial = toggleRank(undefined, first);
        assert.deepEqual(initial.order, [first]);
        const complete = toggleRank(initial, second);
        assert.deepEqual(complete.order, [first, second, ['A', 'B', 'C'].find(x => x !== first && x !== second)]);
        assert.equal(validAnswer(complete), true);
        assert.deepEqual(initial.order, [first]);
        const revised = toggleRank(complete, second);
        assert.equal(validAnswer(revised), false);
        assert.equal(revised.order.includes(second), false);
        assert.deepEqual(toggleRank(revised, second).order, [first, complete.order[2], second]);
    }
});
