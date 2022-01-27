import React from 'react';
import userEvent from '@testing-library/user-event';
import { render } from '@testing-library/react';

// @ts-expect-error mock import
import { ModeProvider, _duplicateMode } from '../../src/contexts/ModeContext';
import { ModeEditDialog } from '../../src/dialogs/ModeEditDialog';

jest.mock('../../src/contexts/ModeContext');

test('should render component', () => {
  const close = jest.fn();
  const { getByText } = render(<ModeProvider>
    <ModeEditDialog _close={close} name="default" />
  </ModeProvider>);
  userEvent.click(getByText('Add'));
  expect(_duplicateMode).toBeCalledWith('default', 'default', undefined);
});
