import { formatAMPM } from '../src/utils';

test('formatAMPM', () => {
  expect(formatAMPM(new Date('Fri Feb 25 2022 14:56:41 GMT+0100 (Central European Standard Time)'))).toBe('2:56 PM');
  expect(formatAMPM(new Date('Fri Feb 25 2022 10:11:41 GMT+0100 (Central European Standard Time)'))).toBe('10:11 AM');
});
