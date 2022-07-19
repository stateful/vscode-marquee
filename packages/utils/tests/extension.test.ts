import vscode from 'vscode'
import ExtensionManager, { activate, getExtProps, setKeysForSync, widgetsToSync } from '../src/extension'

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

beforeEach(() => {
  widgetsToSync.clear()
})

test('generate proper default state and configuration', () => {
  const manager = new ExtensionManager(
    context as any,
    {} as any,
    'widget.todo',
    { defaultConfig: true },
    { defaultState: true }
  )
  expect(manager.configuration).toMatchSnapshot()
  expect(manager.state).toMatchSnapshot()
})

test('should apply old configuration if available', () => {
  context.globalState.get.mockReturnValue({ defaultConfig: 'old config', defaultState: 'old state' })
  const manager = new ExtensionManager(
    context as any,
    {} as any,
    'widget.todo',
    { defaultConfig: true },
    { defaultState: true }
  )
  expect(manager.configuration).toMatchSnapshot()
  expect(manager.state).toMatchSnapshot()
})

test('_onConfigChange', () => {
  const manager = new ExtensionManager(
    context as any,
    { appendLine: jest.fn() } as any,
    'widget.todo',
    { defaultConfig: true, modes: { foo: 'bar' } },
    { defaultState: true }
  )
  manager['broadcast'] = jest.fn();
  (vscode.workspace.getConfiguration as jest.Mock)
    .mockClear()
    .mockReturnValue({ get: jest.fn().mockReturnValue('some new value') })

  const event = { affectsConfiguration: jest.fn() }
  expect(manager['_onConfigChange'](event)).toBe(true)
  // assert that it only checks for defaultConfig prop but skips "modes"
  expect(event.affectsConfiguration).toBeCalledTimes(1)
  event.affectsConfiguration.mockClear()

  event.affectsConfiguration.mockReturnValue(false)
  expect(manager['_onConfigChange'](event)).toBe(true)
  expect(vscode.workspace.getConfiguration).toHaveBeenCalledTimes(0)

  event.affectsConfiguration.mockReturnValue(true)
  expect(manager['_onConfigChange'](event)).toBe(true)
  expect(vscode.workspace.getConfiguration).toHaveBeenCalledTimes(1)
  expect(manager['broadcast']).toHaveBeenCalledTimes(1)
  expect(manager['broadcast']).toHaveBeenCalledWith({ defaultConfig: 'some new value' })
})

test('_onConfigChange is not triggered if flags are set', () => {
  const manager = new ExtensionManager(
    context as any,
    { appendLine: jest.fn() } as any,
    'widget.todo',
    {},
    {}
  )
  manager['_configuration'] = []
  expect(manager['_onConfigChange']({} as any)).toBe(true)
  manager['_isConfigUpdateListenerDisabled'] = true
  expect(manager['_onConfigChange']({} as any)).toBe(undefined)
  manager['_isConfigUpdateListenerDisabled'] = false
  manager['_isImportInProgress'] = true
  expect(manager['_onConfigChange']({} as any)).toBe(undefined)
  manager['_isConfigUpdateListenerDisabled'] = false
  manager['_isImportInProgress'] = false
  expect(manager['_onConfigChange']({} as any)).toBe(true)
})

test('broadcast', () => {
  const manager = new ExtensionManager(
    context as any,
    { appendLine: jest.fn() } as any,
    'widget.todo',
    { defaultConfig: true },
    { defaultState: true }
  )
  manager['broadcast']({ foo: 'bar' } as any)

  const tangle = { broadcast: jest.fn() }
  manager['_tangle'] = tangle as any
  manager['broadcast']({ bar: 'foo' } as any)
  expect(tangle.broadcast).toBeCalledWith({ bar: 'foo' })
})

test('setImportInProgress', () => {
  const manager = new ExtensionManager(
    context as any,
    { appendLine: jest.fn() } as any,
    'foobar',
    {},
    {}
  )
  expect(manager['_isImportInProgress']).toBe(false)
  manager.setImportInProgress()
  expect(manager['_isImportInProgress']).toBe(true)
  manager.setImportInProgress(false)
  expect(manager['_isImportInProgress']).toBe(false)
})

test('updateConfiguration', async () => {
  const manager = new ExtensionManager(
    context as any,
    { appendLine: jest.fn() } as any,
    'widget.todo',
    { defaultConfig: true },
    { defaultState: true }
  )
  const waitPromise = new Promise((resolve) => setTimeout(resolve, 100))
  const config = {
    update: jest.fn().mockReturnValue(waitPromise),
    get: jest.fn().mockReturnValue('some new value')
  }

  ;(vscode.workspace.getConfiguration as jest.Mock)
    .mockClear()
    .mockReturnValue(config)
  await manager.updateConfiguration('defaultConfig', 'some other new value' as any)
  expect(manager.configuration.defaultConfig).toBe('some other new value')
  expect(config.update).toBeCalledWith('widget.todo.defaultConfig', 'some other new value', 1)
  await manager.updateConfiguration('defaultConfig', 'another value' as any, 42)
  expect(config.update).toBeCalledWith('widget.todo.defaultConfig', 'another value', 42)
})

