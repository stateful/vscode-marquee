import React from 'react';
import { render } from '@testing-library/react';

import { Providers, App } from '../src';

declare const window: {
  vscode: any
};

const MockProvider = ({ children, name }: { children: any, name: string }) => {
  return (<div role={name}>{children}</div>);
};

jest.mock('../src/contexts/ModeContext', () => ({
  ModeProvider: ({ children }: any) => (
    <MockProvider name="ModeProvider">{children}</MockProvider>
  )
}));

jest.mock('../src/Container', () => () => (<div>Container</div>));

test('Providers', () => {
  const { getByText } = render(<Providers>Foobar</Providers>);
  expect(getByText('Foobar')).toBeTruthy();
});

test('App', () => {
  window.vscode = { postMessage: jest.fn() };

  const { getByText } = render(<App />);
  expect(getByText('Container')).toBeTruthy();
  expect(window.vscode.postMessage).toBeCalledWith({ ready: true });
});
