import { formatAMPM } from '../src/utils';

test('formatAMPM', () => {
  expect(formatAMPM(new Date(1645789607201))).toBe('12:46 PM');
  expect(formatAMPM(new Date(1645782607201))).toBe('10:50 AM');
});
