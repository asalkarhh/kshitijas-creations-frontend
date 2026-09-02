import { maskMobileNumber } from './privacy';

describe('Privacy Masking Utilities', () => {
  it('masks mobile number displaying prefix and last digits', () => {
    expect(maskMobileNumber('9876543210')).toBe('+91 98*** **210');
    expect(maskMobileNumber('+919876543210')).toBe('+91 98*** **210');
  });

  it('handles invalid or empty phone numbers gracefully', () => {
    expect(maskMobileNumber('')).toBe('—');
    expect(maskMobileNumber(undefined)).toBe('—');
    expect(maskMobileNumber('123')).toBe('—');
  });
});

