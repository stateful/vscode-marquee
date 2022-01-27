export interface Todo {
  body: string
  checked: boolean
  id: string
  archived: boolean
  workspaceId: string | null
  tags: string[]
  exists?: boolean
  path?: string
}

export interface Context {
  todos: Todo[]
  todoFilter: string
  hide: boolean
  showArchived: boolean
  autoDetect: boolean
  activeWorkspaceId: string | null

  showAddDialog: boolean
  setShowAddDialog: (show: boolean) => void
  showEditDialog?: string
  setShowEditDialog: (id?: string) => void

  _resetTodos: () => void
  _addTodo: (body: string, tags?: string[]) => void
  _removeTodo: (id: string) => void
  _updateTodo: (todo: Todo) => void
  _setTodos: (todos: Todo[]) => void
  _updateHide: (hide: boolean) => void
  _updateFilter: (filter: string) => void
  _updateShowArchived: (archived: boolean) => void
  _updateAutoDetect: (autoDetect: boolean) => void
}
