import React from 'react';
import userEvent from '@testing-library/user-event';
import { render } from '@testing-library/react';

import ModeDialog from '../../src/dialogs/ModeDialog';

jest.mock('../../src/components/ModeDialogContent', () => (
  () => (<div>ModeDialogContent</div>)
));

test('should render component', () => {
  const close = jest.fn();
  const { getByText } = render(<ModeDialog close={close} />);
  userEvent.click(getByText('Close'));
  expect(close).toBeCalledTimes(1);
});
