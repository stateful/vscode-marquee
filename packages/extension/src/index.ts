import type vscode from 'vscode'
import type { Client } from 'tangle'

import telemetry from './telemetry'
import { MarqueeExtension } from './extension'
import { getExtProps } from '@vscode-marquee/utils/extension'

export function activate (context: vscode.ExtensionContext) {
  telemetry.sendTelemetryEvent('extensionActivate', getExtProps())
  new MarqueeExtension(context)

  if (process.env.NODE_ENV !== 'development') {
    return {}
  }

  return {
    /**
     * demo code for example widget in "/example"
     */
    marquee: {
      setup: (tangle: Client<{ counter: number }>) => {
        tangle.whenReady().then(() => {
          let i = 0
          setInterval(() => {
            tangle.emit('counter', ++i)
          }, 1000)
        })
      },
    },
  }
}

// this method is called when your extension is deactivated
export function deactivate () {
  telemetry.sendTelemetryEvent('extensionDeactivate')
}
