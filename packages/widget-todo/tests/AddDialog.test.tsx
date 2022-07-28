import React from 'react'
import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/react'
import { GlobalProvider } from '@vscode-marquee/utils'

import Widget from '../src'
import { TodoProvider } from '../src/Context'

test('renders component correctly', async () => {
  render(
    <GlobalProvider>
      <TodoProvider>
        <Widget.component />
      </TodoProvider>
    </GlobalProvider>
  )
  expect(screen.getByText('Create a Todo')).toBeInTheDocument()
  await userEvent.click(screen.getByText('Create a Todo'))
  await userEvent.type(screen.getByPlaceholderText('Type your todo...'), 'Some Todo')
  await userEvent.click(screen.getByText('Add to Workspace'))
})
