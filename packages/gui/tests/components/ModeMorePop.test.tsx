import React from 'react'
import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/react'
// @ts-expect-error mock import
import { ModeProvider, _resetModes } from '../../src/contexts/ModeContext'
import ModeMorePop from '../../src/components/ModeMorePop'

jest.mock('../../src/contexts/ModeContext')

test('should render component correcty', () => {
  render(
    <ModeProvider>
      <ModeMorePop />
    </ModeProvider>
  )
  userEvent.click(screen.getByLabelText('More'))
  userEvent.click(screen.getByText('Reset to factory defaults'))
  expect(_resetModes).toBeCalledTimes(1)
})
