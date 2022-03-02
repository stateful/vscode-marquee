import type { ContextProperties } from "@vscode-marquee/utils";
import type { vscLanguages } from './constants';

export type VSCLanguages = keyof typeof vscLanguages;
export interface Language {
  name: string
  value: VSCLanguages
}

export interface SnippetTreeItem {
  item: Snippet
  isTreeItem: boolean
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

export interface Selection {
  label: string
  snippet: Snippet
}

export interface State {
  snippets: Snippet[]
  snippetFilter: string
  snippetSelected: string
  snippetSplitter?: number
}

export interface Events {
  openSnippet: string
  selectSnippet: string
  addSnippet: Snippet
  addNote: Pick<Snippet, keyof Snippet>
}

export interface Context extends ContextProperties<State> {
  _addSnippet: (
    snippet: Pick<Snippet, 'title' | 'body' | 'language'>,
    isWorkspaceTodo: boolean
  ) => string
  _removeSnippet: (id: string) => void
  _updateSnippet: (snippet: any) => void
}
