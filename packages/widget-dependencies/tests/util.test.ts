import { urlJoin } from '../src/util'

test('urlJoin', () => {
  expect(urlJoin('https://registry.com', 'package'))
    .toBe('https://registry.com/package')
  expect(urlJoin('https://registry.com/', 'package'))
    .toBe('https://registry.com/package')
  expect(urlJoin('https://registry.com/', '/package'))
    .toBe('https://registry.com/package')
})