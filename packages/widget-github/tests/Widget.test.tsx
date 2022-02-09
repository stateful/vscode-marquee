import React from 'react';
import { act } from 'react-dom/test-utils';
import { render } from '@testing-library/react';
import { GlobalProvider } from '@vscode-marquee/utils';

import Widget from '../src';

jest.mock('../../utils/src/contexts/Global');

let resolveFetch = (params: any) => params;
const fetchOrig = window.fetch;
beforeEach(() => {
  window.fetch = jest.fn(() => new Promise((r) => {
    resolveFetch = r;
  }));
});

test('renders component correctly', async () => {
  const { getByRole, getByText, queryByRole } = render(
    <GlobalProvider>
      <Widget.component />
    </GlobalProvider>
  );
  expect(getByRole('progressbar')).toBeTruthy();
  act(() => {
    resolveFetch({
      ok: 1,
      json: () => [{
        description: 'projectDescriptiom',
        url: 'http://github.com/some/project',
        author: 'John Doe',
        name: 'someProject',
        currentPeriodStars: 42,
        language: 'TypeScript',
        languageColor: 'blue',
        forks: 123,
        stars: 321,
        builtBy: [{ username: 'me' }]
      }]
    });
  });
  await new Promise((r) => setTimeout(r, 100));
  expect(queryByRole('progressbar')).not.toBeTruthy();
  expect(getByText('Trending on Github')).toBeTruthy();
  expect(getByText('projectDescriptiom')).toBeTruthy();
  expect(getByText('John Doe/someProject')).toBeTruthy();
});

test('should query projects with no result', async () => {
  const { getByText } = render(
    <GlobalProvider>
      <Widget.component />
    </GlobalProvider>
  );
  act(() => { resolveFetch({ ok: 1, json: () => [] }); });
  await new Promise((r) => setTimeout(r, 100));
  expect(getByText('There are no matches for your search criteria.')).toBeTruthy();
});

test('should fail with network error', async () => {
  (window.fetch as jest.Mock).mockRejectedValue(new Error('upsala'));
  const { getByText } = render(
    <GlobalProvider>
      <Widget.component />
    </GlobalProvider>
  );
  await new Promise((r) => setTimeout(r, 100));
  expect(getByText('Couldn\'t fetch GitHub trends!')).toBeTruthy();
});

afterAll(() => {
  window.fetch = fetchOrig;
});
