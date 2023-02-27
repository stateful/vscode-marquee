import vscode from 'vscode'
import { Logger } from '@vscode-marquee/utils/extension'
import { isExpanded, filterByScope, activateGUI, linkMarquee } from '../src/utils'

jest.mock('@vscode-marquee/utils/extension', () => class {
  static defaultConfigurations: Record<string, { default: string }> = {
    'marquee.configuration.proxy': { default: 'marquee.configuration.proxy' },
    'marquee.configuration.fontSize': { default: 'marquee.configuration.fontSize' },
    'marquee.configuration.launchOnStartup': { default: 'marquee.configuration.launchOnStartup' },
    'marquee.configuration.workspaceLaunch': { default: 'marquee.configuration.workspaceLaunch' }
  }
  static Logger = { info: jest.fn(), warn: jest.fn() } as any
  setBroadcaster = jest.fn()
  broadcast = jest.fn()
  state = 'foobar'
  _disposables = []
  configuration = {} as any
  updateState = jest.fn()
  updateConfiguration (prop: string, val: any) {
    this.configuration[prop] = val
  }
})

jest.mock('../src/constants', () => ({ MODES_UPDATE_TIMEOUT: 100 }))

test('isExpanded', () => {
  expect(isExpanded(1)).toBe('foo')
  expect(isExpanded(4)).toBe('bar')
  expect(isExpanded(-2)).toBe('bar')
})

test('filterByScope', () => {
  const obj = { workspaceId: '123' }
  expect(filterByScope([obj], null, true)).toEqual([obj])
  expect(filterByScope([obj], null, false)).toEqual([])
  expect(filterByScope([obj], { id: '321' }, false)).toEqual([])
  expect(filterByScope([obj], { id: '123' }, false)).toEqual([obj])
})

test('activateGUI', () => {
  const context = {
    globalState: {
      get: jest.fn().mockReturnValue({}),
      setKeysForSync: jest.fn()
    }
  }
  const extExport = activateGUI(context as any)
  expect(extExport.marquee.disposable.state).toEqual('foobar')
})

test('linkMarquee', async () => {
  const parse = vscode.Uri.parse as jest.Mock
  await linkMarquee({ item: { path: '/some/file:123:3' } })
  expect(parse).toBeCalledWith('/some/file:123')
  await linkMarquee({ item: { path: '/some/file:124' } })
  expect(parse).toBeCalledWith('/some/file')

  // @ts-expect-error mock feature
  vscode.workspace.lineAtMock.mockImplementation(() => {
    throw new Error('ups')
  })
  await linkMarquee({ item: { path: '/some/file:124' } })
  expect(Logger.warn).toBeCalledWith('Marquee: ups')
})
