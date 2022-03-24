import { fetchNews } from '../src/utils'

declare const window: {
  fetch: Function
  marqueeBackendBaseUrl: string
}

window.marqueeBackendBaseUrl = 'http://marquee.com'

const fetchOrig = window.fetch
beforeEach(() => {
  window.fetch = jest.fn()
})

test('fetchNews', async () => {
  (window.fetch as jest.Mock).mockResolvedValue({
    ok: 1,
    json: () => 'foobar'
  })

  const result = await fetchNews({ channel: 'foobar'} as any)
  expect((window.fetch as jest.Mock).mock.calls).toMatchSnapshot()
  expect(result).toMatchSnapshot()
})

test('fetchNews fails', async () => {
  (window.fetch as jest.Mock).mockRejectedValue(new Error('ups'))

  const result = await fetchNews({ channel: 'foobar'} as any)
  expect(result).toMatchSnapshot()
})

test('fetchNews fails', async () => {
  (window.fetch as jest.Mock).mockResolvedValue({
    ok: 0,
    status: 123
  })

  const result = await fetchNews({ channel: 'foobar'} as any)
  expect(result).toMatchSnapshot()
})

afterAll(() => {
  window.fetch = fetchOrig
})
