import React from 'react'
import { GlobalProvider, connect } from '@vscode-marquee/utils'
import { render, screen } from '@testing-library/react'

import { NPMStatsProvider } from '../src/Context'
import Widget from '../src'

test('should render properly in loading state', async () => {
  render(
    <GlobalProvider>
      <Widget.component />
    </GlobalProvider>
  )
  expect(screen.getByText('NPM Statistics')).toBeInTheDocument()
  expect(screen.getByTestId('loading')).toBeInTheDocument()
})

it('should render error screen if extension host propagates it', () => {
  (connect as jest.Mock).mockReturnValue({
    error: { message: 'ups' },
    stats: {}
  })

  render(
    <GlobalProvider>
      <NPMStatsProvider>
        <Widget.component />
      </NPMStatsProvider>
    </GlobalProvider>
  )
  expect(screen.getByTestId('error')).toBeInTheDocument()
  expect(screen.getByText('ups')).toBeInTheDocument()
})

it('should render error screen if no stats are available', () => {
  (connect as jest.Mock).mockReturnValue({
    error: null,
    stats: {}
  })

  render(
    <GlobalProvider>
      <NPMStatsProvider>
        <Widget.component />
      </NPMStatsProvider>
    </GlobalProvider>
  )
  expect(screen.getByTestId('no-stats')).toBeInTheDocument()
})

it('should render graph properly', () => {
  (connect as jest.Mock).mockReturnValue({
    error: null,
    stats: {
      foo: {
        '2022-06-26': 45142,
        '2022-06-27': 169454
      },
      bar: {
        '2022-02-01': 33334,
        '2022-02-02': 31277
      }
    }
  })

  render(
    <GlobalProvider>
      <NPMStatsProvider>
        <Widget.component />
      </NPMStatsProvider>
    </GlobalProvider>
  )
  expect(screen.getByText('foo')).toBeInTheDocument()
  expect(screen.getByText('bar')).toBeInTheDocument()
})
