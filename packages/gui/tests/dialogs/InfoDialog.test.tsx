import React from 'react'
import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/react'

import InfoDialog from '../../src/dialogs/InfoDialog'

jest.mock('../../src/img/powered_by_google_on_non_white.png', () => {})
jest.mock('../../src/img/powered_by_google_on_white.png', () => {})

test('should render component properly', async () => {
  const close = jest.fn()
  render(<InfoDialog close={close} />)
  await userEvent.click(screen.getByText('Close'))
  expect(close).toBeCalledTimes(1)
  expect(screen.getByText('GitHub Repository'))
    .toBeInTheDocument()
})
