import vscode from 'vscode';
import { isExpanded, filterByScope, activateGUI, linkMarquee } from '../src/utils';

jest.mock('@vscode-marquee/utils/extension', () => class {
  static defaultConfigurations = {
    'marquee.configuration.modes': { default: 'marquee.configuration.modes' },
    'marquee.configuration.proxy': { default: 'marquee.configuration.proxy' },
    'marquee.configuration.fontSize': { default: 'marquee.configuration.fontSize' },
    'marquee.configuration.launchOnStartup': { default: 'marquee.configuration.launchOnStartup' },
    'marquee.configuration.workspaceLaunch': { default: 'marquee.configuration.workspaceLaunch' }
  };
  setBroadcaster = jest.fn();
  state = 'foobar';
  configuration = {} as any;
  updateConfiguration (prop: string, val: any) {
    this.configuration[prop] = val;
  }
});

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
  expect(extExport.marquee.disposable.state).toEqual('foobar');
});

test('extension manager removes native icon', () => {
  const context = {
    globalState: {
      get: jest.fn().mockReturnValue({}),
      setKeysForSync: jest.fn()
    }
  };
  const extExport = activateGUI(context as any, {} as any);
  extExport.marquee.disposable.updateConfiguration('modes', {
    foobar: {
      icon: { foo: 'bar', native: 123 }
    }
  });
  expect(extExport.marquee.disposable.configuration).toEqual({
    modes: {
      foobar: { icon: { foo: 'bar' } }
    }
  });
});

test('linkMarquee', async () => {
  const parse = vscode.Uri.parse as jest.Mock;
  await linkMarquee({ item: { origin: '/some/file:123:3' } });
  expect(parse).toBeCalledWith('/some/file:123');
  await linkMarquee({ item: { origin: '/some/file:124' } });
  expect(parse).toBeCalledWith('/some/file');
});
