import React from 'react'
import { render } from '@testing-library/react'
import { GlobalProvider } from '@vscode-marquee/utils'

import Widget from '../src'
import { SnippetProvider } from '../src/Context'

test('renders component correctly', async () => {
  render(
    <GlobalProvider>
      <SnippetProvider>
        <Widget.component />
      </SnippetProvider>
    </GlobalProvider>
  )
  // expect(screen.getByText('Create a snippet')).toBeTruthy();
  // act(() => { userEvent.click(screen.getByText('Create a snippet')); });
  // act(() => { userEvent.type(screen.getByLabelText('Snippet Title').querySelector('input')!, 'L'); });
  // act(() => { userEvent.type(screen.getByLabelText('Snippet Title').querySelector('input')!, 'O'); });
  // act(() => { userEvent.type(screen.getByLabelText('Snippet Title').querySelector('input')!, 'L'); });
  // act(() => { userEvent.click(screen.getByText('Add to Workspace')); });
})
