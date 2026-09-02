import {
  dateTimeLocalToUtc,
  formatISTCompact,
  formatISTDateTime,
  utcToDateTimeLocal,
} from './date';

describe('Date and Time Utilities (Asia/Kolkata)', () => {
  it('formats UTC ISO timestamp to IST readable string with timezone suffix', () => {
    // 2026-09-02T11:00:00.000Z in UTC is 4:30 PM in IST (+5:30)
    const result = formatISTDateTime('2026-09-02T11:00:00.000Z');
    expect(result).toContain('2026');
    expect(result).toContain('September');
    expect(result).toContain('4:30');
    expect(result).toContain('PM');
    expect(result).toContain('IST');
  });

  it('handles null, undefined, or empty timestamps safely', () => {
    expect(formatISTDateTime(null)).toBe('—');
    expect(formatISTDateTime(undefined)).toBe('—');
    expect(formatISTDateTime('')).toBe('—');
    expect(formatISTCompact(null)).toBe('—');
  });

  it('converts datetime-local IST input string to valid UTC ISO string', () => {
    const istInput = '2026-09-02T16:30';
    const utcIso = dateTimeLocalToUtc(istInput);
    expect(utcIso).toBe('2026-09-02T11:00:00.000Z');
  });

  it('converts UTC ISO string to datetime-local IST input value', () => {
    const utcIso = '2026-09-02T11:00:00.000Z';
    const dtLocal = utcToDateTimeLocal(utcIso);
    expect(dtLocal).toBe('2026-09-02T16:30');
  });
});

