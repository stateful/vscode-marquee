import React from 'react'

const SnippetProviderImport = jest.requireActual('../../../src/Context')

export const SnippetContext = SnippetProviderImport.default
export const SnippetProvider = ({ children }: any) => (
  <SnippetProviderImport.default.Provider value={{
    snippets: []
  } as any}>
    {children}
  </SnippetProviderImport.default.Provider>
)
export default {
  name: 'clipboard',
  icon: <div>ClipboardIcon</div>,
  tags: ['productivity', 'workflow', 'search', 'organize'],
  description:
    'Create or extract clipboards items then edit, organize and insert them directly into code.',
  component: () => <div>Clipboard Widget</div>,
}
