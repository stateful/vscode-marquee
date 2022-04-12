import React from 'react'
import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/react'
// @ts-expect-error mock import
import { ModeProvider, _setModeWidget } from '../../src/contexts/ModeContext'
import ModeDialogContent from '../../src/components/ModeDialogContent'
import { ThemeProvider } from '@mui/material/styles'
import { theme } from '@vscode-marquee/utils'

jest.mock('../../src/contexts/ModeContext')
jest.mock('../../src/components/ModeConfigToolbar', () => () => (
  <div>ModeConfigToolbar</div>
))
jest.mock('../../src/components/ModeTabPop', () => () => <div>ModeTabPop</div>)

test('should render component correctly', () => {
  render(
    <ThemeProvider theme={theme}>
      <ModeProvider>
        <ModeDialogContent />
      </ModeProvider>
    </ThemeProvider>
  )

  expect(screen.getByText('Mailbox')).toBeInTheDocument()
  expect(screen.getByText('News')).toBeInTheDocument()
  expect(screen.getByText('Github')).toBeInTheDocument()
  expect(screen.getByText('Todo')).toBeInTheDocument()
  expect(screen.getByText('Weather')).toBeInTheDocument()
  expect(screen.getByText('Projects')).toBeInTheDocument()
  expect(screen.getByText('Snippets')).toBeInTheDocument()
  expect(screen.getByText('Notes')).toBeInTheDocument()

  userEvent.click(screen.getAllByLabelText('Enable/Disable Github Widget')[0])
  expect(_setModeWidget).toBeCalledWith('default', 'github', false)
  userEvent.click(screen.getAllByLabelText('Enable/Disable Github Widget')[1])
  expect(_setModeWidget).toBeCalledTimes(2)
})
