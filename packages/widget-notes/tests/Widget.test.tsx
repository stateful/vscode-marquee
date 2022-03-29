import React from 'react'
import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/react'
// @ts-expect-error
import { GlobalProvider, providerValues } from '@vscode-marquee/utils'

import Widget from '../src'
import { NoteProvider } from '../src/Context'


test('renders component correctly', async () => {
  const { container } = render(
    <GlobalProvider>
      <NoteProvider>
        <Widget.component />
      </NoteProvider>
    </GlobalProvider>
  )
  expect(screen.queryByText('Add Note')).not.toBeInTheDocument()
  expect(screen.getByText('Create a note')).toBeInTheDocument()
  userEvent.click(screen.getByText('Create a note'))

  expect(screen.getByText('Add Note')).toBeInTheDocument()
  expect(screen.getByPlaceholderText('Title of Note')).toBeInTheDocument()
  expect(container.querySelector('.ql-editor')).toBeTruthy()

  userEvent.type(screen.getByPlaceholderText('Title of Note'), 'o')
  userEvent.type(container.querySelector('.noteEditorContainer-add')!, 'baaar{enter}')

  userEvent.click(screen.getByText('Add to Workspace'))
  expect(providerValues.setNotes).toBeCalledTimes(1)
  expect(providerValues.setNoteSelected).toBeCalledTimes(1)
})
