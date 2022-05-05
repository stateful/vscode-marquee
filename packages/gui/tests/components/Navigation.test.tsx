import React from 'react'
import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/react'
// @ts-expect-error mock import
import { GlobalProvider, setGlobalScope, theme } from '@vscode-marquee/utils'

import Navigation from '../../src/components/Navigation'
import { ThemeProvider } from '@mui/material/styles'

jest.mock('../../../utils/src/contexts/Global')
jest.mock('@vscode-marquee/widget-welcome', () => ({
  NavPop: () => <div>NavPop</div>,
}))
jest.mock('../../src/components/ModeSelector', () => () => (
  <div>ModeSelector</div>
))
jest.mock('../../src/dialogs/FeedbackDialog', () => () => (
  <div>FeedbackDialog</div>
))
jest.mock('../../src/dialogs/ThemeDialog', () => () => <div>ThemeDialog</div>)
jest.mock('../../src/dialogs/InfoDialog', () => () => <div>InfoDialog</div>)
jest.mock('../../src/dialogs/SettingsDialog', () => () => (
  <div>SettingsDialog</div>
))

test('renders component correctly', async () => {
  render(
    <GlobalProvider>
      <ThemeProvider theme={theme}>
        <Navigation />
      </ThemeProvider>
    </GlobalProvider>
  )
  expect(screen.getByText('some name')).toBeInTheDocument()
  expect(screen.getAllByText('ModeSelector')).toHaveLength(2)
  expect(screen.queryByText('InfoDialog')).not.toBeInTheDocument()
  expect(screen.queryByText('John Doe')).not.toBeInTheDocument()
  expect(screen.queryByText('SettingsDialog')).not.toBeInTheDocument()
  expect(screen.queryByText('ThemeDialog')).not.toBeInTheDocument()
  expect(screen.queryByText('InfoDialog')).not.toBeInTheDocument()

  await userEvent.click(screen.getByText('some name'))
  const input = screen.getByPlaceholderText('Type...')
  await userEvent.type(input, 'John Doe')
  await userEvent.click(input.parentElement?.querySelector('button')!)
  expect(screen.getByText('some nameJohn Doe')).toBeInTheDocument()

  await userEvent.click(screen.getByTestId('navigation-toggle-global-scope'))

  // userEvent.click(
  //   screen.getByText('Toggle Global vs Workspace Scope (Workspace Scope)')
  // )
  expect(setGlobalScope).toBeCalledTimes(1)

  await userEvent.click(screen.getByLabelText('Open Settings'))
  expect(screen.getByText('SettingsDialog')).toBeInTheDocument()
  await userEvent.click(screen.getByLabelText('Switch Theme'))
  expect(screen.getByText('ThemeDialog')).toBeInTheDocument()
  await userEvent.click(screen.getByLabelText('Show Info'))
  expect(screen.getByText('InfoDialog')).toBeInTheDocument()
  await userEvent.click(screen.getByLabelText('Send Feedback'))
  expect(screen.getByText('FeedbackDialog')).toBeInTheDocument()
})
