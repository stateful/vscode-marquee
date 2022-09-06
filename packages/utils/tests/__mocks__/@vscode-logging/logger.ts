export const logger = {
  trace: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  fatal: jest.fn(),
  getChildLogger: jest.fn(),
  changeLevel: jest.fn()
}
export const getExtensionLogger = jest.fn().mockReturnValue(logger)
