import React from 'react';
import userEvent from '@testing-library/user-event';
import { render } from '@testing-library/react';

import { BetterComplete } from '../../src';

const options = [
  { value: 'barfooloo' },
  { value: 'foobarloo' }
];

test('should show no options', () => {
  const { getByText, container } = render(<BetterComplete
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
  expect(getByText('No options')).toBeTruthy();
});

test('should show options', () => {
  const { getByText, queryByText, container } = render(<BetterComplete
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
  expect(queryByText('No options')).not.toBeTruthy();
  expect(getByText('barfooloo')).toBeTruthy();
  expect(getByText('foobarloo')).toBeTruthy();
});
