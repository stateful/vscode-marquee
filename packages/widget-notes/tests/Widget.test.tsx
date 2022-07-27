import React from 'react'
import userEvent from '@testing-library/user-event'
// @ts-expect-error mock feature
import { GlobalProvider, connect, setGlobalScope } from '@vscode-marquee/utils'
import { render, screen } from '@testing-library/react'

import { NoteProvider } from '../src/Context'
import Widget from '../src'

describe('Notes Widget', () => {
  it('should render no notification if there are no notes', () => {
    (connect as jest.Mock).mockReturnValue({
      notes: [],
      globalScope: false
    })

    render(
      <GlobalProvider>
        <NoteProvider>
          <Widget.component />
        </NoteProvider>
      </GlobalProvider>
    )

    expect(screen.queryByTestId('noteExistanceNotif')).not.toBeInTheDocument()
  })

  it('should render notification when in workspace scope', async () => {
    (connect as jest.Mock).mockReturnValue({
      setNoteSelected: jest.fn(),
      notes: [{ id: 123 }],
      globalScope: false
    })

    render(
      <GlobalProvider>
        <NoteProvider>
          <Widget.component />
        </NoteProvider>
      </GlobalProvider>
    )

    expect(screen.getByTestId('noteExistanceNotif')).toBeInTheDocument()
    expect(screen.getByText('There is note in Global Scope.'))
      .toBeInTheDocument()

    expect(setGlobalScope).toBeCalledTimes(0)
    await userEvent.click(screen.getByText('Switch to Global Scope'))
    expect(setGlobalScope).toBeCalledWith(true)
  })

  it('should render notification when in workspace scope with multiple notes', () => {
    (connect as jest.Mock).mockReturnValue({
      setNoteSelected: jest.fn(),
      notes: [{ id: 123 }, { id: 321 }],
      globalScope: false
    })

    render(
      <GlobalProvider>
        <NoteProvider>
          <Widget.component />
        </NoteProvider>
      </GlobalProvider>
    )
    expect(screen.getByText('There are notes in Global Scope.'))
      .toBeInTheDocument()
  })

  it('should render notification when in filter is set', async () => {
    const setNoteFilter = jest.fn()
    ;(connect as jest.Mock).mockReturnValue({
      setNoteSelected: jest.fn(),
      notes: [{ id: 123 }, { id: 321 }],
      globalScope: false,
      noteFilter: 'foobar',
      setNoteFilter
    })

    render(
      <GlobalProvider>
        <NoteProvider>
          <Widget.component />
        </NoteProvider>
      </GlobalProvider>
    )
    expect(setNoteFilter).toBeCalledTimes(0)
    expect(screen.getByText('No Notes found, seems you have a filter set.'))
      .toBeInTheDocument()
    await userEvent.click(screen.getByText('Clear Filter'))
    expect(setNoteFilter).toBeCalledWith('')
  })
})
