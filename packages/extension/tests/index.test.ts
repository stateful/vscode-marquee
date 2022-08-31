// @ts-expect-error mock
import { sendTelemetryEvent } from '@vscode/extension-telemetry'
import { Logger } from '@vscode-marquee/utils/extension'

import { activate, deactivate } from '../src'

jest.mock('../src/extension.ts', () => ({
  MarqueeExtension: class {}
}))

jest.mock('@vscode-marquee/utils/extension', () => ({
  getExtProps: jest.fn().mockReturnValue({ some: 'props' }),
  Logger: { configure: jest.fn() },
  pkg: { version: '1.2.3' },
  GitProvider: class {
    init = jest.fn()
  }
}))

jest.useFakeTimers()
const context: any = { subscriptions: [] }

test('should activate extension manager', async () => {
  jest.clearAllTimers()

  let exp = await activate(context)
  expect(sendTelemetryEvent).toBeCalledWith('extensionActivate', expect.any(Object), undefined)
  expect(Logger.configure).toBeCalledTimes(1)
  expect(typeof exp.marquee).toBe('undefined')

  process.env.NODE_ENV = 'development'
  exp = await activate(context)
  const client = { whenReady: jest.fn().mockResolvedValue({}), emit: jest.fn(), on: jest.fn() }
  await exp.marquee!.setup(client as any)

  jest.advanceTimersByTime(2000)
  expect(client.on).toBeCalledWith('changeName', expect.any(Function))
  expect(client.emit).toBeCalledWith('counter', 1)
})

test('should deactivate extension', () => {
  deactivate()
  expect(sendTelemetryEvent).toBeCalledWith('extensionDeactivate', undefined, undefined)
})
