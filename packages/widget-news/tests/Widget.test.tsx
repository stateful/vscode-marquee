import React from 'react';
import { act } from 'react-dom/test-utils';
import userEvent from '@testing-library/user-event';
import { render } from '@testing-library/react';
import { PrefProvider } from '@vscode-marquee/utils';

import Widget from '../src';

let resolveFetch = (params: any) => params;
const fetchOrig = window.fetch;
beforeEach(() => {
  window.fetch = jest.fn(() => new Promise((r) => {
    resolveFetch = r;
  }));
});

test('renders component correctly', async () => {
  const { getByRole, getByText } = render(
    <PrefProvider>
      <Widget.component />
    </PrefProvider>
  );
  expect(getByRole('progressbar')).toBeTruthy();
  act(() => {
    resolveFetch({
      ok: 1,
      json: () => [{
        comments_count: 123,
        domain: 'http://foobar.com',
        id: 1,
        points: 42,
        time: Date.now(),
        time_ago: '5hrs',
        title: 'Foobar Title',
        type: 'new',
        url: 'http://foobar.com',
        user: 'john.doe'
      }]
    });
  });
  expect(window.fetch).toBeCalledWith(
    'https://api.hackerwebapp.com/news',
    { mode: 'cors' }
  );
  await new Promise((r) => setTimeout(r, 100));
  expect(getByText('Foobar Title')).toBeTruthy();
  expect(getByText('42 points by john.doe 5hrs')).toBeTruthy();
});

test('should allow to switch channels', async () => {
  const { getByLabelText, getByText, container } = render(
    <PrefProvider>
      <Widget.component />
    </PrefProvider>
  );
  userEvent.click(container.querySelectorAll('button svg')[0]);
  expect(getByText('Hide this widget')).toBeTruthy();
  // await new Promise(r => setTimeout(r, 1000))
  userEvent.click(getByLabelText('Channel'));
  userEvent.click(getByText('Jobs'));
  expect(window.fetch).toBeCalledWith(
    'https://api.hackerwebapp.com/jobs',
    { mode: 'cors' }
  );
});

afterAll(() => {
  window.fetch = fetchOrig;
});
