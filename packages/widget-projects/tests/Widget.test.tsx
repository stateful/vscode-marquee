import React from 'react';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import { GlobalProvider } from '@vscode-marquee/utils';

import Widget from '../src';
import { WorkspaceProvider } from '../src/Context';

declare const window: {
  vscode: any
};

beforeEach(() => {
  window.vscode = { postMessage: jest.fn() };
});

test('renders component correctly', async () => {
  render(
    <GlobalProvider>
      <WorkspaceProvider>
        <Widget.component />
      </WorkspaceProvider>
    </GlobalProvider>
  );
  expect(screen.getByText('example')).toBeInTheDocument();
  expect(screen.queryByPlaceholderText('Type here...')).not.toBeInTheDocument();
  userEvent.click(screen.getByLabelText('Open Filter Search'));
  userEvent.type(screen.getByPlaceholderText('Type here...'), 'f');
  userEvent.type(screen.getByPlaceholderText('Type here...'), 'o');
  userEvent.type(screen.getByPlaceholderText('Type here...'), 'o');
  userEvent.type(screen.getByPlaceholderText('Type here...'), '{enter}');
  userEvent.click(screen.getByText('Projects'));
  userEvent.click(screen.getByLabelText('Open Filter Search'));

  expect(window.vscode.postMessage).toBeCalledTimes(0);
  userEvent.click(screen.getByLabelText('Open Folder'));
  expect(window.vscode.postMessage).toBeCalledTimes(1);
  expect(window.vscode.postMessage.mock.calls).toMatchSnapshot();
  window.vscode.postMessage.mockClear();

  userEvent.click(screen.getByLabelText('Open Recent'));
  expect(window.vscode.postMessage).toBeCalledTimes(1);
  expect(window.vscode.postMessage.mock.calls).toMatchSnapshot();
});
