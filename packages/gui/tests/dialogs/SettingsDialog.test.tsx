import React from 'react'
import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/react'

import SettingsDialog from '../../src/dialogs/SettingsDialog'
import { GlobalProvider } from '@vscode-marquee/utils'

declare const window: {
  vscode: any
}

jest.mock('../../../utils/src/contexts/Global')

jest.mock('../../src/components/ModeDialogContent', () => (
  () => (<div>ModeDialogContent</div>)
))

test('renders ModeDialogContent component properly', () => {
  const close = jest.fn()
  render(<GlobalProvider><SettingsDialog close={close} /></GlobalProvider>)
  expect(screen.getByText('ModeDialogContent')).toBeInTheDocument()
})

test('switches to import/export settings', async () => {
  window.vscode = { postMessage: jest.fn() }

  const close = jest.fn()
  render(
    <GlobalProvider>
      <SettingsDialog close={close} />
    </GlobalProvider>
  )
  await userEvent.click(screen.getByText('Import / Export'))
  expect(screen.queryByText('ModeDialogContent')).not.toBeInTheDocument()

  await userEvent.click(screen.getByText('Import'))
  expect(window.vscode.postMessage).toBeCalledWith({
    west: { execCommands: [{ command: 'marquee.jsonImport' }] }
  })

  await userEvent.click(screen.getByText('Export'))
  expect(window.vscode.postMessage).toBeCalledWith({
    west: { execCommands: [{ command: 'marquee.jsonExport' }] }
  })

  expect(close).toBeCalledTimes(2)
})

test('should open Marquee settings in VS Code preference view', async () => {
  window.vscode = { postMessage: jest.fn() }

  const close = jest.fn()
  render(
    <GlobalProvider>
      <SettingsDialog close={close} />
    </GlobalProvider>
  )

  await userEvent.click(screen.getByText('Marquee Settings'))
  expect(window.vscode.postMessage).toBeCalledWith({
    west: { execCommands: [{
      command: 'workbench.action.openSettings',
      args: ['@ext:stateful.marquee']
    }] }
  })
})
