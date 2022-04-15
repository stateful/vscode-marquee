import React from 'react'

const MarkdownProviderImport = jest.requireActual('../../../src/Context')

export const MarkdownContext = MarkdownProviderImport.default
export const MarkdownProvider = ({ children }: any) => (
  <MarkdownProviderImport.default.Provider
    value={
      {
        notes: [],
      } as any
    }
  >
    {children}
  </MarkdownProviderImport.default.Provider>
)

export default {
  name: 'markdown',
  icon: <div>Markdown Icon</div>,
  tags: ['organize'],
  description: 'markdown widget description',
  component: () => <div>Markdown Widget</div>,
}
