import React from 'react'
import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/react'
// @ts-expect-error mock import
import { GlobalProvider, setGlobalScope } from '@vscode-marquee/utils'

import Navigation from '../../src/components/Navigation'

jest.mock('../../../utils/src/contexts/Global')
jest.mock('@vscode-marquee/widget-welcome', () => ({
  NavPop: () => <div>NavPop</div>
}))
jest.mock('../../src/components/ModeSelector', () => () => <div>ModeSelector</div>)
jest.mock('../../src/dialogs/FeedbackDialog', () => () => <div>FeedbackDialog</div>)
jest.mock('../../src/dialogs/ThemeDialog', () => () => <div>ThemeDialog</div>)
jest.mock('../../src/dialogs/InfoDialog', () => () => <div>InfoDialog</div>)
jest.mock('../../src/dialogs/SettingsDialog', () => () => <div>SettingsDialog</div>)

test('renders component correctly', () => {
  render(
    <GlobalProvider>
      <Navigation />
    </GlobalProvider>
  )
  expect(screen.getByText('some name')).toBeInTheDocument()
  expect(screen.getAllByText('ModeSelector')).toHaveLength(2)
  expect(screen.queryByText('InfoDialog')).not.toBeInTheDocument()
  expect(screen.queryByText('John Doe')).not.toBeInTheDocument()
  expect(screen.queryByText('SettingsDialog')).not.toBeInTheDocument()
  expect(screen.queryByText('ThemeDialog')).not.toBeInTheDocument()
  expect(screen.queryByText('InfoDialog')).not.toBeInTheDocument()

  userEvent.click(screen.getByText('some name'))
  const input = screen.getByPlaceholderText('Type...')
  userEvent.type(input, 'John Doe')
  // eslint-disable-next-line testing-library/no-node-access
  userEvent.click(input.parentElement?.querySelector('button')!)
  expect(screen.getByText('some nameJohn Doe')).toBeInTheDocument()

  userEvent.click(screen.getByTitle('Toggle Global vs Workspace Scope (Workspace Scope)'))
  expect(setGlobalScope).toBeCalledTimes(1)

  userEvent.click(screen.getByLabelText('Open Settings'))
  expect(screen.getByText('SettingsDialog')).toBeInTheDocument()
  userEvent.click(screen.getByLabelText('Switch Theme'))
  expect(screen.getByText('ThemeDialog')).toBeInTheDocument()
  userEvent.click(screen.getByLabelText('Show Info'))
  expect(screen.getByText('InfoDialog')).toBeInTheDocument()
  userEvent.click(screen.getByLabelText('Send Feedback'))
  expect(screen.getByText('FeedbackDialog')).toBeInTheDocument()
})
