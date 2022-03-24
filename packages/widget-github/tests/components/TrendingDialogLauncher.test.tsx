import React from 'react'
import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/react'

import { TrendProvider } from "../../src/Context"
import TrendingDialogLauncher from '../../src/components/TrendingDialog'

const fetchOrig = window.fetch
beforeEach(() => {
  window.fetch = jest.fn().mockResolvedValue({
    ok: 1,
    json: () => []
  })
})

test.only('renders component correctly', async () => {
  const { container } = render(
    <TrendProvider>
      <TrendingDialogLauncher />
    </TrendProvider>
  )
  userEvent.click(container.querySelector('button')!)
  expect(screen.getAllByText('Selection...')).toHaveLength(2)
  expect(screen.getByText('Since...')).toBeInTheDocument()
})

afterAll(() => {
  window.fetch = fetchOrig
})
