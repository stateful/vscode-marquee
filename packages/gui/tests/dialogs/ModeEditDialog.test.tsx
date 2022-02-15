import React from 'react';
import userEvent from '@testing-library/user-event';
import { render } from '@testing-library/react';

import { ModeEditDialog } from '../../src/dialogs/ModeEditDialog';

test('should render component', () => {
  const close = jest.fn();
  const { getByText } = render(
    <ModeEditDialog _close={close} name="default" />
  );
  userEvent.click(getByText('Add'));
  // expect(_duplicateMode).toBeCalledWith('default', 'default', undefined);
});
