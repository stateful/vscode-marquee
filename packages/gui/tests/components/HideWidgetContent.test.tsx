import React from 'react';
import userEvent from '@testing-library/user-event';
import { render } from '@testing-library/react';

import HideWidgetContent from '../../src/components/HideWidgetContent';

jest.mock('../../src/dialogs/SettingsDialog', () => (
  () => <div>SettingsDialog</div>
));

test('should render component correctly', () => {
  const { getByText, container } = render(
    <HideWidgetContent name="foobar" />
  );

  // expect(_removeModeWidget).toBeCalledTimes(0);
  userEvent.click(getByText('Hide this widget'));
  // expect(_removeModeWidget).toBeCalledWith('foobar');

  userEvent.click(container.querySelector('svg')!);
  expect(getByText('SettingsDialog')).toBeTruthy();
});
