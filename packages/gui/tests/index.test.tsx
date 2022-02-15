import React from 'react';
import { render } from '@testing-library/react';

import { App } from '../src';

declare const window: {
  vscode: any
};

jest.mock('../src/Container', () => () => (<div>Container</div>));

test('App', () => {
  window.vscode = { postMessage: jest.fn() };

  const { getByText } = render(<App />);
  expect(getByText('Container')).toBeTruthy();
  expect(window.vscode.postMessage).toBeCalledWith({ ready: true });
});
