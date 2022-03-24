import { formatAMPM } from '../src/utils'

function getDate (timestamp: number) {
  return new Date(
    new Date(timestamp).toLocaleString('en-US', { timeZone: 'Europe/Amsterdam'})
  )
}

test('formatAMPM', () => {
  expect(formatAMPM(getDate(1645789607201))).toBe('12:46 PM')
  expect(formatAMPM(getDate(1645782607201))).toBe('10:50 AM')
})
