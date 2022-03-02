import type { ContextProperties } from "@vscode-marquee/utils";
import type { vscLanguages } from './constants';
import SnippetModel from './models/Snippet';

export type VSCLanguages = keyof typeof vscLanguages;
export type Snippet = SnippetModel;

export interface SnippetTreeItem {
  item: Snippet
  isTreeItem: boolean
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
    snippet: Pick<Snippet, 'title' | 'body'>,
    isWorkspaceTodo: boolean
  ) => string
  _removeSnippet: (id: string) => void
  _updateSnippet: (snippet: any) => void
}
