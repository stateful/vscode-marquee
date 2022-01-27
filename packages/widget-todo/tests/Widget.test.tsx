import React from 'react';
import { act } from 'react-dom/test-utils';
import userEvent from '@testing-library/user-event';
import { render } from '@testing-library/react';
import { GlobalProvider, PrefProvider } from '@vscode-marquee/utils';

import Widget from '../src';
import { TodoProvider } from '../src/Context';

test('renders component correctly', async () => {
  const { getByText, queryByText, getByLabelText, getByPlaceholderText, container } = render(
    <GlobalProvider>
      <PrefProvider>
        <TodoProvider>
          <Widget.component />
        </TodoProvider>
      </PrefProvider>
    </GlobalProvider>
  );
  expect(getByText('Create a todo')).toBeTruthy();
  act(() => { userEvent.click(getByText('Create a todo')); });
  act(() => { userEvent.type(getByPlaceholderText('Type your todo...'), 'Some Todo'); });
  act(() => { userEvent.click(getByText('Add')); });
  expect(getByText('Some Todo')).toBeTruthy();
  expect(queryByText('Create a todo')).not.toBeTruthy();

  act(() => { userEvent.click(getByLabelText('Complete Todo')); });
  act(() => { userEvent.click(container.querySelectorAll('button svg')[4]); });

  act(() => { userEvent.click(getByLabelText('Hide completed').querySelector('input')!); });
  expect(getByText('Create a todo')).toBeTruthy();

  act(() => { userEvent.click(getByLabelText('Open Todo Info')); });
  expect(getByText('Projects: 1')).toBeTruthy();
});
