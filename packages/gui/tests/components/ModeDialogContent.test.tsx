import React from 'react';
import userEvent from '@testing-library/user-event';
import { render } from '@testing-library/react';
import ModeDialogContent from '../../src/components/ModeDialogContent';

jest.mock('../../src/components/ModeConfigToolbar', () => (
  () => <div>ModeConfigToolbar</div>
));
jest.mock('../../src/components/ModeTabPop', () => (
  () => <div>ModeTabPop</div>
));

test('should render component correctly', () => {
  const { getAllByLabelText, getByText } = render(
    <ModeDialogContent />
  );

  expect(getByText('Mailbox')).toBeTruthy();
  expect(getByText('News')).toBeTruthy();
  expect(getByText('Github')).toBeTruthy();
  expect(getByText('Todo')).toBeTruthy();
  expect(getByText('Weather')).toBeTruthy();
  expect(getByText('Projects')).toBeTruthy();
  expect(getByText('Snippets')).toBeTruthy();
  expect(getByText('Notes')).toBeTruthy();

  userEvent.click(getAllByLabelText('Enable/Disable Github Widget')[0]);
  // expect(_setModeWidget).toBeCalledWith('default', 'github', false);
  userEvent.click(getAllByLabelText('Enable/Disable Github Widget')[1]);
  // expect(_setModeWidget).toBeCalledTimes(2);
});
