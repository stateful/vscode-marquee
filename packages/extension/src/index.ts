import type vscode from 'vscode'
import type { Client } from 'tangle'

import telemetry from './telemetry'
import { MarqueeExtension } from './extension'
import { getExtProps, GitProvider } from '@vscode-marquee/utils/extension'

export async function activate (context: vscode.ExtensionContext) {
  telemetry.sendTelemetryEvent('extensionActivate', getExtProps())
  const gitProvider = new GitProvider(context)
  await gitProvider.init()
  context.subscriptions.push(gitProvider)

  new MarqueeExtension(context)

  if (process.env.NODE_ENV !== 'development') {
    return {}
  }

  return {
    /**
     * demo code for example widget in "/exampleWidget"
     */
    marquee: {
      customWidgetCounter: 2, // defined 2 marquee widgets on exampleWidget/widgets.ts
      setup: (tangle: Client<{ counter: number, changeName: string }>) => {
        return tangle.whenReady().then(() => {
          let i = 0
          let name = 'foo'
          tangle.emit('changeName', name)
          tangle.on('changeName', (newName) => {
            name = newName
          })

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
