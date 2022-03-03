import fs from 'fs/promises';
import vscode from 'vscode';
import { MarqueeExtension } from '../src/extension';

jest.mock('fs/promises', () => ({
  rm: jest.fn().mockResolvedValue({}),
  mkdir: jest.fn().mockResolvedValue({})
}));
jest.mock('../src/gui.view.ts', () => ({
  MarqueeGui: class {
    public broadcast = jest.fn();
    public once = jest.fn();
    public open = jest.fn();
    public close = jest.fn();
    public isActive = jest.fn();
  }
}));
jest.mock('../src/tree.view.ts', () => ({
  TreeView: class {
    public clearTree = jest.fn();
  }
}));
jest.mock('../src/stateManager.ts', () => class {
  public onWidget = jest.fn();
  public projectWidget = { getActiveWorkspace: jest.fn() };
  public clearAll = jest.fn();
});

test('should be initiated with no errors', () => {
  const context = { subscriptions: [], extensionPath: '/foo/bar' };
  const ext = new MarqueeExtension(context as any);
  expect(context.subscriptions).toHaveLength(5);
  expect(vscode.window.createTreeView)
    .toBeCalledWith('marquee', expect.any(Object));
  expect(vscode.window.onDidChangeActiveColorTheme)
    .toBeCalledWith(expect.any(Function));
  expect(ext['_stateMgr'].onWidget)
    .toBeCalledWith('openDialog', expect.any(Function));
  expect(fs.rm).toBeCalledWith('/foo/bar/3rdParty', expect.any(Object));
  expect(context.subscriptions).toMatchSnapshot();
});

test('openMarqueeOnStartup', () => {
  const context = { subscriptions: [], extensionPath: '/foo/bar' };
  const ext = new MarqueeExtension(context as any);
  ext.openGui = jest.fn().mockReturnValue('openedGui');
  ext['_stateMgr'].projectWidget.getActiveWorkspace = () => 'workspace' as any;

  expect(ext['openMarqueeOnStartup']()).toBe(undefined);
  expect(ext.openGui).toBeCalledTimes(0);
  expect(ext['openMarqueeOnStartup']({
    launchOnStartup: true,
    workspaceLaunch: true
  } as any)).toBe(undefined);
  expect(ext.openGui).toBeCalledTimes(0);
  expect(ext['openMarqueeOnStartup']({
    launchOnStartup: true,
    workspaceLaunch: false
  } as any)).toBe('openedGui');
});

test('openDialog', async () => {
  const context = { subscriptions: [], extensionPath: '/foo/bar' };
  const ext = new MarqueeExtension(context as any);
  ext.openGui = jest.fn().mockReturnValue('openedGui');

  await ext['openDialog']('openSettings', { foo: 'bar' });
  expect(ext.openGui).toBeCalledTimes(1);
  expect(ext['gui'].broadcast).toBeCalledWith('openSettings', { foo: 'bar' });
});

test('wipe', async () => {
  const context = { subscriptions: [], extensionPath: '/foo/bar' };
  const ext = new MarqueeExtension(context as any);
  ext.closeGui = jest.fn();

  await ext['wipe']();
  expect(ext['gui'].broadcast).toBeCalledWith('resetMarquee', true);
  expect(ext['treeView'].clearTree).toBeCalledTimes(1);
  expect(ext['_stateMgr'].clearAll).toBeCalledTimes(1);
  expect(ext['closeGui']).toBeCalledTimes(1);
});

test('_switchTo', async () => {
  const context = { subscriptions: [], extensionPath: '/foo/bar' };
  const ext = new MarqueeExtension(context as any);
  ext.openGui = jest.fn();
  ext.openView = jest.fn();

  await ext['_switchTo']();
  expect(ext.openGui).toBeCalledTimes(1);
  expect(ext.openView).toBeCalledTimes(0);
  await ext['_switchTo'](true);
  expect(ext.openView).toBeCalledTimes(1);
});

test('openView', () => {
  const context = { subscriptions: [], extensionPath: '/foo/bar' };
  const ext = new MarqueeExtension(context as any);
  ext['openView']();
  expect(ext['view'].reveal).toBeCalledTimes(0);
  ext['treeView'].focus = true as any;
  ext['openView']();
  expect(ext['view'].reveal).toBeCalledTimes(1);
});

test('openGui', async () => {
  const context = { subscriptions: [], extensionPath: '/foo/bar' };
  const ext = new MarqueeExtension(context as any);
  const openPromise = ext.openGui();
  expect(ext['gui'].open).toBeCalledTimes(1);
  expect(ext['gui'].once).toBeCalledTimes(1);
  const once = (ext['gui'].once as jest.Mock).mock.calls.pop().pop();
  once('opened');
  expect(await openPromise).toBe('opened');
});

test('closeGui', () => {
  const context = { subscriptions: [], extensionPath: '/foo/bar' };
  const ext = new MarqueeExtension(context as any);
  ext.closeGui();
  expect(ext['gui'].close).toBeCalledTimes(1);
});

test('guiActive', () => {
  const context = { subscriptions: [], extensionPath: '/foo/bar' };
  const ext = new MarqueeExtension(context as any);
  ext.guiActive();
  expect(ext['gui'].isActive).toBeCalledTimes(1);
});
