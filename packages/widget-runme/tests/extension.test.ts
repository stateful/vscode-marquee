import vscode from 'vscode'
import { activate } from '../src/extension'

const sleep = (ms = 200) => new Promise((resolve) => setTimeout(resolve, ms))

jest.mock('../src/utils', () => ({
  getExcludePattern: jest.fn().mockResolvedValue('foobar')
}))
jest.mock('url', () => ({
  pathToFileURL: jest.fn().mockReturnValue('/some/path')
}))

test('can be initiated', async () => {
  (vscode.workspace.findFiles as jest.Mock).mockResolvedValue(['foo', 'bar'])
  const ext = activate({} as any)
  expect(vscode.workspace.createFileSystemWatcher)
    .toBeCalledWith('**/*.md', false, true, false)
  expect(ext.marquee.disposable.state.isInstalled).toBe(false)
  await sleep()
  expect(ext.marquee.disposable.updateState).toBeCalledWith(
    'notebooks',
    ['/some/path', '/some/path'],
    true
  )
  expect(vscode.workspace.findFiles).toBeCalledWith('**/*.md', '{foobar}')
})

test('it can find files', async () => {
  (vscode.workspace.findFiles as jest.Mock).mockResolvedValue(['/some/path', '/some/path'])
  const onDidDelete = jest.fn()
  const onDidCreate = jest.fn()
  ;(vscode.workspace.createFileSystemWatcher as jest.Mock).mockReturnValue({
    onDidCreate, onDidDelete
  })
  const ext = activate({} as any)
  await sleep()
  onDidCreate.mock.calls[0][0]('foobar')
  expect(ext.marquee.disposable.updateState)
    .toBeCalledWith('notebooks', ['/some/path', '/some/path', 'foobar'], true)
  ;(ext.marquee.disposable.updateState as jest.Mock).mockClear()

  onDidDelete.mock.calls[0][0]('/some/path')
  expect(ext.marquee.disposable.updateState)
    .toBeCalledWith('notebooks', ['/some/path'], true)
  ;(ext.marquee.disposable.updateState as jest.Mock).mockClear()

  onDidDelete.mock.calls[0][0]('barfoo')
  expect(ext.marquee.disposable.updateState).toBeCalledTimes(0)
})
