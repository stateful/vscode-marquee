import vscode from 'vscode'
import { TextEncoder } from 'util'
import { render } from 'eta'
import { MarqueeGui } from '../src/gui.view'

const context: any = {}
const stateMgr: any = {
  widgetExtensions: [
    {
      exports: { marquee: { disposable: {
        on: jest.fn()
      } } },
      packageJSON: {}
    },
    {
      exports: { marquee: { disposable: {
        on: jest.fn()
      } } },
      packageJSON: {}
    }
  ],
  gui: {
    state: { modeName: 'foobar' },
    configuration: {
      modes: {
        default: {},
        foobar: {}
      }
    },
    updateState: jest.fn()
  },
  projectWidget: {
    getActiveWorkspace: jest.fn().mockReturnValue({ id: 'foobar' })
  }
}
const channel: any = {
  appendLine: jest.fn()
}

beforeEach(() => {
  channel.appendLine.mockClear()
  ;(vscode.window.showErrorMessage as jest.Mock).mockClear()
})

test('constructor', () => {
  new MarqueeGui(context, stateMgr, channel)
  expect(stateMgr.widgetExtensions[0].exports.marquee.disposable.on).toBeCalledTimes(2)
  expect(stateMgr.widgetExtensions[0].exports.marquee.disposable.on)
    .toBeCalledWith('gui.open', expect.any(Function))
  expect(stateMgr.widgetExtensions[0].exports.marquee.disposable.on)
    .toBeCalledWith('gui.close', expect.any(Function))
})

test('isActive', () => {
  const gui = new MarqueeGui(context, stateMgr, channel)
  gui['guiActive'] = 'foobar' as any
  expect(gui.isActive()).toBe('foobar')
})

test('close', () => {
  const gui = new MarqueeGui(context, stateMgr, channel)
  gui.close()
  gui['panel'] = { dispose: jest.fn() } as any
  gui.close()
  expect(gui['panel']!.dispose).toBeCalledTimes(1)
})

test('broadcast', () => {
  const gui = new MarqueeGui(context, stateMgr, channel)
  expect(gui.broadcast('removeWidget', 'foobar')).toBe(false)

  gui['client'] = { emit: jest.fn() } as any
  expect(gui.broadcast('removeWidget', 'foobar')).toBe(undefined)
  expect(gui['client']!.emit).toBeCalledWith('removeWidget', 'foobar')
})

test('_executeCommand', () => {
  const gui = new MarqueeGui(context, stateMgr, channel)
  gui['_executeCommand']({ command: 'vscode.openFolder', args: ['foo', 'bar'], options: 'foobar' as any})
  expect(vscode.commands.executeCommand).toBeCalledWith('vscode.openFolder', 'parsedUri-foo', 'foobar')

  gui['_executeCommand']({ command: 'barfoo', args: ['foo', 'bar'], options: 'foobar' as any})
  expect(vscode.commands.executeCommand).toBeCalledWith('barfoo', 'foo', 'foobar')

  gui['_executeCommand']({ command: 'barfoo', options: 'foobar'} as any)
  expect(vscode.commands.executeCommand).toBeCalledWith('barfoo', undefined, 'foobar')
})

test('_handleNotifications', () => {
  const gui = new MarqueeGui(context, stateMgr, channel)
  gui['_handleNotifications']({ type: 'error', message: 'foobar' })
  expect(vscode.window.showErrorMessage).toBeCalledWith('foobar')

  gui['_handleNotifications']({ type: 'warning', message: 'foobar' })
  expect(vscode.window.showWarningMessage).toBeCalledWith('foobar')

  gui['_handleNotifications']({ type: 'anything', message: 'foobar' })
  expect(vscode.window.showInformationMessage).toBeCalledWith('foobar')
})

test('open an already open webview', async () => {
  const gui = new MarqueeGui(context, stateMgr, channel)
  gui['panel'] = { reveal: jest.fn() } as any
  gui['guiActive'] = true
  await gui.open()
  expect(gui['panel']?.reveal).toBeCalledTimes(1)
})

test('open webview', async () => {
  const context: any = {
    extensionUri: '/some/uri',
    extensionPath: '/some/path'
  }
  const gui = new MarqueeGui(context, stateMgr, channel)
  const encoder = new TextEncoder()
  gui['_template'] = Promise.resolve(encoder.encode('<html></html>'))
  gui['_verifyWidgetStates'] = jest.fn()
  await gui.open()

  expect(gui['_verifyWidgetStates']).toBeCalledTimes(1)
  expect(gui['panel']?.iconPath).toMatchSnapshot()
  expect((render as jest.Mock).mock.calls).toMatchSnapshot()
})

test('_verifyWidgetStates', async () => {
  const gui = new MarqueeGui(context, stateMgr, channel)
  gui['_templateDecoded'] = 'foo'
  await gui.open()
  expect(stateMgr.gui.updateState).toBeCalledTimes(0)
  delete gui['stateMgr'].gui.configuration.modes['foobar']
  await gui.open()
  expect(stateMgr.gui.updateState).toBeCalledWith('modeName', 'default')
})

test('_disposePanel', () => {
  const gui = new MarqueeGui(context, stateMgr, channel)
  gui['guiActive'] = true
  gui['panel'] = {} as any
  gui.emit = jest.fn()

  const client = { removeAllListeners: jest.fn() }
  gui['client'] = client as any

  gui['_disposePanel']()
  expect(gui['guiActive']).toBe(false)
  expect(gui['panel']).toBe(null)
  expect(gui.emit).toBeCalledWith('webview.close')
  expect(client.removeAllListeners).toBeCalledTimes(1)
  expect(typeof gui['client']).toBe('undefined')
})

test('_handleWebviewMessage', async () => {
  const gui = new MarqueeGui(context, stateMgr, channel)
  gui['_executeCommand'] = jest.fn()
  gui['_handleNotifications'] = jest.fn()
  gui['emit'] = jest.fn()

  await gui['_handleWebviewMessage']({ west: { execCommands: ['foo', 'bar'] } })
  expect(gui['_executeCommand']).toBeCalledTimes(2)
  expect(gui['_executeCommand']).toBeCalledWith('foo', 0, ['foo', 'bar'])
  expect(gui['_executeCommand']).toBeCalledWith('bar', 1, ['foo', 'bar'])

  await gui['_handleWebviewMessage']({ west: { notify: { message: 'foobar' } } })
  expect(gui['_handleNotifications']).toBeCalledWith({ message: 'foobar' })

  expect(gui['guiActive']).toBe(false)
  await gui['_handleWebviewMessage']({ ready: true })
  expect(gui['guiActive']).toBe(true)
  expect(gui.emit).toBeCalledWith('webview.open')
})

test('_handleWebviewMessage failing', async () => {
  const gui = new MarqueeGui(context, stateMgr, channel)
  gui['_executeCommand'] = jest.fn().mockRejectedValue(new Error('ups'))

  expect(vscode.window.showErrorMessage).toBeCalledTimes(0)
  await gui['_handleWebviewMessage']({ west: { execCommands: ['foo', 'bar'] } })
  expect(gui['_executeCommand']).toBeCalledTimes(2)
  expect(vscode.window.showErrorMessage).toBeCalledTimes(1)
  expect(vscode.window.showErrorMessage).toBeCalledWith('Marquee Error: ups')
})