test('updateConfiguration does not do anything if values are equal', async () => {
  const manager = new ExtensionManager(
    context as any,
    { appendLine: jest.fn() } as any,
    'widget.todo',
    { prop: { a: 'b' , c: 'd' } },
    {}
  )
  const waitPromise = new Promise((resolve) => setTimeout(resolve, 100))
  const config = {
    update: jest.fn().mockReturnValue(waitPromise),
    get: jest.fn().mockReturnValue('some new value')
  }

  ;(vscode.workspace.getConfiguration as jest.Mock)
    .mockClear()
    .mockReturnValue(config)
  await manager.updateConfiguration('prop', { c: 'd', a: 'b' })
  expect(config.update).toBeCalledTimes(0)
})

test('updateConfiguration does not update if value is falsy and equal', async () => {
  const manager = new ExtensionManager(
    context as any,
    { appendLine: jest.fn() } as any,
    'widget.todo',
    { defaultConfig: 0 },
    { defaultState: true }
  )
  const waitPromise = new Promise((resolve) => setTimeout(resolve, 100))
  const config = {
    update: jest.fn().mockReturnValue(waitPromise),
    get: jest.fn().mockReturnValue('some new value')
  }

  ;(vscode.workspace.getConfiguration as jest.Mock)
    .mockClear()
    .mockReturnValue(config)
  manager['_configuration'] = { defaultConfig: 0 }
  await manager.updateConfiguration('defaultConfig', 0 as any)
  expect(config.update).toBeCalledTimes(0)
})

test('updateState', async () => {
  const manager = new ExtensionManager(
    context as any,
    { appendLine: jest.fn() } as any,
    'widget.todo',
    { defaultConfig: true },
    { defaultState: true }
  )
  manager.emit = jest.fn()
  await manager.updateState('defaultState', 'some new state' as any)
  expect(manager.state.defaultState).toBe('some new state')
  expect(manager.emit).toBeCalledWith('stateUpdate', {
    defaultState: 'some new state',
    defaultConfig: 'old config'
  })
})

test('updateState does not do anything if values are equal', async () => {
  const manager = new ExtensionManager(
    context as any,
    { appendLine: jest.fn() } as any,
    'widget.todo',
    {},
    { prop: { a: 'b' , c: 'd' } }
  )
  manager.emit = jest.fn()
  await manager.updateState('prop', { c: 'd', a: 'b' })
  expect(manager.emit).toBeCalledTimes(0)
})

test('updateState does not do anything if values are equal and falsy', async () => {
  const manager = new ExtensionManager(
    context as any,
    { appendLine: jest.fn() } as any,
    'widget.todo',
    {},
    { prop: 0 }
  )
  manager.emit = jest.fn()
  await manager.updateState('prop', 0)
  expect(manager.emit).toBeCalledTimes(0)
})

test('clear', async () => {
  context.globalState.get.mockClear()
  context.globalState.get.mockReturnValue({})
  const config = {
    get: jest.fn().mockReturnValue({}),
    update: jest.fn()
  }

  ;(vscode.workspace.getConfiguration as jest.Mock)
    .mockClear()
    .mockReturnValue(config)
  const manager = new ExtensionManager(
    context as any,
    { appendLine: jest.fn() } as any,
    'widget.todo',
    { defaultConfig: true },
    { defaultState: true }
  )
  manager.emit = jest.fn()

  await manager.updateConfiguration('defaultConfig', 'some other value #2' as any)
  await manager.updateState('defaultState', 'some other state #2' as any)

  expect(manager.configuration).toEqual({ defaultConfig: 'some other value #2' })
  expect(manager.state).toEqual({ defaultState: 'some other state #2' })

  await manager.clear()

  expect(context.globalState.update).toBeCalledWith('persistence', undefined)
  expect(context.globalState.update).toBeCalledWith('widget.todo', { defaultState: true })
  expect(manager.emit).toBeCalledWith('stateUpdate', { defaultState: true })

  expect(config.update).toBeCalledWith('widget.todo', undefined, 1)
  expect(config.update).toBeCalledWith('widget.todo.defaultConfig', true, 1)

  expect(manager.configuration).toEqual({ defaultConfig: true })
  expect(manager.state).toEqual({ defaultState: true })
})

