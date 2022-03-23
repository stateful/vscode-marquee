import React from 'react';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';

import { BetterComplete } from '../../src';

const options = [
  { value: 'barfooloo' },
  { value: 'foobarloo' }
];

test('should show no options', () => {
  const { container } = render(<BetterComplete
    id="foobar"
    field="foobarField"
    label="foobarLabel"
    variant='outlined'
    options={options}
    value="foo"
    display='value'
    getOptionSelected={jest.fn()}
    onChange={jest.fn()}
  />);
  userEvent.type(container.querySelector('input')!, 'lol');
  expect(screen.getByText('No options')).toBeInTheDocument();
});

test('should show options', () => {
  const { container } = render(<BetterComplete
    id="foobar"
    field="foobarField"
    label="foobarLabel"
    variant='outlined'
    options={options}
    value="foo"
    display='value'
    getOptionSelected={jest.fn()}
    onChange={jest.fn()}
  />);
  userEvent.type(container.querySelector('input')!, 'foo');
  expect(screen.queryByText('No options')).not.toBeInTheDocument();
  expect(screen.getByText('barfooloo')).toBeInTheDocument();
  expect(screen.getByText('foobarloo')).toBeInTheDocument();
});
