import type { MarqueeWindow } from '../types'

declare const window: MarqueeWindow

/**
 * open the reference of a project item
 * @param item project item (note/snippet/todo)
 * @param w    window object (for testing purposes only)
 */
export const jumpTo = (item: any, w = window) => {
  w.vscode.postMessage({
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
