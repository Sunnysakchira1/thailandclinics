import { describe, expect, it } from 'vitest';
import { bangkokClock, isOpenAt, isOpenOnDay, parseDay, parseHours } from './opening-hours';

const at = (day: string, h: number, m = 0) => ({ day, minutes: h * 60 + m });

describe('parseDay', () => {
  it.each([
    ['10AM-8PM', [[600, 1200]]],
    ['10AM-4:30PM', [[600, 990]]],
    ['8:30AM-5:30PM', [[510, 1050]]],
    ['12-8PM', [[720, 1200]]],
    ['12-8:30PM', [[720, 1230]]],
    ['5:30-8PM', [[1050, 1200]]],
    ['9-11AM', [[540, 660]]],
    ['9-1PM', [[540, 780]]],
    ['9-11AM, 1-4PM', [[540, 660], [780, 960]]],
    ['12-8AM, 10AM-8PM', [[0, 480], [600, 1200]]],
    ['9:30AM-1PM, 2-6:30PM', [[570, 780], [840, 1110]]],
    ['12PM-12AM', [[720, 1440]]],
    ['10AM-12AM', [[600, 1440]]],
    ['6PM-2AM', [[1080, 1560]]],
    ['Open 24 hours', [[0, 1440]]],
    ['Closed', []],
    ['', []],
    ['garbage', []],
  ])('%s', (raw, want) => expect(parseDay(raw)).toEqual(want));

  it('tolerates narrow no-break spaces', () => {
    expect(parseDay('10 AM-8 PM')).toEqual([[600, 1200]]);
  });
});

describe('isOpenAt', () => {
  const h = { Monday: '9-11AM, 1-4PM', Tuesday: 'Closed', Wednesday: '6PM-2AM' };
  it('respects split shifts', () => {
    expect(isOpenAt(h, at('Monday', 10))).toBe(true);
    expect(isOpenAt(h, at('Monday', 12))).toBe(false);
    expect(isOpenAt(h, at('Monday', 13))).toBe(true);
  });
  it('treats the closing minute as closed', () => {
    expect(isOpenAt(h, at('Monday', 11))).toBe(false);
  });
  it('is closed on closed days and with no data', () => {
    expect(isOpenAt(h, at('Tuesday', 10))).toBe(false);
    expect(isOpenAt(h, at('Friday', 10))).toBe(false);
    expect(isOpenAt(null, at('Monday', 10))).toBe(false);
  });
  it('carries overnight shifts into the next day', () => {
    expect(isOpenAt(h, at('Wednesday', 23))).toBe(true);
    expect(isOpenAt(h, at('Thursday', 1))).toBe(true);
    expect(isOpenAt(h, at('Thursday', 2))).toBe(false);
  });
  it('wraps Sunday to Saturday', () => {
    expect(isOpenAt({ Saturday: '6PM-2AM' }, at('Sunday', 1))).toBe(true);
  });
});

describe('helpers', () => {
  it('bangkokClock is UTC+7 across a day boundary', () => {
    expect(bangkokClock(new Date('2026-11-08T18:30:00Z'))).toEqual({ day: 'Monday', minutes: 90 });
  });
  it('isOpenOnDay', () => {
    expect(isOpenOnDay({ Sunday: '10AM-8PM' }, 'Sunday')).toBe(true);
    expect(isOpenOnDay({ Sunday: 'Closed' }, 'Sunday')).toBe(false);
    expect(isOpenOnDay(null, 'Sunday')).toBe(false);
  });
  it('parseHours survives bad input', () => {
    expect(parseHours('{bad')).toBeNull();
    expect(parseHours('[1]')).toBeNull();
    expect(parseHours(null)).toBeNull();
    expect(parseHours('{"Monday":"Closed"}')).toEqual({ Monday: 'Closed' });
  });
});
