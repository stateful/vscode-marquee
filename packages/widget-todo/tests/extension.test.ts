import vscode from 'vscode'
import { TodoExtensionManager } from '../src/extension'

const context = {
  globalState: {
    setKeysForSync: jest.fn(),
    get: jest.fn().mockReturnValue({ someRandomConfig: 'foobar' }),
    update: jest.fn()
  }
}

jest.mock('os', () => ({
  platform: () => 'some platform',
  release: () => 'some release'
}))

test('generate proper default state and configuration', () => {
  const manager = new TodoExtensionManager(context as any)
  expect(manager.configuration).toMatchSnapshot()
  expect(manager.state).toMatchSnapshot()
  expect(vscode.languages.createDiagnosticCollection).toBeCalledTimes(1)
  expect(vscode.window.onDidChangeActiveTextEditor).toBeCalledWith(
    expect.any(Function))
  expect(vscode.workspace.onDidChangeTextDocument).toBeCalledWith(
    expect.any(Function))
  expect(vscode.workspace.onDidCloseTextDocument).toBeCalledWith(
    expect.any(Function))
})

describe('_addTodo', () => {
  beforeEach(() => {
    // @ts-expect-error
    const methodMock = jest.spyOn(TodoExtensionManager.prototype, '_refreshActiveTextEditor')
    methodMock.mockImplementation() // no-op
  })

  it('with no active text editor', () => {
    const manager = new TodoExtensionManager(context as any)
    expect(manager['_addTodo']({} as any)).toBe(undefined)
  })

  it('with zero length body', () => {
    const manager = new TodoExtensionManager(context as any)

    vscode.window.activeTextEditor = {
      document: {
        getText: jest.fn().mockReturnValue(undefined)
      }
    } as any
    expect(manager['_addTodo']({ range: 123 } as any)).toBe(undefined)
    expect(vscode.window.activeTextEditor?.document.getText)
      .toBeCalledWith(123)
  })

  it('sets todo properly', () => {
    const manager = new TodoExtensionManager(context as any)
    manager['_gitProvider'] = {
      branch: 'foobar',
      commit: 'somecommit'
    } as any
    vscode.window.activeTextEditor = {
      document: {
        getText: jest.fn().mockReturnValue('ToDo: some new todo here'),
        uri: { path: '/some/path.js' }
      }
    } as any
    const diagnostic = {
      range: { start: { line: 123 } },
    } as any
    expect(manager['_addTodo'](diagnostic)).toBe(undefined)
    expect(vscode.commands.executeCommand)
      .toBeCalledWith('marquee.refreshCodeActions')
    expect(manager.emit).toBeCalledWith('gui.open')
    expect((manager.updateState as jest.Mock).mock.calls).toMatchSnapshot()
    // @ts-expect-error
    expect((manager.broadcast as jest.Mock).mock.calls).toMatchSnapshot()
  })
})
