import React from 'react';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';

import SettingsDialog from '../../src/dialogs/SettingsDialog';
import { GlobalProvider } from '@vscode-marquee/utils';

declare const window: {
  vscode: any
};

jest.mock('../../../utils/src/contexts/Global');

jest.mock('../../src/components/ModeDialogContent', () => (
  () => (<div>ModeDialogContent</div>)
));

test('renders ModeDialogContent component properly', () => {
  const close = jest.fn();
  render(<GlobalProvider><SettingsDialog close={close} /></GlobalProvider>);
  expect(screen.queryByText('ModeDialogContent')).toBeTruthy();
});

test('switches to import/export settings', () => {
  window.vscode = { postMessage: jest.fn() };

  const close = jest.fn();
  const { getByText } = render(
    <GlobalProvider>
      <SettingsDialog close={close} />
    </GlobalProvider>
  );
  userEvent.click(getByText('Import / Export'));
  expect(screen.queryByText('ModeDialogContent')).not.toBeTruthy();

  userEvent.click(getByText('Import'));
  expect(window.vscode.postMessage).toBeCalledWith({
    west: { execCommands: [{ command: "marquee.jsonImport" }] }
  });

  userEvent.click(getByText('Export'));
  expect(window.vscode.postMessage).toBeCalledWith({
    west: { execCommands: [{ command: "marquee.jsonExport" }] }
  });

  expect(close).toBeCalledTimes(2);
});
