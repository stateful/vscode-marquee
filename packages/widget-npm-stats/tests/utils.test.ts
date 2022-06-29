import { formatDate } from '../src/utils'

test('formatDate', () => {
  expect(formatDate(1656419407727)).toBe('2022-06-28')
})
