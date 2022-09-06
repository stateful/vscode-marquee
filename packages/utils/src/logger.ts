import vscode from 'vscode'
import { getExtensionLogger, IVSCodeExtLogger, IChildLogger, LogLevel } from '@vscode-logging/logger'

declare const IS_WEB_BUNDLE: boolean
const DEFAULT_LOG_LEVEL: LogLevel = 'info'

interface MessagePayload {
  label: string
  level: string
  message: string
  time: string
}

export type ChildLogger = IChildLogger

export class Logger {
  private static output?: IVSCodeExtLogger

  static configure (context: vscode.ExtensionContext) {
    const { name, publisher } = context.extension.packageJSON
    const inDevelopment = context.extensionMode === vscode.ExtensionMode.Development

    const channel = vscode.window.createOutputChannel(name.slice(0, 1).toUpperCase() + name.slice(1))
    this.output = getExtensionLogger({
      extName: `${publisher}.${name}`,
      level: this.logLevel, // See LogLevel type in @vscode-logging/types for possible logLevels
      ...(IS_WEB_BUNDLE
        ? {}
        : { logPath: context.logUri.fsPath }
      ),
      logOutputChannel: <vscode.OutputChannel>{
        appendLine: (payload: string) => {
          const msg: MessagePayload = JSON.parse(payload)
          return channel.appendLine(`[${msg.time}] ${msg.level.toUpperCase()} ${msg.label} - ${msg.message}`)
        }
      }, // OutputChannel for the logger
      sourceLocationTracking: false,
      logConsole: inDevelopment // define if messages should be logged to the consol
    })
  }

  private static _logLevel: LogLevel = DEFAULT_LOG_LEVEL
  static get logLevel (): LogLevel {
    return this._logLevel
  }
  static set logLevel (value: LogLevel) {
    this._logLevel = value
    this.output?.changeLevel(value)
  }

  static getChildLogger (label: string): ChildLogger {
    if (!this.output) {
      throw new Error('Can\'t create child logger if main logger wasn\'t initiated')
    }

    return this.output.getChildLogger({ label })
  }

  static info (message: string, ...args: any[]) {
    this.output?.info(message, ...args)
  }

  static warn (message: string, ...args: any[]) {
    this.output?.warn(message, ...args)
  }

  static error (message: string, ...args: any[]) {
    this.output?.error(message, ...args)
  }

  static fatal (message: string, ...args: any[]) {
    this.output?.fatal(message, ...args)
  }

  static debug (message: string, ...args: any[]) {
    this.output?.debug(message, ...args)
  }

  static trace (message: string, ...args: any[]) {
    this.output?.trace(message, ...args)
  }
}
