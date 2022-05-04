import React from 'react'
import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/react'

// @ts-expect-error mock import
import { ModeProvider, _addMode } from '../../src/contexts/ModeContext'
import ModeAddDialog from '../../src/dialogs/ModeAddDialog'

jest.mock('../../src/contexts/ModeContext')

test('should render component', async () => {
  const close = jest.fn()
  render(<ModeProvider>
    <ModeAddDialog close={close} />
  </ModeProvider>)
  await userEvent.keyboard('foobar')
  expect(_addMode).toBeCalledTimes(0)
  await userEvent.click(screen.getByText('Add'))
  expect(_addMode).toBeCalledWith('foobar', null)
  expect(close).toBeCalledTimes(1)
})
