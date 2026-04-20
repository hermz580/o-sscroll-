import { describe, it } from 'node:test';
import assert from 'node:assert';
import { reduceNumber, getLifePath, getNumerology, getZodiac, getKeplerAstrology } from './calculations.ts';

describe('Calculations Utils', () => {
  it('reduceNumber should correctly reduce numbers to single digits or master numbers', () => {
    assert.strictEqual(reduceNumber(12), 3);
    assert.strictEqual(reduceNumber(1990), 1);
    assert.strictEqual(reduceNumber(11), 11); // Master number
    assert.strictEqual(reduceNumber(22), 22); // Master number
    assert.strictEqual(reduceNumber(33), 33); // Master number
  });

  it('getLifePath should correctly calculate life path from birth date string', () => {
    assert.strictEqual(getLifePath('1990-01-01'), 3);
    assert.strictEqual(getLifePath('1994-11-22'), 11);
    assert.strictEqual(getLifePath(''), null);
    assert.strictEqual(getLifePath('1990'), null);
  });

  it('getNumerology should correctly calculate destiny and soul urge numbers', () => {
    assert.strictEqual(getNumerology('John Doe', 'destiny'), 8); // J(1)+o(6)+h(8)+n(5)+D(4)+o(6)+e(5) = 35 -> 8
    assert.strictEqual(getNumerology('John Doe', 'soul'), 8); // o(6)+o(6)+e(5) = 17 -> 8
    assert.strictEqual(getNumerology('', 'destiny'), null);
  });

  it('getZodiac should correctly determine the zodiac sign based on date string', () => {
    assert.strictEqual(getZodiac('1990-03-25'), 'Aries');
    assert.strictEqual(getZodiac('1990-11-15'), 'Scorpio');
    assert.strictEqual(getZodiac('invalid-date'), null);
    assert.strictEqual(getZodiac(''), null);
  });

  it('getKeplerAstrology should generate kepler astrology details', () => {
    const result = getKeplerAstrology('1990-03-25', '12:00');
    assert.ok(result);
    assert.ok(result.primaryHarmonic);
    assert.ok(result.sacredGeometry);
    assert.ok(result.planetaryResonance);

    assert.strictEqual(getKeplerAstrology('invalid', ''), null);
    assert.strictEqual(getKeplerAstrology('', ''), null);
  });
});
