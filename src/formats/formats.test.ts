/**
 * @file Tests for the format registry: every format is complete and
 * consistent, and the 2024 5e format differs from 2014 only where it should.
 */
import { describe, expect, it } from 'vitest';
import { FORMAT_LIST, getFormat } from './registry.js';

describe('formats', () => {
  it('every format has conditions with unique ids prefixed by the format id', () => {
    for (const f of FORMAT_LIST) {
      expect(f.conditions.length).toBeGreaterThan(0);
      const ids = f.conditions.map((c) => c.id);
      expect(new Set(ids).size).toBe(ids.length);
      for (const id of ids) expect(id.startsWith(`${f.id}:`)).toBe(true);
    }
  });

  it('only formats with valued conditions define valued ones', () => {
    for (const f of FORMAT_LIST) {
      if (!f.valuedConditions) expect(f.conditions.filter((c) => c.valued)).toEqual([]);
    }
  });

  it('5e 2024 shares the 2014 stat block and dying rules, with Exhaustion as a level', () => {
    const old = getFormat('dnd5e');
    const now = getFormat('dnd5e2024');
    expect(now.statBlockType).toBe(old.statBlockType);
    expect(now.dying).toEqual({ kind: 'deathSaves' });
    expect(now.conditions.map((c) => c.name)).toEqual(old.conditions.map((c) => c.name));
    expect(now.conditions.find((c) => c.name === 'Exhaustion')).toMatchObject({ id: 'dnd5e2024:exhaustion', valued: true });
  });
});
