import React from 'react'
import { render, screen } from '@testing-library/react'
import Widget from '../src'
import { GlobalProvider, connect } from '@vscode-marquee/utils'
import userEvent from '@testing-library/user-event'
const { component: Component } = Widget

const mockConnect = jest.mocked(connect)

test('shows message when no markdown files is selected', async () => {
  render(
    <GlobalProvider>
      <Component />
    </GlobalProvider>
  )

  expect(screen.getByText('No document selected')).toBeInTheDocument()
})

test('renders selected content', async () => {
  const content = 'Some markdown content'

  mockConnect.mockReturnValue({
    markdownDocuments: [],
    markdownDocumentSelected: undefined,
    selectedMarkdownContent: content,
  })

  render(
    <GlobalProvider>
      <Component />
    </GlobalProvider>
  )

  expect(await screen.findByText(content)).toBeInTheDocument()
})

test('renders all documents in overview', async () => {
  const mockedDocuments = [
    {
      id: 1,
      name: 'one.md',
      path: '/Users/user/two.md',
    },
    {
      id: 2,
      name: 'two.md',
      path: '/Users/user/two.md',
    },
  ]

  mockConnect.mockReturnValue({
    markdownDocuments: mockedDocuments,
    markdownDocumentSelected: undefined,
    selectedMarkdownContent: undefined,
  })

  render(
    <GlobalProvider>
      <Component />
    </GlobalProvider>
  )

  expect(await screen.findByText(mockedDocuments[0].name)).toBeInTheDocument()
  expect(await screen.findByText(mockedDocuments[1].name)).toBeInTheDocument()
})

test('signals document selected', async () => {

  const documentToSelect = {
    id: 1,
    name: 'one.md',
    path: '/Users/user/two.md',
  }

  const setMarkdownDocumentSelected = jest.fn()

  mockConnect.mockReturnValue({
    markdownDocuments: [
      documentToSelect,
      {
        id: 2,
        name: 'two.md',
        path: '/Users/user/two.md',
      },
    ],
    markdownDocumentSelected: undefined,
    selectedMarkdownContent: undefined,
    setMarkdownDocumentSelected
  })

  render(
    <GlobalProvider>
      <Component />
    </GlobalProvider>
  )

  const fileName = screen.getByText(documentToSelect.name)
  await userEvent.click(fileName)
  expect(setMarkdownDocumentSelected).toHaveBeenCalledWith(1)
})
