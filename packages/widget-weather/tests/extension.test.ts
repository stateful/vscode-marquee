import { activate } from '../src/extension';

test('returns proper interface', () => {
  const exp = activate({} as any, {} as any);
  expect(Object.keys(exp.marquee)).toEqual(
    ['disposable', 'defaultState', 'defaultConfiguration', 'setup']
  );
});
