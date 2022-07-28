import React from 'react'
import userEvent from '@testing-library/user-event'
// @ts-expect-error mock feature
import { GlobalProvider, connect, setGlobalScope } from '@vscode-marquee/utils'
import { render, screen } from '@testing-library/react'

import { TodoProvider } from '../src/Context'
import Widget from '../src'

describe('Todo Widget', () => {
  it('should render no notification if there are no todos', () => {
    (connect as jest.Mock).mockReturnValue({
      todos: [],
      globalScope: false
    })

    render(
      <GlobalProvider>
        <TodoProvider>
          <Widget.component />
        </TodoProvider>
      </GlobalProvider>
    )

    expect(screen.queryByTestId('noteExistanceNotif')).not.toBeInTheDocument()
  })

  it('should render notification when in workspace scope', async () => {
    (connect as jest.Mock).mockReturnValue({
      todos: [{ id: 123 }],
      globalScope: false
    })

    render(
      <GlobalProvider>
        <TodoProvider>
          <Widget.component />
        </TodoProvider>
      </GlobalProvider>
    )

    expect(screen.getByTestId('noteExistanceNotif')).toBeInTheDocument()
    expect(screen.getByText('There is todo in Global Scope.'))
      .toBeInTheDocument()

    expect(setGlobalScope).toBeCalledTimes(0)
    await userEvent.click(screen.getByText('Switch to Global Scope'))
    expect(setGlobalScope).toBeCalledWith(true)
  })

  it('should render notification when in workspace scope with multiple todos', () => {
    (connect as jest.Mock).mockReturnValue({
      todos: [{ id: 123 }, { id: 321 }],
      globalScope: false
    })

    render(
      <GlobalProvider>
        <TodoProvider>
          <Widget.component />
        </TodoProvider>
      </GlobalProvider>
    )
    expect(screen.getByText('There are todos in Global Scope.'))
      .toBeInTheDocument()
  })

  it('should render notification when in filter is set', async () => {
    const setTodoFilter = jest.fn()
    ;(connect as jest.Mock).mockReturnValue({
      todos: [{ id: 123 }, { id: 321 }],
      globalScope: false,
      todoFilter: 'foobar',
      setTodoFilter
    })

    render(
      <GlobalProvider>
        <TodoProvider>
          <Widget.component />
        </TodoProvider>
      </GlobalProvider>
    )
    expect(setTodoFilter).toBeCalledTimes(0)
    expect(screen.getByText('No Todos found, seems you have a filter set.'))
      .toBeInTheDocument()
    await userEvent.click(screen.getByText('Clear Filter'))
    expect(setTodoFilter).toBeCalledWith('')
  })
})
