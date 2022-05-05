import React from 'react'
import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/react'

import HidePop from '../src/HidePop'

jest.mock('../src/HideWidgetContent', () => ({ name }: any) => <div>{name}</div>)

test('should propagate name', async () => {
  const { container } = render(<HidePop name="foobar" />)
  await userEvent.click(container.querySelector('button')!)
  expect(screen.getByText('foobar')).toBeInTheDocument()
})
