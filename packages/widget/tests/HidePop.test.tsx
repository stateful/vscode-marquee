import React from 'react';
import userEvent from '@testing-library/user-event';
import { render } from '@testing-library/react';

import { HidePop } from '../src';

jest.mock('../src/components/HideWidgetContent', () => ({ name }: any) => <div>{name}</div>);

test('should propagate name', () => {
  const { getByText, container } = render(<HidePop name="foobar" />);
  userEvent.click(container.querySelector('button')!);
  expect(getByText('foobar')).toBeTruthy();
});
