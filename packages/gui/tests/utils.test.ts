import { MarqueeWindow } from '@vscode-marquee/utils';
import { ucFirst, sendFeedbackRequest } from '../src/utils';

declare const window: MarqueeWindow;

beforeAll(() => {
  window.marqueeBackendBaseUrl = 'https://marquee.stateful.com';
  window.fetch = jest.fn().mockResolvedValue({ ok: true });
});

test('ucFirst', () => {
  expect(ucFirst('foobar')).toBe('Foobar');
});

describe('sendFeedbackRequest', () => {
  test('successfully makes a request', async () => {
    await sendFeedbackRequest('foobar', 'foo@bar.com');
    expect((window.fetch as jest.Mock).mock.calls).toMatchSnapshot();
  });

  test('fails due to fetch error', async () => {
    (window.fetch as jest.Mock).mockRejectedValue(new Error('foo'));
    const err = await sendFeedbackRequest('foobar', 'foo@bar.com')
      .catch((err) => err);
    expect(err.message).toBe('Couldn\'t send feedback message!');
  });

  test('fails due to error response', async () => {
    (window.fetch as jest.Mock).mockResolvedValue({ ok: false, status: 500 });
    const err = await sendFeedbackRequest('foobar', 'foo@bar.com')
      .catch((err) => err);
    expect(err.message).toBe('Couldn\'t send feedback message! (status: 500)');
  });
});
