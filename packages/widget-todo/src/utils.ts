import type { MarqueeWindow } from '@vscode-marquee/utils'
import { Todo } from './types'

const marqueeWindow: MarqueeWindow = window as any

interface FilterParams {
  globalScope?: boolean
  hide?: boolean
  todoFilter?: string
  showArchived?: boolean
  showBranched?: boolean
  branch?: string
}
export function filterItems (todos: Todo[], params: FilterParams) {
  let filteredItems = todos
  const workspaceId = marqueeWindow.activeWorkspace?.id || ''

  if (!params.globalScope) {
    filteredItems = filteredItems.filter((item) => {
      if (item['workspaceId'] === marqueeWindow.activeWorkspace?.id) {
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

  if (params.showBranched && params.branch) {
    filteredItems = filteredItems.filter((item) => {
      if (!item.hasOwnProperty('branch') || item.branch === `${workspaceId}#${params.branch}`) {
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

export const transformPathToLink = (todo: Todo) => {
  try {
    // transform
    // -> git@github.com/foo/bar.git#main
    // to
    // -> https://github.com/foo/bar/blob/adcbe2a5c0428783fe9d6b50a1d2e39cbbe2def6/some/file#L3
    const [path, line] = todo.origin!.split(':')
    const u = new window.URL(`https://${todo.gitUri!
      .replace(':', '/')
      .split('@')
      .pop()!
    }`)
    const rPath = path.replace(marqueeWindow.activeWorkspace!.path, '')
    return `${u.origin}${u.pathname.replace(/\.git$/, '')}/blob/${todo.commit}${rPath}#L${parseInt(line, 10) + 1}`
  } catch (err: any) {
    console.warn(`Couldn't construct remote url: ${(err as Error).message}`)
    return undefined
  }
}
