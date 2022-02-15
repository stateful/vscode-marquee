import React from 'react';
import userEvent from '@testing-library/user-event';
import { render } from '@testing-library/react';
import ModeMorePop from '../../src/components/ModeMorePop';

test('should render component correcty', () => {
  const { getByLabelText, getByText } = render(
    <ModeMorePop />
  );
  userEvent.click(getByLabelText('More'));
  userEvent.click(getByText('Reset to factory defaults'));
  // expect(_resetModes).toBeCalledTimes(1);
});
