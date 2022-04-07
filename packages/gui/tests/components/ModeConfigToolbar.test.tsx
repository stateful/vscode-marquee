import React from 'react'
import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/react'
import ModeConfigToolbar from '../../src/components/ModeConfigToolbar'
import { theme } from '@vscode-marquee/utils'
import { ThemeProvider } from '@mui/system'

jest.mock('../../src/components/ModeMorePop', () => () => (
  <div>ModeMorePop</div>
))
jest.mock('../../src/dialogs/ModeAddDialog', () => () => (
  <div>ModeAddDialog</div>
))

test('should render component correctly', () => {
  render(
    <ThemeProvider theme={theme}>
      <ModeConfigToolbar />
    </ThemeProvider>
  )
  userEvent.click(screen.getByText('Add new mode'))
  expect(screen.getByText('ModeAddDialog')).toBeInTheDocument()
})
