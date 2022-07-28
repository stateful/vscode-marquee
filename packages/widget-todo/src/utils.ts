import type { MarqueeWindow } from '@vscode-marquee/utils'
import { Todo } from './types'

declare const window: MarqueeWindow

interface FilterParams {
  globalScope?: boolean
  hide?: boolean
  todoFilter?: string
  showArchived?: boolean
}
export function filterItems (todos: Todo[], params: FilterParams) {
  let filteredItems = todos

  if (!params.globalScope) {
    filteredItems = filteredItems.filter((item) => {
      if (item['workspaceId'] === window.activeWorkspace?.id) {
        return true
      }
    })
  }

  if (!params.showArchived) {
    filteredItems = filteredItems.filter((item) => {
      if (!item.hasOwnProperty('archived') || item.archived === false) {
        return true
      }
    })
  }

  if (params.todoFilter) {
    filteredItems = filteredItems.filter((item) => {
      let inBody = item.body
        .toLowerCase()
        .indexOf(params.todoFilter!.toLowerCase()) !== -1
      let inTags = false

      if (item.tags && item.tags.length !== 0) {
        inTags =
          JSON.stringify(item.tags)
            .toLowerCase()
            .indexOf(params.todoFilter!.toLowerCase()) !== -1
      }

      if (inBody || inTags) {
        return true
      }
    })
  }

  if (params.hide) {
    filteredItems = filteredItems.filter((item) => {
      return item.checked === false
    })
  }

  return filteredItems
}
