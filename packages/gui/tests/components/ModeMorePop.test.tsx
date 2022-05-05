import React from 'react'
import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/react'
// @ts-expect-error mock import
import { ModeProvider, _resetModes } from '../../src/contexts/ModeContext'
import ModeMorePop from '../../src/components/ModeMorePop'

jest.mock('../../src/contexts/ModeContext')

test('should render component correcty', async () => {
  render(
    <ModeProvider>
      <ModeMorePop />
    </ModeProvider>
  )
  await userEvent.click(screen.getByLabelText('More'))
  await userEvent.click(screen.getByText('Reset to factory defaults'))
  expect(_resetModes).toBeCalledTimes(1)
})
