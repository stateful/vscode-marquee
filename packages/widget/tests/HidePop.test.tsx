import React from 'react'
import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/react'

import HidePop from '../src/HidePop'

jest.mock('../src/HideWidgetContent', () => ({ name }: any) => <div>{name}</div>)

test('should propagate name', () => {
  const { container } = render(<HidePop name="foobar" />)
  userEvent.click(container.querySelector('button')!)
  expect(screen.getByText('foobar')).toBeInTheDocument()
})
