import type { ContextProperties } from '@vscode-marquee/utils'

export interface MarkdownDocument {
  id: string
  name: string
  path: string
  isRemote: boolean
}

export interface Configuration {
  externalMarkdownFiles: string[]
}

export interface WidgetEvents {
  markdownDocuments: MarkdownDocument[]
  markdownDocumentSelected?: MarkdownDocument['id']
}

export interface State {
  markdownDocumentSelected: string | null
}

export interface Context extends ContextProperties<State> {}
