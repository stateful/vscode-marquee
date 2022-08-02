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

export interface State {
  markdownDocuments: MarkdownDocument[]
  markdownDocumentSelected: MarkdownDocument['id'] | null
  selectedMarkdownContent: string | null
}

export interface Context extends ContextProperties<State & Configuration> {}
