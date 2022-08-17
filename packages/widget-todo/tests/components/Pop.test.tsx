import React from 'react'
import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/react'
import { GlobalProvider, connect } from '@vscode-marquee/utils'

import Pop from '../../src/components/Pop'
import { TodoProvider } from '../../src/Context'

test('renders component correctly', async () => {
  const setAutoDetect = jest.fn()
  const setHide = jest.fn()
  const setShowArchived = jest.fn()

  ;(connect as jest.Mock).mockReturnValue({
    todos: [{ id: 123 }],
    setAutoDetect,
    setHide,
    setShowArchived
  })

  render(
    <GlobalProvider>
      <TodoProvider>
        <Pop />
      </TodoProvider>
    </GlobalProvider>
  )

  await userEvent.click(screen.getByLabelText('widget-settings'))
  expect(screen.getByText('Auto-detect TODOs')).toBeInTheDocument()
  expect(screen.getByText('Hide completed')).toBeInTheDocument()
  expect(screen.getByText('Show archived')).toBeInTheDocument()
  expect(screen.queryByText('Show from same branch ()')).not.toBeInTheDocument()

  await userEvent.click(
    screen.getByLabelText('Auto-detect TODOs')
      .querySelector('input')!
  )
  expect(setAutoDetect).toBeCalledTimes(1)

  await userEvent.click(
    screen.getByLabelText('Hide completed')
      .querySelector('input')!
  )
  expect(setHide).toBeCalledTimes(1)

  await userEvent.click(
    screen.getByLabelText('Show archived')
      .querySelector('input')!
  )
  expect(setShowArchived).toBeCalledTimes(1)
})

test('renders branch filter if todos have a branch', async () => {
  const setShowBranched = jest.fn()
  ;(connect as jest.Mock).mockReturnValue({
    todos: [{ id: 123, branch: 'main' }],
    branch: 'main',
    setShowBranched
  })

  render(
    <GlobalProvider>
      <TodoProvider>
        <Pop />
      </TodoProvider>
    </GlobalProvider>
  )

  await userEvent.click(screen.getByLabelText('widget-settings'))
  expect(screen.getByText('Show from same branch ()')).toBeInTheDocument()

  await userEvent.click(
    screen.getByLabelText('Show branched')
      .querySelector('input')!
  )
  expect(setShowBranched).toBeCalledTimes(1)
})
