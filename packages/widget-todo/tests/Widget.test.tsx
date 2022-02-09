import React from 'react';
import { act } from 'react-dom/test-utils';
import userEvent from '@testing-library/user-event';
import { render } from '@testing-library/react';
import { GlobalProvider } from '@vscode-marquee/utils';

import Widget from '../src';
import { TodoProvider } from '../src/Context';

test('renders component correctly', async () => {
  const { getByText, getByPlaceholderText } = render(
    <GlobalProvider>
      <TodoProvider>
        <Widget.component />
      </TodoProvider>
    </GlobalProvider>
  );
  expect(getByText('Create a todo')).toBeTruthy();
  act(() => { userEvent.click(getByText('Create a todo')); });
  act(() => { userEvent.type(getByPlaceholderText('Type your todo...'), 'Some Todo'); });
  act(() => { userEvent.click(getByText('Add to Workspace')); });
});
