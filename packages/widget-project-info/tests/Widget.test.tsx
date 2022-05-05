// import React from 'react'
// import { render, screen } from '@testing-library/react'
// import Widget from '../src'
// import { getEventListener, GlobalProvider } from '@vscode-marquee/utils'
// import { MarkdownDocument, State } from '../src/types'
// import { WIDGET_ID } from '../src/Context'

// const widgetChannel = getEventListener<State>(WIDGET_ID)

// const { component: Component } = Widget

// const mockFileList = (fileList: MarkdownDocument[]) => {
//   widgetChannel.broadcast({
//     markdownDocuments: fileList,
//     markdownDocumentSelected: undefined,
//   })
//   return fileList
// }

// test('shows message when no markdown files is selected', async () => {
//   render(
//     <GlobalProvider>
//       <Component />
//     </GlobalProvider>
//   )

//   expect(screen.getByText('No document selected')).toBeInTheDocument()
// })

// xtest('lets user select file, then indicates selected and shows content', async () => {
//   const fileToSelect = { id: '1', name: 'stuff.md', content: 'content' }

//   render(
//     <GlobalProvider>
//       <Component />
//     </GlobalProvider>
//   )

//   mockFileList([fileToSelect, { id: '2', name: 'other.md', content: 'other' }])

//   await screen.findByText(fileToSelect.name, undefined, { timeout: 1000 })

// })
