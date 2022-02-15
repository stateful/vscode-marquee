import React from 'react';
import userEvent from '@testing-library/user-event';
import { render } from '@testing-library/react';

import ModeAddDialog from '../../src/dialogs/ModeAddDialog';

test('should render component', () => {
  const close = jest.fn();
  const { getByText } = render(
    <ModeAddDialog close={close} />
  );
  userEvent.keyboard('foobar');
  // expect(_addMode).toBeCalledTimes(0);
  userEvent.click(getByText('Add'));
  // expect(_addMode).toBeCalledWith('foobar', null);
  expect(close).toBeCalledTimes(1);
});
