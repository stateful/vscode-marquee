import React from 'react';
import { act } from 'react-dom/test-utils';
import userEvent from '@testing-library/user-event';
import { render } from '@testing-library/react';
import { GlobalProvider } from '@vscode-marquee/utils';

import Widget from '../src';
import { SnippetProvider } from '../src/Context';

test('renders component correctly', async () => {
  render(
    <GlobalProvider>
      <SnippetProvider>
        <Widget.component />
      </SnippetProvider>
    </GlobalProvider>
  );
  // expect(getByText('Create a snippet')).toBeTruthy();
  // act(() => { userEvent.click(getByText('Create a snippet')); });
  // act(() => { userEvent.type(getByLabelText('Snippet Title').querySelector('input')!, 'L'); });
  // act(() => { userEvent.type(getByLabelText('Snippet Title').querySelector('input')!, 'O'); });
  // act(() => { userEvent.type(getByLabelText('Snippet Title').querySelector('input')!, 'L'); });
  // act(() => { userEvent.click(getByText('Add to Workspace')); });
});
