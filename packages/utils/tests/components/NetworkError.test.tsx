import React from 'react';
import userEvent from '@testing-library/user-event';
import { render } from '@testing-library/react';

import { NetworkError } from '../../src';

declare const window: {
  vscode: any
};

test('should render the component with message pro', () => {
  const { getByText } = render(<NetworkError message="foobar" />);
  expect(getByText('Error fetching data!')).toBeTruthy();
  expect(getByText('foobar')).toBeTruthy();
});

test('should render the component with default prop', () => {
  window.vscode = { postMessage: jest.fn() };
  const { getByText } = render(<NetworkError />);
  userEvent.click(getByText('Marquee settings'));
  expect(window.vscode.postMessage).toBeCalledWith({
    west: { execCommands: [{
      command: 'workbench.action.openSettings',
      args: ['Marquee']
    }],
  }});
});
