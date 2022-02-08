import React from 'react';
import { act } from 'react-dom/test-utils';
import userEvent from '@testing-library/user-event';
import { render } from '@testing-library/react';
import { getEventListener } from '@vscode-marquee/utils';

import Widget from '../src';
import { WeatherProvider } from '../src/Context';
import type { Events } from '../src/types';

import getWeatherData from './__fixtures__/getWeather.json';
import getGoogleGeolocation from './__fixtures__/getGoogleGeolocation.json';

declare const window: {
  vscode: any
  fetch: Function
  marqueeBackendGeoUrl: string
  marqueeBackendFwdGeoUrl: string
};

window.marqueeBackendGeoUrl = 'marqueeBackendGeoUrl';
window.marqueeBackendFwdGeoUrl = 'marqueeBackendFwdGeoUrl';

const fetchOrig = window.fetch;
beforeAll(() => {
  window.vscode = { postMessage: jest.fn() };
  window.fetch = jest.fn((url) => {
    const res = {
      ok: true,
      status: 200
    };
    if (url.includes('getWeather')) {
      return Promise.resolve({ ...res, json: () => getWeatherData });
    }

    if (url.includes('marqueeBackendGeoUrl')) {
      return Promise.resolve({ ...res, json: () => getGoogleGeolocation });
    }

    return Promise.resolve({ ok: false, status: 500, error: new Error('unknown request') });
  });
});

test('renders component correctly', async () => {
  const listener = getEventListener<Events>('@vscode-marquee/welcome-widget');
  const { getByRole, getByText, getAllByText, getByLabelText, getAllByRole, getByPlaceholderText } = render(
    <WeatherProvider>
      <Widget.component />
    </WeatherProvider>
  );
  expect(getByRole('progressbar')).toBeTruthy();
  await new Promise((r) => setTimeout(r, 100));
  expect(window.fetch).toBeCalledTimes(4);
  expect(getByText('Weather in Berlin, Germany')).toBeTruthy();
  expect(getAllByText('36°F')).toBeTruthy();

  act(() => { listener.emit('openWeatherDialog', true); });
  userEvent.click(getByLabelText('Temperature scale'));
  await new Promise((r) => setTimeout(r, 100));
  userEvent.click(getAllByRole('option')[1]);
  expect(getAllByText('2°C')).toBeTruthy();

  userEvent.type(getByPlaceholderText('City, State, Country'), 'San Francisco{enter}');
  await new Promise((r) => setTimeout(r, 100));
  expect(window.fetch).toBeCalledTimes(5);
  expect((window.fetch as jest.Mock).mock.calls.pop().pop())
    .toContain('San+Francisco');
});

afterAll(() => {
  window.fetch = fetchOrig;
});
