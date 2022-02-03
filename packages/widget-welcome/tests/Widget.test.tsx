import React from 'react';
import { act } from 'react-dom/test-utils';
import userEvent from '@testing-library/user-event';
import { render } from '@testing-library/react';
import { getEventListener } from '@vscode-marquee/utils';

import Widget from '../src';
import { TrickProvider } from '../src/Context';
import type { State, Events } from '../src/types';

declare const window: {
  vscode: any
};

beforeAll(() => {
  window.vscode = { postMessage: jest.fn() };
});

test('renders component correctly', async () => {
  const listener = getEventListener<State & Events>('@vscode-marquee/welcome-widget');
  const { getByText, queryByText, container } = render(
    <TrickProvider>
      <Widget.component />
    </TrickProvider>
  );
  expect(getByText('You\'re all up to date 🚀, nice work! 🙃')).toBeTruthy();
  act(() => { listener.emit('error', new Error('ups')); });
  expect(getByText('Error fetching data!')).toBeTruthy();
  expect(getByText('ups')).toBeTruthy();
  act(() => {
    listener.emit('tricks', [{
      order: 1,
      id: '1',
      content: 'Hello World!',
      title: 'Here am I',
      active: false,
      notify: false,
      createdAt: Date.now(),
      votes: { upvote: 123 }
    }]);
  });
  act(() => { listener.emit('read', ['1']); });
  expect(getByText('You\'re all up to date 🚀, nice work! 🙃')).toBeTruthy();
  act(() => { listener.emit('read', []); });
  expect(getByText('Hello World!')).toBeTruthy();

  expect(window.vscode.postMessage).toBeCalledTimes(0);
  act(() => { userEvent.click(getByText('Like')); });
  expect(window.vscode.postMessage).toBeCalledTimes(1);
  expect(window.vscode.postMessage.mock.calls).toMatchSnapshot();

  act(() => { userEvent.click(getByText('Mark as read')); });
  expect(queryByText('Hello World!')).not.toBeTruthy();
  expect(getByText('You\'re all up to date 🚀, nice work! 🙃')).toBeTruthy();

  userEvent.click(container.querySelectorAll('button svg')[0]);
  userEvent.click(getByText('Reset Read Notifications'));
  expect(getByText('Hello World!')).toBeTruthy();
  expect(queryByText('You\'re all up to date 🚀, nice work! 🙃')).not.toBeTruthy();
});
