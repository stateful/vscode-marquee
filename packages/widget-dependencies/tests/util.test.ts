import { urlJoin } from '../src/util'

test('urlJoin', () => {
  {
    const url = urlJoin('https://registry.com', 'package')
    expect(url).toBe('https://registry.com/package')
  }

  {
    const url = urlJoin('https://registry.com/', 'package')
    expect(url).toBe('https://registry.com/package')
  }

  {
    const url = urlJoin('https://registry.com/', '/package')
    expect(url).toBe('https://registry.com/package')
  }
})