test('getActiveWorkspace', () => {
  const manager = new ExtensionManager(
    context as any,
    { appendLine: jest.fn() } as any,
    'widget.todo',
    { defaultConfig: true },
    { defaultState: true }
  )
  expect(manager.getActiveWorkspace()).toMatchSnapshot()
})

test('getTextSelection', () => {
  const editor = {
    selection: {
      start: { line: 0, character: 1 },
      end: { line: 2, character: 3 }
    },
    document: {
      uri: { path: '/foo/bar' },
      languageId: '42',
      getText: jest.fn().mockReturnValue('foobar')
    }
  }
  const manager = new ExtensionManager(
    context as any,
    { appendLine: jest.fn() } as any,
    'widget.todo',
    { defaultConfig: true },
    { defaultState: true }
  )
  expect(manager.getTextSelection(editor as any)).toMatchSnapshot()
  expect((vscode.Range as jest.Mock).mock.calls).toEqual([[0, 1, 2, 3]])
})

test('setBroadcaster', () => {
  const tangle = {
    listen: jest.fn().mockReturnValue('a subscription'),
    on: jest.fn()
  }
  const manager = new ExtensionManager(
    context as any,
    { appendLine: jest.fn() } as any,
    'widget.todo',
    { defaultConfig: true },
    { defaultState: true }
  )
  manager.setBroadcaster(tangle as any)
  expect(tangle.on).toBeCalledWith('clear', expect.any(Function))
  expect(tangle.listen).toBeCalledWith('defaultState', expect.any(Function))
  expect(tangle.listen).toBeCalledWith('defaultConfig', expect.any(Function))
  expect(manager['_subscriptions']).toEqual(['a subscription', 'a subscription'])
})

test('generateId', () => {
  const manager = new ExtensionManager(
    context as any,
    { appendLine: jest.fn() } as any,
    'widget.todo',
    { defaultConfig: true },
    { defaultState: true }
  )
  expect(typeof manager.generateId()).toBe('string')
})

test('reset', () => {
  const manager = new ExtensionManager(
    context as any,
    { appendLine: jest.fn() } as any,
    'widget.todo',
    { defaultConfig: true },
    { defaultState: true }
  )
  manager.reset()

  const tangle = { removeAllListeners: jest.fn() }
  const sub = { unsubscribe: jest.fn() }
  manager['_subscriptions'] = [sub]
  manager['_tangle'] = tangle as any

  manager.reset()

  expect(tangle.removeAllListeners).toHaveBeenCalledTimes(1)
  expect(sub.unsubscribe).toHaveBeenCalledTimes(1)
  expect(typeof manager['_tangle']).toBe('undefined')
})

test('dispose', () => {
  const manager = new ExtensionManager(
    context as any,
    { appendLine: jest.fn() } as any,
    'widget.todo',
    { defaultConfig: true },
    { defaultState: true }
  )

  manager.reset = jest.fn()
  const disposable = { dispose: jest.fn() }
  manager['_disposables'] = [disposable]

  manager.dispose()

  expect(manager.reset).toHaveBeenCalledTimes(1)
  expect(disposable.dispose).toHaveBeenCalledTimes(1)
})

test('returns proper interface', () => {
  const exp = activate(context as any, { appendLine: jest.fn() } as any)
  expect(Object.keys(exp.marquee)).toEqual(
    ['disposable', 'defaultState', 'defaultConfiguration', 'setup']
  )
})

test('should upgrade config from v2 to v3', () => {
  context.globalState.get = jest.fn().mockReturnValue({ bg: 42 })
  const exp = activate(context as any, { appendLine: jest.fn() } as any)
  expect(exp.marquee.disposable.configuration.background).toBe(42)
})

test('should get proper extension props', () => {
  const { extversion, ...snap } = getExtProps()
  expect(snap).toMatchSnapshot()
  expect(typeof extversion).toBe('string')
})

test('should not propagate telemetry data if not opted in', () => {
  (vscode.workspace.getConfiguration as jest.Mock)
    .mockReturnValueOnce({ get: jest.fn().mockReturnValue(false) })
  expect(getExtProps()).toEqual({})
})

test('setKeysForSync', () => {
  const context: any = {
    globalState: { setKeysForSync: jest.fn() }
  }
  setKeysForSync(context, 'foo')
  expect(context.globalState.setKeysForSync).toBeCalledWith(['foo'])
  setKeysForSync(context, 'bar')
  expect(context.globalState.setKeysForSync).toBeCalledWith(['foo', 'bar'])
  setKeysForSync(context, 'loo')
  expect(context.globalState.setKeysForSync).toBeCalledWith(['foo', 'bar', 'loo'])

  expect(() => setKeysForSync(context, 'bar')).toThrowErrorMatchingSnapshot()
})
