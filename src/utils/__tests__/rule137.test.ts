import { describe, it, expect } from 'vitest';
import { generate137Dates, RULE_137_LABELS } from '../rule137';

describe('rule137', () => {
  it('generates three dates and preserves labels', () => {
    const base = new Date('2023-01-01T00:00:00.000Z');
    const dates = generate137Dates(base);
    expect(dates).toHaveLength(3);
    expect(RULE_137_LABELS).toEqual(['Day 1', 'Day 3', 'Day 7']);
  });
});
