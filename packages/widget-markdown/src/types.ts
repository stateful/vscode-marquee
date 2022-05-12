import type { ContextProperties } from '@vscode-marquee/utils'

export interface MarkdownDocument {
  id: string;
  name: string;
  path: string;
  content?: string;
}

export interface State {
  markdownDocuments: MarkdownDocument[];
  markdownDocumentSelected?: MarkdownDocument['id'];
}

export interface Context extends ContextProperties<State> {}
