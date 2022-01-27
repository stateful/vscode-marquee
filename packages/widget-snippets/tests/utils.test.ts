import { getHighlightLanguage } from '../src/utils';

test('no value provided', () => {
  // @ts-expect-error missing params
  expect(getHighlightLanguage()).toEqual({ name: 'text', value: 'text' });
});

test('should find matching language', () => {
  expect(getHighlightLanguage({
    name: 'css',
    value: 'css'
  })).toEqual({ name: 'css', value: 'css' });
});

test('should find vsc compatible language', () => {
  expect(getHighlightLanguage({
    name: 'javascriptreact',
    value: 'javascriptreact'
  })).toEqual({ name: 'jsx', value: 'jsx' });
});

test('should default back to text', () => {
  expect(getHighlightLanguage({
    name: 'foobar',
    // @ts-expect-error
    value: 'foobar'
  })).toEqual({ name: 'text', value: 'text' });
});
