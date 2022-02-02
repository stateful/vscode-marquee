import type { ContextProperties } from "@vscode-marquee/utils";
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
  path?: string
  exists?: boolean
  language: Language
  workspaceId: string | null
}

export interface State {
  snippets: Snippet[]
  snippetFilter: string
  snippetSelected: string
  snippetSplitter?: number
}

export interface Context extends ContextProperties<State> {
  _addSnippet: (
    snippet: Pick<Snippet, 'title' | 'body' | 'language'>,
    isWorkspaceTodo: boolean
  ) => string
  _removeSnippet: (id: string) => void
  _updateSnippet: (snippet: any) => void

  showAddDialog: boolean
  setShowAddDialog: (show: boolean) => void
  showEditDialog?: string
  setShowEditDialog: (id?: string) => void
}
