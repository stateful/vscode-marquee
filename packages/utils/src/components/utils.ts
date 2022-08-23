import type { MarqueeWindow } from '../types'

declare const window: MarqueeWindow

export const jumpTo = (item: any) => {
  window.vscode.postMessage({
    west: {
      execCommands: [
        {
          command: 'marquee.link',
          args: [{ item }],
        },
      ],
    },
  })
}
