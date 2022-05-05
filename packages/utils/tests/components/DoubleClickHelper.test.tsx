import React from 'react'
import { render, screen } from '@testing-library/react'

import { DoubleClickHelper } from '../../src'

test('should show no options', () => {
  render(<DoubleClickHelper content="foobar" />)
  expect(screen.getByLabelText('foobar')).toBeInTheDocument()
})
