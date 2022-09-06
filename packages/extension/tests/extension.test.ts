import fs from 'fs/promises'
import path from 'path'
import vscode from 'vscode'
import { MarqueeExtension } from '../src/extension'

jest.mock('fs/promises', () => ({
  rm: jest.fn().mockResolvedValue({}),
  mkdir: jest.fn().mockResolvedValue({})
}))
jest.mock('../src/gui.view.ts', () => ({
  MarqueeGui: class {
    public broadcast = jest.fn()
    public once = jest.fn()
    public open = jest.fn()
    public close = jest.fn()
    public isActive = jest.fn()
  }
}))
jest.mock('../src/tree.view.ts', () => ({
  TreeView: class {
    public clearTree = jest.fn()
  }
}))
jest.mock('../src/stateManager.ts', () => (class {
  public onWidget = jest.fn()
  public projectWidget = { getActiveWorkspace: jest.fn() }
  public clearAll = jest.fn()
}))

test('should be initiated with no errors', () => {
  const context = { subscriptions: [], extensionPath: '/foo/bar' }
  const ext = new MarqueeExtension(context as any)
  expect(context.subscriptions).toHaveLength(5)
  expect(vscode.window.createTreeView)
    .toBeCalledWith('marquee', expect.any(Object))
  expect(vscode.window.onDidChangeActiveColorTheme)
    .toBeCalledWith(expect.any(Function))
  expect(ext['_stateMgr'].onWidget)
    .toBeCalledWith('openDialog', expect.any(Function))
  expect(fs.rm).toBeCalledWith(
    path.sep + path.join('foo', 'bar', '3rdParty'),
    expect.any(Object))
  expect(context.subscriptions).toMatchSnapshot()
})

test('openMarqueeOnStartup', () => {
  const context = { subscriptions: [], extensionPath: '/foo/bar' }
  const ext = new MarqueeExtension(context as any)
  ext.openGui = jest.fn().mockReturnValue('openedGui')
  ext['_stateMgr'].projectWidget.getActiveWorkspace = () => 'workspace' as any

  expect(ext['openMarqueeOnStartup']()).toBe(undefined)
  expect(ext.openGui).toBeCalledTimes(0)
  expect(ext['openMarqueeOnStartup']({
    launchOnStartup: true,
    workspaceLaunch: true
  } as any)).toBe(undefined)
  expect(ext.openGui).toBeCalledTimes(0)
  expect(ext['openMarqueeOnStartup']({
    launchOnStartup: true,
    workspaceLaunch: false
  } as any)).toBe('openedGui')
})

test('openDialog', async () => {
  const context = { subscriptions: [], extensionPath: '/foo/bar' }
  const ext = new MarqueeExtension(context as any)
  ext.openGui = jest.fn().mockReturnValue('openedGui')

  await ext['openDialog']('removeWidget', 'foobar')
  expect(ext.openGui).toBeCalledTimes(1)
  expect(ext['gui'].broadcast).toBeCalledWith('removeWidget', 'foobar')
})

test('wipe', async () => {
  const context = { subscriptions: [], extensionPath: '/foo/bar' }
  const ext = new MarqueeExtension(context as any)
  ext.closeGui = jest.fn()

  await ext['wipe']()
  expect(ext['gui'].broadcast).toBeCalledWith('resetMarquee', true)
  expect(ext['treeView'].clearTree).toBeCalledTimes(1)
  expect(ext['_stateMgr'].clearAll).toBeCalledTimes(1)
  expect(ext['closeGui']).toBeCalledTimes(1)
})

test('_switchTo', async () => {
  const context = { subscriptions: [], extensionPath: '/foo/bar' }
  const ext = new MarqueeExtension(context as any)
  ext.openGui = jest.fn()
  ext.openView = jest.fn()

  await ext['_switchTo']()
  expect(ext.openGui).toBeCalledTimes(1)
  expect(ext.openView).toBeCalledTimes(0)
  await ext['_switchTo'](true)
  expect(ext.openView).toBeCalledTimes(1)
})

test('openView', () => {
  const context = { subscriptions: [], extensionPath: '/foo/bar' }
  const ext = new MarqueeExtension(context as any)
  ext['openView']()
  expect(ext['view'].reveal).toBeCalledTimes(0)
  ext['treeView'].focus = true as any
  ext['openView']()
  expect(ext['view'].reveal).toBeCalledTimes(1)
})

test('openGui', async () => {
  const context = { subscriptions: [], extensionPath: '/foo/bar' }
  const ext = new MarqueeExtension(context as any)
  const openPromise = ext.openGui()
  expect(ext['gui'].open).toBeCalledTimes(1)
  expect(ext['gui'].once).toBeCalledTimes(1)
  const once = (ext['gui'].once as jest.Mock).mock.calls.pop().pop()
  once('opened')
  expect(await openPromise).toBe('opened')
})

test('closeGui', () => {
  const context = { subscriptions: [], extensionPath: '/foo/bar' }
  const ext = new MarqueeExtension(context as any)
  ext.closeGui()
  expect(ext['gui'].close).toBeCalledTimes(1)
})

test('guiActive', () => {
  const context = { subscriptions: [], extensionPath: '/foo/bar' }
  const ext = new MarqueeExtension(context as any)
  ext.guiActive()
  expect(ext['gui'].isActive).toBeCalledTimes(1)
})

test('_editTreeItem', async () => {
  const context = { subscriptions: [], extensionPath: '/foo/bar' }
  const ext = new MarqueeExtension(context as any)
  ext['openDialog'] = jest.fn()

  const item = {
    getDialogs: jest.fn().mockReturnValue('foobar'),
    id: 'barfoo',
    type: 'Note'
  }
  await ext['_editTreeItem'](item as any)
  expect(ext['openDialog']).toBeCalledWith('foobar', 'barfoo');
  (ext['openDialog'] as jest.Mock).mockClear()

  const oldSnippetItem = {
    type: 'Snippet',
    item: {
      title: 'Untitled',
      id: 'foobar'
    }
  }
  await ext['_editTreeItem'](oldSnippetItem as any)
  expect(vscode.workspace.openTextDocument).toBeCalledWith(
    `parsedUri-snippet:${path.sep}${path.join('foobar', 'Untitled')}`
  );
  (ext['openDialog'] as jest.Mock).mockClear()

  const filePath = path.sep + path.join('foo', 'bar')
  const newSnippetItem = {
    type: 'Snippet',
    item: { path: filePath }
  }
  await ext['_editTreeItem'](newSnippetItem as any)
  expect(vscode.workspace.openTextDocument).toBeCalledWith(
    `parsedUri-snippet:${filePath}`)
  expect(vscode.window.showTextDocument).toBeCalledTimes(2)
})

test('_onColorThemeChange', () => {
  const context: any = { subscriptions: [], extensionPath: '/foo/bar' }
  const ext = new MarqueeExtension(context)
  // @ts-expect-error
  ext['gui'] = {
    isActive: jest.fn(),
    close: jest.fn(),
    open: jest.fn()
  }
  ext['_onColorThemeChange']()
  expect(ext['gui'].close).toBeCalledTimes(0)

  ;(ext['gui'].isActive as jest.Mock).mockReturnValue(true)
  ext['_onColorThemeChange']()
  expect(vscode.window.showInformationMessage).toBeCalledTimes(1)
})
