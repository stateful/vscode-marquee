import { fetchNews } from '../src/utils';

declare const window: {
  fetch: Function
  marqueeUserProps: any
  marqueeBackendBaseUrl: string
};

window.marqueeUserProps = JSON.stringify({ foo: 'bar' });
window.marqueeBackendBaseUrl = 'http://marquee.com';

const fetchOrig = window.fetch;
beforeEach(() => {
  window.fetch = jest.fn();
});

test('fetchNews', async () => {
  (window.fetch as jest.Mock).mockResolvedValue({
    ok: 1,
    json: () => 'foobar'
  });

  const setData = jest.fn();
  await fetchNews({ channel: 'foobar'} as any, setData);
  expect((window.fetch as jest.Mock).mock.calls).toMatchSnapshot();
  expect(setData.mock.calls).toMatchSnapshot();
});

test('fetchNews fails', async () => {
  (window.fetch as jest.Mock).mockRejectedValue(new Error('ups'));

  const setData = jest.fn();
  await fetchNews({ channel: 'foobar'} as any, setData);
  expect(setData.mock.calls).toMatchSnapshot();
});

test('fetchNews fails', async () => {
  (window.fetch as jest.Mock).mockResolvedValue({
    ok: 0,
    status: 123
  });

  const setData = jest.fn();
  await fetchNews({ channel: 'foobar'} as any, setData);
  expect(setData.mock.calls).toMatchSnapshot();
});

afterAll(() => {
  window.fetch = fetchOrig;
});
