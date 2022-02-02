import type { ContextProperties } from "@vscode-marquee/utils";

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

export interface State {
  todos: Todo[]
}

export interface Configuration {
  todoFilter: string
  hide: boolean
  showArchived: boolean
  autoDetect: boolean
}

export interface ContextValues extends Configuration, State {
  activeWorkspaceId: string | null
  showAddDialog: boolean
  showEditDialog?: string
}

export interface Context extends Omit<ContextProperties<ContextValues>, 'setActiveWorkspaceId'> {
  _resetTodos: () => void
  _addTodo: (body: string, tags?: string[]) => void
  _removeTodo: (id: string) => void
  _updateTodo: (todo: Todo) => void
}
