import { fetchData } from '../src/utils'

declare const window: {
  fetch: Function
  marqueeUserProps: any
  marqueeBackendBaseUrl: string
}

const fetchOrig = window.fetch
beforeEach(() => {
  window.fetch = jest.fn()
})

test('fetchData', async () => {
  window.marqueeUserProps = JSON.stringify({ foo: 'bar' })
  window.marqueeBackendBaseUrl = 'http://marquee.com';
  (window.fetch as jest.Mock).mockResolvedValue({
    ok: 1,
    json: () => 'foobar'
  })

  expect(await fetchData(
    'Daily',
    'TypeScript',
    'English'
  )).toBe('foobar')
  expect((window.fetch as jest.Mock).mock.calls).toMatchSnapshot()
})

afterAll(() => {
  window.fetch = fetchOrig
})
