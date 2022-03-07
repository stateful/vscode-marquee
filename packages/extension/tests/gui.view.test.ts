import vscode from 'vscode';
import { TextEncoder } from 'util';
import { render } from 'eta';
import { MarqueeGui } from '../src/gui.view';

const stateMgr = {
  widgetExtensions: [
    {
      exports: { marquee: { disposable: {
        on: jest.fn(),
        stopListenOnChangeEvents: false
      } } },
      packageJSON: {}
    },
    {
      exports: { marquee: { disposable: {
        on: jest.fn(),
        stopListenOnChangeEvents: false
      } } },
      packageJSON: {}
    }
  ],
  projectWidget: {
    getActiveWorkspace: jest.fn().mockReturnValue({ id: 'foobar' })
  }
};

jest.mock('@vscode-marquee/utils/extension', () => ({
  getExtProps: jest.fn().mockReturnValue({ some: 'props' }),
  pkg: { version: '1.2.3' }
}));

test('constructor', () => {
  new MarqueeGui('context' as any, stateMgr as any);
  expect(stateMgr.widgetExtensions[0].exports.marquee.disposable.on).toBeCalledTimes(2);
  expect(stateMgr.widgetExtensions[0].exports.marquee.disposable.on)
    .toBeCalledWith('gui.open', expect.any(Function));
  expect(stateMgr.widgetExtensions[0].exports.marquee.disposable.on)
    .toBeCalledWith('gui.close', expect.any(Function));
});

test('isActive', () => {
  const gui = new MarqueeGui('context' as any, stateMgr as any);
  gui['guiActive'] = 'foobar' as any;
  expect(gui.isActive()).toBe('foobar');
});

test('close', () => {
  const gui = new MarqueeGui('context' as any, stateMgr as any);
  gui.close();
  gui['panel'] = { dispose: jest.fn() } as any;
  gui.close();
  expect(gui['panel']!.dispose).toBeCalledTimes(1);
});

test('broadcast', () => {
  const gui = new MarqueeGui('context' as any, stateMgr as any);
  expect(gui.broadcast('openSettings', 'foobar')).toBe(false);

  gui['client'] = { emit: jest.fn() } as any;
  expect(gui.broadcast('openSettings', 'foobar')).toBe(undefined);
  expect(gui['client']!.emit).toBeCalledWith('openSettings', 'foobar');
});

test('_executeCommand', () => {
  const gui = new MarqueeGui('context' as any, stateMgr as any);
  gui['_executeCommand']({ command: 'vscode.openFolder', args: ['foo', 'bar'], options: 'foobar' as any});
  expect(vscode.commands.executeCommand).toBeCalledWith('vscode.openFolder', 'parsedUri-foo', 'foobar');

  gui['_executeCommand']({ command: 'barfoo', args: ['foo', 'bar'], options: 'foobar' as any});
  expect(vscode.commands.executeCommand).toBeCalledWith('barfoo', 'foo', 'foobar');

  gui['_executeCommand']({ command: 'barfoo', options: 'foobar'} as any);
  expect(vscode.commands.executeCommand).toBeCalledWith('barfoo', undefined, 'foobar');
});

test('_handleNotifications', () => {
  const gui = new MarqueeGui('context' as any, stateMgr as any);
  gui['_handleNotifications']({ type: 'error', message: 'foobar' });
  expect(vscode.window.showErrorMessage).toBeCalledWith('foobar');

  gui['_handleNotifications']({ type: 'warning', message: 'foobar' });
  expect(vscode.window.showWarningMessage).toBeCalledWith('foobar');

  gui['_handleNotifications']({ type: 'anything', message: 'foobar' });
  expect(vscode.window.showInformationMessage).toBeCalledWith('foobar');
});

test('open an already open webview', async () => {
  const gui = new MarqueeGui('context' as any, stateMgr as any);
  gui['panel'] = { reveal: jest.fn() } as any;
  gui['guiActive'] = true;
  await gui.open();
  expect(gui['panel']?.reveal).toBeCalledTimes(1);
});

test('open webview', async () => {
  const context = {
    extensionUri: '/some/uri',
    extensionPath: '/some/path'
  };
  const gui = new MarqueeGui(context as any, stateMgr as any);
  const encoder = new TextEncoder();
  gui['_template'] = Promise.resolve(encoder.encode('<html></html>'));
  await gui.open();

  expect(gui['panel']?.iconPath).toMatchSnapshot();
  expect((render as jest.Mock).mock.calls).toMatchSnapshot();
});

test('_disposePanel', () => {
  const gui = new MarqueeGui('context' as any, stateMgr as any);
  gui['guiActive'] = true;
  gui['panel'] = {} as any;
  gui.emit = jest.fn();

  const client = { removeAllListeners: jest.fn() };
  gui['client'] = client as any;

  gui['_disposePanel']();
  expect(gui['guiActive']).toBe(false);
  expect(gui['panel']).toBe(null);
  expect(gui.emit).toBeCalledWith('webview.close');
  expect(client.removeAllListeners).toBeCalledTimes(1);
  expect(typeof gui['client']).toBe('undefined');
});

test('_handleWebviewMessage', () => {
  const gui = new MarqueeGui('context' as any, stateMgr as any);
  gui['_executeCommand'] = jest.fn();
  gui['_handleNotifications'] = jest.fn();
  gui['_handleViewStateChange'] = jest.fn();
  gui['emit'] = jest.fn();

  gui['_handleWebviewMessage']({ west: { execCommands: ['foo', 'bar'] } });
  expect(gui['_executeCommand']).toBeCalledTimes(2);
  expect(gui['_executeCommand']).toBeCalledWith('foo', 0, ['foo', 'bar']);
  expect(gui['_executeCommand']).toBeCalledWith('bar', 1, ['foo', 'bar']);

  gui['_handleWebviewMessage']({ west: { notify: { message: 'foobar' } } });
  expect(gui['_handleNotifications']).toBeCalledWith({ message: 'foobar' });

  expect(gui['guiActive']).toBe(false);
  gui['_handleWebviewMessage']({ ready: true });
  expect(gui['guiActive']).toBe(true);
  expect(gui['_handleViewStateChange']).toBeCalledWith({ webviewPanel: { visible: true } });
  expect(gui.emit).toBeCalledWith('webview.open');
});

test('_handleViewStateChange', () => {
  const gui = new MarqueeGui('context' as any, stateMgr as any);
  expect(stateMgr.widgetExtensions[0].exports.marquee.disposable.stopListenOnChangeEvents).toBe(false);
  expect(stateMgr.widgetExtensions[1].exports.marquee.disposable.stopListenOnChangeEvents).toBe(false);
  gui['_handleViewStateChange']({ webviewPanel: { visible: true }} as any);
  expect(stateMgr.widgetExtensions[0].exports.marquee.disposable.stopListenOnChangeEvents).toBe(true);
  expect(stateMgr.widgetExtensions[1].exports.marquee.disposable.stopListenOnChangeEvents).toBe(true);
});
