import React from 'react';
import { act } from 'react-dom/test-utils';
import userEvent from '@testing-library/user-event';
import { render } from '@testing-library/react';
// @ts-expect-error
import { GlobalProvider, providerValues } from '@vscode-marquee/utils';

import Widget from '../src';
import { NoteProvider } from '../src/Context';


test('renders component correctly', async () => {
  const { queryByText, getByText, container, getByPlaceholderText } = render(
    <GlobalProvider>
      <NoteProvider>
        <Widget.component />
      </NoteProvider>
    </GlobalProvider>
  );
  expect(queryByText('Add Note')).not.toBeTruthy();
  expect(getByText('Create a note')).toBeTruthy();
  act(() => { userEvent.click(getByText('Create a note')); });

  expect(getByText('Add Note')).toBeTruthy();
  expect(getByPlaceholderText('Title of Note')).toBeTruthy();
  expect(container.querySelector('.ql-editor')).toBeTruthy();

  act(() => {
    userEvent.type(getByPlaceholderText('Title of Note'), 'o');
  });
  act(() => {
    userEvent.type(container.querySelector('.noteEditorContainer-add')!, 'baaar{enter}');
  });

  userEvent.click(getByText('Add to Workspace'));
  expect(providerValues.setNotes).toBeCalledTimes(1);
  expect(providerValues.setNoteSelected).toBeCalledTimes(1);
});
