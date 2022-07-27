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
  expect(screen.getByText('Create a Note')).toBeInTheDocument()
  await userEvent.click(screen.getByText('Create a Note'))

  expect(screen.getByText('Add Note')).toBeInTheDocument()
  expect(screen.getByPlaceholderText('Title of Note')).toBeInTheDocument()
  expect(container.querySelector('.ql-editor')).toBeTruthy()

  await userEvent.type(screen.getByPlaceholderText('Title of Note'), 'o')
  await userEvent.type(container.querySelector('.noteEditorContainer-add')!, 'baaar{enter}')

  await userEvent.click(screen.getByText('Add to Workspace'))
  expect(providerValues.setNotes).toBeCalledTimes(1)
  expect(providerValues.setNoteSelected).toBeCalledTimes(1)
})
