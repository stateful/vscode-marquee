import vscode from 'vscode'
import { urlJoin, NamedTerminalProvider } from '../src/util'

test('urlJoin', () => {
  expect(urlJoin('https://registry.com', 'package'))
    .toBe('https://registry.com/package')
  expect(urlJoin('https://registry.com/', 'package'))
    .toBe('https://registry.com/package')
  expect(urlJoin('https://registry.com/', '/package'))
    .toBe('https://registry.com/package')
})

jest.mock('vscode', () => ({
  window: {
    createTerminal: jest.fn(() => ({
      sendText: jest.fn(),
      dispose: jest.fn()
    }))
  }
}))

const getUri = (filePath: string) => ({ fsPath: filePath }) as vscode.Uri

describe('NamedTerminalProvider', () => {
  test('sends proper terminal options', () => {
    const provider = new NamedTerminalProvider('name')

    provider.getOrCreateTerminal(getUri('path/to/cwd'))

    const terminalOptions = jest.mocked(vscode.window.createTerminal).mock.lastCall![0]

    expect(terminalOptions).toMatchObject({
      name: 'name',
      cwd: 'path/to/cwd',
    })
  })

  test('doesnt recreate existing terminal in same cwd', () => {
    const provider = new NamedTerminalProvider('name')

    const terminal1 = provider.getOrCreateTerminal(getUri('path/to/cwd'))
    const terminal2 = provider.getOrCreateTerminal(getUri('path/to/cwd'))

    expect(terminal1).toStrictEqual(terminal2)
  })

  test('recreates terminal that has exited', () => {
    const provider = new NamedTerminalProvider('name')

    const terminal1 = provider.getOrCreateTerminal(getUri('path/to/cwd'))
    ;(terminal1.exitStatus as any) = 1

    const terminal2 = provider.getOrCreateTerminal(getUri('path/to/cwd'))

    expect(terminal2).not.toStrictEqual(terminal1)
    expect(jest.mocked(terminal1.dispose)).toHaveBeenCalledTimes(1)
  })
})
