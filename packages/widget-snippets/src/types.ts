import type { vscLanguages } from './constants';

export type VSCLanguages = keyof typeof vscLanguages;
export interface Language {
  name: string
  value: VSCLanguages
}

export interface Snippet {
  archived: boolean
  title: string
  body: string
  createdAt: number
  id: string
  origin?: string
  path: string
  exists?: boolean
  language: Language
  workspaceId?: string
}

export interface Context {
  snippets: Snippet[]
  snippetFilter: string
  snippetSelected: string
  snippetSplitter: number
  _addSnippet: (snippet: Partial<Snippet>, cb?: (id: string) => void) => void
  _removeSnippet: (id: string) => void
  _updateSnippet: (snippet: any) => void
  _setSnippets: (snippets: any[]) => void
  _updateSnippetFilter: (filter: string) => void
  _updateSnippetSelected: (selected: string) => void
  _updateSnippetSplitter: (splitter: number) => void

  showAddDialog: boolean
  setShowAddDialog: (show: boolean) => void
  showEditDialog?: string
  setShowEditDialog: (id?: string) => void
}
