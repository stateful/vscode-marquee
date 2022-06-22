import type { ContextProperties } from '@vscode-marquee/utils'

export interface Todo {
  body: string
  checked: boolean
  id: string
  archived: boolean
  workspaceId: string | null
  tags: string[]
  origin?: string
  path?: string
}

export interface State {
  todos: Todo[]
}

export interface Configuration {
  todoFilter?: string
  hide: boolean
  showArchived: boolean
  autoDetect: boolean
}

export interface ContextValues extends Configuration, State {
  showAddDialog: boolean
  showEditDialog?: string
  showCloudSyncFeature: boolean
}

export interface Events {
  openAddTodoDialog: boolean
  openEditTodoDialog?: string
  openCloudSyncFeatureInterest: boolean
}

export interface Context extends Omit<ContextProperties<ContextValues>, 'setActiveWorkspaceId'> {
  _resetTodos: () => void
  _addTodo: (body: string, tags: string[], isWorkspaceTodo: boolean) => void
  _removeTodo: (id: string) => void
  _updateTodo: (todo: Todo) => void
  _isInterestedInSyncFeature: (interested: boolean) => void
}
