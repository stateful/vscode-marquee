import vscode from 'vscode';
import { MarqueeGui } from '../src/gui.view';

const stateMgr = {
  widgetExtensions: [
    { exports: { marquee: { disposable: { on: jest.fn() } } } },
    { exports: { marquee: { disposable: { on: jest.fn() } } } }
  ]
};

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
