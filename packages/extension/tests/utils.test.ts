import vscode from 'vscode';
import { isExpanded, filterByScope, activateGUI, linkMarquee } from '../src/utils';

test('isExpanded', () => {
  expect(isExpanded(1)).toBe('foo');
  expect(isExpanded(4)).toBe('bar');
  expect(isExpanded(-2)).toBe('bar');
});

test('filterByScope', () => {
  const obj = { workspaceId: '123' };
  expect(filterByScope([obj], null, true)).toEqual([obj]);
  expect(filterByScope([obj], null, false)).toEqual([]);
  expect(filterByScope([obj], { id: '321' }, false)).toEqual([]);
  expect(filterByScope([obj], { id: '123' }, false)).toEqual([obj]);
});

test('activateGUI', () => {
  const context = {
    globalState: {
      get: jest.fn().mockReturnValue({}),
      setKeysForSync: jest.fn()
    }
  };
  const extExport = activateGUI(context as any, {} as any);
  expect(extExport.marquee.disposable.state).toEqual({
    modeName: 'default',
    prevMode: null,
  });
});

test('linkMarquee', async () => {
  const parse = vscode.Uri.parse as jest.Mock;
  await linkMarquee({ item: { path: '/some/file:123:3' } });
  expect(parse).toBeCalledWith('/some/file:123');
  await linkMarquee({ item: { path: '/some/file:124' } });
  expect(parse).toBeCalledWith('/some/file');
});
