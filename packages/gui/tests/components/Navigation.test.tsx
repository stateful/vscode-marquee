import React from 'react';
import userEvent from '@testing-library/user-event';
import { render } from '@testing-library/react';
// @ts-expect-error mock import
import { PrefProvider, GlobalProvider, _updateGlobalScope } from '@vscode-marquee/utils';

import Navigation from '../../src/components/Navigation';

jest.mock('@vscode-marquee/widget-welcome', () => ({
  NavPop: () => <div>NavPop</div>
}));
jest.mock('../../src/components/ModeSelector', () => () => <div>ModeSelector</div>);
jest.mock('../../src/dialogs/FeedbackDialog', () => () => <div>FeedbackDialog</div>);
jest.mock('../../src/dialogs/ThemeDialog', () => () => <div>ThemeDialog</div>);
jest.mock('../../src/dialogs/InfoDialog', () => () => <div>InfoDialog</div>);
jest.mock('../../src/dialogs/SettingsDialog', () => () => <div>SettingsDialog</div>);

test('renders component correctly', () => {
  const { queryByText, getByText, getAllByText, getByPlaceholderText, getByTitle, getByLabelText } = render(
  <PrefProvider>
    <GlobalProvider>
      <Navigation />
    </GlobalProvider>
  </PrefProvider>);
  expect(getByText('some name')).toBeTruthy();
  expect(getAllByText('ModeSelector')).toHaveLength(2);
  expect(queryByText('InfoDialog')).not.toBeTruthy();
  expect(queryByText('John Doe')).not.toBeTruthy();
  expect(queryByText('SettingsDialog')).not.toBeTruthy();
  expect(queryByText('ThemeDialog')).not.toBeTruthy();
  expect(queryByText('InfoDialog')).not.toBeTruthy();

  userEvent.click(getByText('some name'));
  const input = getByPlaceholderText('Type...');
  userEvent.type(input, 'John Doe');
  userEvent.click(input.parentElement?.querySelector('button')!);
  expect(getByText('some nameJohn Doe')).toBeTruthy();

  userEvent.click(getByTitle('Toggle global vs workspace scope'));
  expect(_updateGlobalScope).toBeCalledTimes(1);

  userEvent.click(getByLabelText('Open Settings'));
  expect(getByText('SettingsDialog')).toBeTruthy();
  userEvent.click(getByLabelText('Switch Theme'));
  expect(getByText('ThemeDialog')).toBeTruthy();
  userEvent.click(getByLabelText('Show Info'));
  expect(getByText('InfoDialog')).toBeTruthy();
  userEvent.click(getByLabelText('Send Feedback'));
  expect(getByText('FeedbackDialog')).toBeTruthy();
});
