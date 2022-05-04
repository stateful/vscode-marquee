import React from 'react'
import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/react'

// @ts-expect-error mock import
import { ModeProvider, _duplicateMode } from '../../src/contexts/ModeContext'
import { ModeEditDialog } from '../../src/dialogs/ModeEditDialog'

jest.mock('../../src/contexts/ModeContext')

test('should render component', async () => {
  const close = jest.fn()
  render(<ModeProvider>
    <ModeEditDialog onClose={close} name="default" />
  </ModeProvider>)
  await userEvent.click(screen.getByText('Add'))
  expect(_duplicateMode).toBeCalledWith('default', 'default', undefined)
})
