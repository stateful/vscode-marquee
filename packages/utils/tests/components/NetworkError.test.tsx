import React from 'react'
import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/react'

import { NetworkError } from '../../src'

declare const window: {
  vscode: any
}

test('should render the component with message pro', () => {
  render(<NetworkError message="foobar" />)
  expect(screen.getByText('Error fetching data!')).toBeInTheDocument()
  expect(screen.getByText('foobar')).toBeInTheDocument()
})

test('should render the component with default prop', () => {
  window.vscode = { postMessage: jest.fn() }
  render(<NetworkError />)
  userEvent.click(screen.getByText('Marquee settings'))
  expect(window.vscode.postMessage).toBeCalledWith({
    west: { execCommands: [{
      command: 'workbench.action.openSettings',
      args: ['Marquee']
    }],
    }})
})
