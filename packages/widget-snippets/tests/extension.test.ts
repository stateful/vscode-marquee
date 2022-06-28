import path from 'path'
import vscode from 'vscode'
import { SnippetExtensionManager, activate } from '../src/extension'

jest.mock('../src/provider/SnippetStorageProvider', () => (class {
  on = jest.fn()
}))

jest.useFakeTimers().setSystemTime(new Date('2020-01-01').getTime())

beforeEach(() => {
  (vscode.window.showInformationMessage as jest.Mock).mockClear();
  (vscode.window.showTextDocument as jest.Mock).mockClear()
})

test('should register all commands in constructor', () => {
  const m = new SnippetExtensionManager({} as any, {} as any)
  expect(m['_fsProvider'].on).toBeCalledTimes(2)
  expect(vscode.commands.registerCommand).toBeCalledTimes(5)
  expect(vscode.commands.registerTextEditorCommand).toBeCalledTimes(2)
  expect(vscode.workspace.registerTextDocumentContentProvider).toBeCalledTimes(1)
  expect(vscode.workspace.registerFileSystemProvider).toBeCalledTimes(1)
})

test('_saveNewSnippet', () => {
  const m = new SnippetExtensionManager({} as any, {} as any)
  m['_openSnippet'] = jest.fn()
  m.state.snippets = [{ foo: 'bar' } as any]
  m['_saveNewSnippet']({ bar: 'foo', path: 'foobar' } as any)
  expect((m.updateState as jest.Mock).mock.calls).toMatchSnapshot()
  expect((m['broadcast'] as jest.Mock).mock.calls).toMatchSnapshot()
  expect(m['_openSnippet']).toBeCalledWith('foobar')
})

test('_updateSnippet', () => {
  const m = new SnippetExtensionManager({} as any, {} as any)
  m.state.snippets = [{ id: 'foo' } as any]
  m['_updateSnippet']({ id: 'bar' } as any)
  expect(vscode.window.showErrorMessage).toBeCalledTimes(1)
  m['_updateSnippet']({ id: 'foo', body: 'bar' } as any)
  expect((m.updateState as jest.Mock).mock.calls).toMatchSnapshot()
  expect((m['broadcast'] as jest.Mock).mock.calls).toMatchSnapshot()
})

test('_addEmptySnippet', () => {
  const m = new SnippetExtensionManager({} as any, {} as any)
  m['_openSnippet'] = jest.fn()
  m['_addEmptySnippet']()
  expect(m['_openSnippet']).toBeCalledWith('/New Clipboard Item')
})

test('_openSnippet', async () => {
  const m = new SnippetExtensionManager({} as any, {} as any)
  await m['_openSnippet']('/foobar')
  expect(vscode.window.showTextDocument).toBeCalledTimes(1)
})

test('_addSnippet', () => {
  const m = new SnippetExtensionManager({} as any, {} as any);
  (m.getTextSelection as jest.Mock).mockReturnValueOnce({ text: '' })
  m['_addSnippet']({} as any)
  expect(vscode.window.showWarningMessage).toBeCalledWith('Marquee: no text selected');

  (m.getTextSelection as jest.Mock).mockReturnValueOnce({ text: 'foobar', name: 'some name', lang: 'ts' })
  m['_addSnippet']({ document: {
    uri: { path: path.sep + path.join('foo', 'bar') } }
  } as any)

  // delete path to make tests work in windows
  const calls = (m.updateState as jest.Mock).mock.calls
  delete calls[0][1][0].path
  expect(calls).toMatchSnapshot()
  expect((m['broadcast'] as jest.Mock).mock.calls).toMatchSnapshot()

  expect(vscode.commands.executeCommand).toBeCalledWith('marquee.refreshCodeActions')
  expect(vscode.window.showInformationMessage).toBeCalledWith(
    'Added some name to your snippets in Marquee',
    'Open Marquee'
  )
})

test('_insertFromTreeView', () => {
  delete vscode.window.activeTextEditor
  const m = new SnippetExtensionManager({} as any, {} as any)
  m['_insertFromTreeView']({ foo: 'bar' } as any)
  expect((vscode.window.showInformationMessage as jest.Mock).mock.calls[0][0]).toContain('No editor open')

  vscode.window.activeTextEditor = {
    edit: jest.fn(),
    revealRange: jest.fn(),
    document: 'foobar',
    selection: { active: { start: 123, end: 321 } }
  } as any
  m['_insertFromTreeView']({ isTreeItem: true, item: { body: 'bar' } } as any)
  expect(vscode.window.activeTextEditor?.edit).toBeCalledTimes(1)

  const cb = (vscode.window.activeTextEditor?.edit as jest.Mock).mock.calls[0][0]
  const editor = { insert: jest.fn() }
  cb(editor)

  expect(editor.insert).toBeCalledWith({ 'end': 321, 'start': 123 }, 'bar')
  expect(vscode.window.activeTextEditor?.revealRange)
    .toBeCalledWith({}, 'TextEditorRevealType.InCenterIfOutsideViewport')
  expect(vscode.window.showTextDocument).toBeCalledTimes(1)
})

test('_copyToClipboard', () => {
  const m = new SnippetExtensionManager({} as any, {} as any)
  m['_copyToClipboard']({ item: { body: 'foobar' }} as any)
  expect(vscode.env.clipboard.writeText).toBeCalledWith('foobar')
})

test('_removeSnippet', () => {
  const m = new SnippetExtensionManager({} as any, {} as any)
  m.state.snippets = [{ id: 'foo' }, { id: 'bar' }, { id: 'loo' }] as any
  m['_removeSnippet']({ item: { id: 'bar' }} as any)
  expect((m.updateState as jest.Mock).mock.calls).toMatchSnapshot()
  expect((m['broadcast'] as jest.Mock).mock.calls).toMatchSnapshot()
})

test('activate', () => {
  const exp = activate({} as any, {} as any)
  expect(Object.keys(exp.marquee)).toMatchSnapshot()
})
