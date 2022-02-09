import type { ContextProperties } from "@vscode-marquee/utils";

export interface Note {
  id: string
  workspaceId: string | null
  title: string
  body: string
  text: string
}

export interface Events {
  openAddNoteDialog: boolean
  openEditNoteDialog?: string
  addSnippet: Pick<Note, keyof Note>
  addNote: Note
}

export interface State {
  notes: Note[]
  noteFilter: string
  noteSelected: string
  noteSplitter?: number
}

export interface Context extends ContextProperties<State> {
  _addNote: (
    note: Pick<Note, 'title' | 'body' | 'text'>,
    isWorkspaceTodo: boolean
  ) => string
  _removeNote: (id: string) => void
  _updateNote: (note: Note) => void

  showAddDialog: boolean
  setShowAddDialog: (show: boolean) => void
  showEditDialog?: string
  setShowEditDialog: (id?: string) => void
}
