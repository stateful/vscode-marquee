import React from 'react';
import userEvent from '@testing-library/user-event';
import { render } from '@testing-library/react';
// @ts-expect-error mock import
import { ModeProvider, _setModeName } from '../../src/contexts/ModeContext';
import ModeSelector from '../../src/components/ModeSelector';

jest.mock('../../src/contexts/ModeContext');
jest.mock('../../src/dialogs/ModeDialog', () => () => <div>ModeDialog</div>);

test('should render component correctly', () => {
  const { getByLabelText, getByText } = render(
    <ModeProvider>
      <ModeSelector />
    </ModeProvider>
  );

  expect(_setModeName).toBeCalledTimes(0);
  userEvent.click(getByLabelText('Set Mode'));
  expect(_setModeName).toBeCalledWith('prevMode');

  userEvent.click(getByLabelText('select merge strategy'));
  userEvent.click(getByLabelText('Open Mode Dialog'));
  expect(getByText('ModeDialog')).toBeTruthy();

  userEvent.click(getByText('Play'));
  expect(_setModeName).toBeCalledTimes(2);
  expect(_setModeName).toBeCalledWith('play');
});
