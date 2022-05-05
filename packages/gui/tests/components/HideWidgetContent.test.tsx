import React from 'react'
import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/react'

// @ts-expect-error mock import
import { ModeProvider, _removeModeWidget } from '../../src/contexts/ModeContext'
import HideWidgetContent from '../../src/components/HideWidgetContent'

jest.mock('../../src/contexts/ModeContext')
jest.mock('../../src/dialogs/SettingsDialog', () => (
  () => <div>SettingsDialog</div>
))

test('should render component correctly', async () => {
  const { container } = render(
    <ModeProvider>
      <HideWidgetContent name="foobar" />
    </ModeProvider>
  )

  expect(_removeModeWidget).toBeCalledTimes(0)
  await userEvent.click(screen.getByText('Hide this widget'))
  expect(_removeModeWidget).toBeCalledWith('foobar')

  await userEvent.click(container.querySelector('svg')!)
  expect(screen.getByText('SettingsDialog')).toBeInTheDocument()
})
