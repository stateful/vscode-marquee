import React from 'react'
import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/react'
import ModeConfigToolbar from '../../src/components/ModeConfigToolbar'

jest.mock('../../src/components/ModeMorePop', () => (
  () => <div>ModeMorePop</div>
))
jest.mock('../../src/dialogs/ModeAddDialog', () => (
  () => <div>ModeAddDialog</div>
))

test('should render component correctly', () => {
  render(<ModeConfigToolbar />)
  userEvent.click(screen.getByText('Add new mode'))
  expect(screen.getByText('ModeAddDialog')).toBeInTheDocument()
})
