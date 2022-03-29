import React from 'react'
import { render, screen } from '@testing-library/react'
import { ModeProvider } from '../../src/contexts/ModeContext'
import ModeTabPop from '../../src/components/ModeTabPop'

jest.mock('../../src/contexts/ModeContext')
jest.mock('../../src/dialogs/ModeEditDialog', () => ({
  ModeEditDialog: () => <div>ModeEditDialog</div>
}))

test('should render component correctly', async () => {
  render(
    <ModeProvider>
      <ModeTabPop name="work">
        <div>some foobar children</div>
      </ModeTabPop>
    </ModeProvider>
  )
  expect(screen.getByText('some foobar children')).toBeInTheDocument()
})
