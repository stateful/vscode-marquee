import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { DialogTitle } from '../src'

test('should render title', () => {
  render(<DialogTitle>Foobar</DialogTitle>)
  expect(screen.getByText('Foobar')).toBeInTheDocument()
})

test('should render close button if prop set', async () => {
  const close = jest.fn()
  const { container } = render(<DialogTitle onClose={close}>Foobar</DialogTitle>)

  const closeBtn = container.querySelector('button')
  expect(closeBtn).toBeTruthy()

  expect(close).toBeCalledTimes(0)
  await userEvent.click(closeBtn!)
  expect(close).toBeCalledTimes(1)
})
