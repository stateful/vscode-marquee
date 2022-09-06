import {
  getExtensionLogger,
  // @ts-expect-error mock feature
  logger
} from '@vscode-logging/logger'

import { Logger } from '../src/logger'

const context = {
  extension: {
    packageJSON: {
      name: 'foo',
      publisher: 'bar'
    }
  },
  logUri: {
    fsPath: '/to/the/logs'
  }
} as any

describe('logger', () => {
  it('configure', () => {
    Logger.configure(context)
    expect(getExtensionLogger).toBeCalledTimes(1)
    expect((getExtensionLogger as jest.Mock).mock.calls[0][0]).toEqual({
      extName: 'bar.foo',
      level: 'info',
      logConsole: false,
      logOutputChannel: expect.any(Object),
      logPath: '/to/the/logs',
      sourceLocationTracking: false
    })
  })

  it('can read and set log levels', () => {
    expect(Logger.logLevel).toBe('info')
    Logger.logLevel = 'error'
    expect(Logger.logLevel).toBe('error')
    expect(logger.changeLevel).toBeCalledWith('error')
  })

  it('getChildLogger', () => {
    delete Logger['output']
    expect(() => Logger.getChildLogger('foobar')).toThrow()
    Logger.configure(context)
    Logger.getChildLogger('barfoo')
    expect(logger.getChildLogger).toBeCalledWith({ label: 'barfoo' })
  })

  it('info', () => {
    expect(logger.info).toBeCalledTimes(0)
    Logger.info('info')
    expect(logger.info).toBeCalledWith('info')
  })

  it('warn', () => {
    expect(logger.warn).toBeCalledTimes(0)
    Logger.warn('warn')
    expect(logger.warn).toBeCalledWith('warn')
  })

  it('error', () => {
    expect(logger.error).toBeCalledTimes(0)
    Logger.error('error')
    expect(logger.error).toBeCalledWith('error')
  })

  it('fatal', () => {
    expect(logger.fatal).toBeCalledTimes(0)
    Logger.fatal('fatal')
    expect(logger.fatal).toBeCalledWith('fatal')
  })

  it('debug', () => {
    expect(logger.debug).toBeCalledTimes(0)
    // eslint-disable-next-line testing-library/no-debugging-utils
    Logger.debug('debug')
    expect(logger.debug).toBeCalledWith('debug')
  })

  it('trace', () => {
    expect(logger.trace).toBeCalledTimes(0)
    Logger.trace('trace')
    expect(logger.trace).toBeCalledWith('trace')
  })
})
