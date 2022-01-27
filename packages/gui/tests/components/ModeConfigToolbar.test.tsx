import React from 'react';
import userEvent from '@testing-library/user-event';
import { render } from '@testing-library/react';
import ModeConfigToolbar from '../../src/components/ModeConfigToolbar';

jest.mock('../../src/components/ModeMorePop', () => (
  () => <div>ModeMorePop</div>
));
jest.mock('../../src/dialogs/ModeAddDialog', () => (
  () => <div>ModeAddDialog</div>
));

test('should render component correctly', () => {
  const { getByText } = render(<ModeConfigToolbar />);
  userEvent.click(getByText('Add new mode'));
  expect(getByText('ModeAddDialog')).toBeTruthy();
});
