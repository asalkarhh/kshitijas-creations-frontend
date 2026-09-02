/**
 * Date and Time utilities for India Standard Time (Asia/Kolkata, UTC+5:30)
 */

export const IST_TIMEZONE = 'Asia/Kolkata';

/**
 * Formats a UTC ISO timestamp into a readable date and time string in IST.
 * Example output: "2 September 2026, 4:30 PM IST"
 */
export const formatISTDateTime = (isoString?: string | null): string => {
  if (!isoString) return '—';
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return isoString;

    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: IST_TIMEZONE,
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });

    const parts = formatter.formatToParts(date);
    const day = parts.find((p) => p.type === 'day')?.value || '';
    const month = parts.find((p) => p.type === 'month')?.value || '';
    const year = parts.find((p) => p.type === 'year')?.value || '';
    const hour = parts.find((p) => p.type === 'hour')?.value || '';
    const minute = parts.find((p) => p.type === 'minute')?.value || '';
    const dayPeriod = (parts.find((p) => p.type === 'dayPeriod')?.value || '').toUpperCase();

    return `${day} ${month} ${year}, ${hour}:${minute} ${dayPeriod} IST`;
  } catch {
    return isoString;
  }
};

/**
 * Compact date format in IST.
 * Example output: "2 Sep 2026, 4:30 PM"
 */
export const formatISTCompact = (isoString?: string | null): string => {
  if (!isoString) return '—';
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return isoString;

    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: IST_TIMEZONE,
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });

    const parts = formatter.formatToParts(date);
    const day = parts.find((p) => p.type === 'day')?.value || '';
    const month = parts.find((p) => p.type === 'month')?.value || '';
    const year = parts.find((p) => p.type === 'year')?.value || '';
    const hour = parts.find((p) => p.type === 'hour')?.value || '';
    const minute = parts.find((p) => p.type === 'minute')?.value || '';
    const dayPeriod = (parts.find((p) => p.type === 'dayPeriod')?.value || '').toUpperCase();

    return `${day} ${month} ${year}, ${hour}:${minute} ${dayPeriod}`;
  } catch {
    return isoString;
  }
};

/**
 * Converts a UTC ISO string to "YYYY-MM-DDTHH:mm" for <input type="datetime-local">
 * mapped to Asia/Kolkata local time.
 */
export const utcToDateTimeLocal = (utcIso?: string | null): string => {
  if (!utcIso) return '';
  try {
    const date = new Date(utcIso);
    if (isNaN(date.getTime())) return '';

    // Format parts into Asia/Kolkata
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: IST_TIMEZONE,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });

    const parts = formatter.formatToParts(date);
    const getPart = (type: string) => parts.find((p) => p.type === type)?.value || '';

    const year = getPart('year');
    const month = getPart('month');
    const day = getPart('day');
    const hour = getPart('hour');
    const minute = getPart('minute');

    return `${year}-${month}-${day}T${hour}:${minute}`;
  } catch {
    return '';
  }
};

/**
 * Converts a "YYYY-MM-DDTHH:mm" string entered in IST to a UTC ISO string.
 * Asia/Kolkata is UTC+05:30.
 */
export const dateTimeLocalToUtc = (dateTimeLocal?: string | null): string | null => {
  if (!dateTimeLocal || !dateTimeLocal.trim()) return null;
  try {
    // Expected format: YYYY-MM-DDTHH:mm
    const [datePart, timePart] = dateTimeLocal.trim().split('T');
    if (!datePart || !timePart) return null;

    // Construct ISO string with +05:30 offset
    const istIso = `${datePart}T${timePart}:00.000+05:30`;
    const date = new Date(istIso);
    if (isNaN(date.getTime())) return null;

    return date.toISOString();
  } catch {
    return null;
  }
};
