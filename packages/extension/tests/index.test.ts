// @ts-expect-error mock
import { sendTelemetryEvent } from '@vscode/extension-telemetry'
import { Logger, GitProvider } from '@vscode-marquee/utils/extension'

import { activate, deactivate } from '../src'

jest.mock('../src/extension.ts', () => ({
  MarqueeExtension: class {}
}))

jest.mock('@vscode-marquee/utils/extension', () => {
  const initMock = jest.fn().mockResolvedValue({})
  return {
    getExtProps: jest.fn().mockReturnValue({ some: 'props' }),
    Logger: {
      configure: jest.fn(),
      info: jest.fn()
    },
    pkg: { version: '1.2.3' },
    GitProvider: class {
      static initMock = initMock
      init = initMock
    }
  }
})

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
  const client = { emit: jest.fn(), on: jest.fn() }
  await exp.marquee!.setup(client as any)

  jest.advanceTimersByTime(2000)
  expect(client.on).toBeCalledWith('changeName', expect.any(Function))
  expect(client.emit).toBeCalledWith('counter', 1)
})

it('should not break if git provider fails to init', async () => {
  // @ts-expect-error
  (GitProvider.initMock as jest.Mock).mockRejectedValue(new Error('ups'))
  await activate(context)
  expect(Logger.info).toBeCalledWith('Failed to load Git provider: ups')
})

test('should deactivate extension', () => {
  deactivate()
  expect(sendTelemetryEvent).toBeCalledWith('extensionDeactivate', undefined, undefined)
})
