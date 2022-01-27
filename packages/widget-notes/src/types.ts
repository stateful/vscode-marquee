export interface Note {
  id: string
  workspaceId: string
  title: string
  body: string
  language: string
  text: string
}

export interface IContext {
  notes: Note[]
  noteFilter: string
  noteSelected: string
  noteSplitter: number
  _addNote: (note: Partial<Note>, cb?: (id: string) => void) => void
  _removeNote: (id: string) => void
  _updateNote: (note: Note) => void
  _setNotes: (notes: Note[]) => void
  _updateNoteFilter: (filter: string) => void
  _updateNoteSelected: (selected: string) => void
  _updateNoteSplitter: (splitter: number) => void

  showAddDialog: boolean
  setShowAddDialog: (show: boolean) => void
  showEditDialog?: string
  setShowEditDialog: (id?: string) => void
}
