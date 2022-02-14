import { activate, deactivate } from '../src';

jest.mock('../src/extension.ts', () => ({
  MarqueeExtension: class {}
}));

jest.useFakeTimers();

test('should activate extension manager', () => {
  expect(typeof deactivate).toBe('function');
  let exp = activate('context' as any);

  expect(typeof exp.marquee).toBe('undefined');

  process.env.NODE_ENV = 'development';
  exp = activate('context' as any);
  const client = { emit: jest.fn() };
  exp.marquee!.setup(client as any);

  jest.advanceTimersByTime(2000);
  expect(client.emit).toBeCalledWith('counter', 1);
});
