import React from 'react'
import { act } from 'react-dom/test-utils'
import userEvent from '@testing-library/user-event'
import { render, screen, waitFor } from '@testing-library/react'
import { GlobalProvider, getEventListener } from '@vscode-marquee/utils'

import Widget from '../src'
import { WeatherProvider } from '../src/Context'
import type { Events } from '../src/types'

import getWeatherData from './__fixtures__/getWeather.json'
import getGoogleGeolocation from './__fixtures__/getGoogleGeolocation.json'

jest.mock('../../utils/src/contexts/Global')

declare const window: {
  vscode: any
  fetch: Function
  marqueeBackendGeoUrl: string
  marqueeBackendFwdGeoUrl: string
}

window.marqueeBackendGeoUrl = 'marqueeBackendGeoUrl'
window.marqueeBackendFwdGeoUrl = 'marqueeBackendFwdGeoUrl'

const fetchOrig = window.fetch
beforeAll(() => {
  window.vscode = { postMessage: jest.fn(), getState: jest.fn(), setState: jest.fn() }
  window.fetch = jest.fn((url) => {
    const res = {
      ok: true,
      status: 200
    }
    if (url.includes('getWeather')) {
      return Promise.resolve({ ...res, json: () => getWeatherData })
    }

    if (url.includes('marqueeBackendGeoUrl')) {
      return Promise.resolve({ ...res, json: () => getGoogleGeolocation })
    }

    return Promise.resolve({ ok: false, status: 500, error: new Error('unknown request') })
  })
})

test('renders component correctly', async () => {
  const listener = getEventListener<Events>('@vscode-marquee/welcome-widget')
  render(
    <GlobalProvider>
      <WeatherProvider>
        <Widget.component />
      </WeatherProvider>
    </GlobalProvider>
  )
  expect(screen.getByRole('progressbar')).toBeInTheDocument()
  await new Promise((r) => setTimeout(r, 100))
  expect(window.fetch).toBeCalledTimes(4)
  expect(screen.getByText('Weather in Berlin')).toBeInTheDocument()
  await waitFor(() => screen.getAllByText('36°F') !== undefined)
  expect(screen.getAllByText('36°F')).toHaveLength(4)

  act(() => { listener.emit('openWeatherDialog', true) })
  await userEvent.click(screen.getByLabelText('Temperature scale'))
  await new Promise((r) => setTimeout(r, 100))
  await userEvent.click(screen.getAllByRole('option')[1])
  expect(screen.getByText('35°F')).toBeInTheDocument()

  await userEvent.type(screen.getByPlaceholderText('City, State, Country'), 'San Francisco{enter}')
  await new Promise((r) => setTimeout(r, 100))
  expect(window.fetch).toBeCalledTimes(4)
  expect((window.fetch as jest.Mock).mock.calls.pop().pop())
    .toContain('52.52000659999999&lon=13.40495')
})

afterAll(() => {
  window.fetch = fetchOrig
})
