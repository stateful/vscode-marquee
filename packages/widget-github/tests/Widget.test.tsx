import React from 'react'
import { act } from 'react-dom/test-utils'
import { render, screen } from '@testing-library/react'
import { GlobalProvider } from '@vscode-marquee/utils'

import Widget from '../src'

jest.mock('../../utils/src/contexts/Global')

let resolveFetch = (params: any) => params
const fetchOrig = window.fetch
beforeEach(() => {
  window.fetch = jest.fn(() => new Promise((r) => {
    resolveFetch = r
  }))
})

test('renders component correctly', async () => {
  render(
    <GlobalProvider>
      <Widget.component />
    </GlobalProvider>
  )
  expect(screen.getByRole('progressbar')).toBeInTheDocument()
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
    })
  })
  await new Promise((r) => setTimeout(r, 500))
  expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
  expect(screen.getByText('Trending on Github')).toBeInTheDocument()
  expect(screen.getByText('projectDescriptiom')).toBeInTheDocument()
  expect(screen.getByText('John Doe/someProject')).toBeInTheDocument()
})

test('should query projects with no result', async () => {
  render(
    <GlobalProvider>
      <Widget.component />
    </GlobalProvider>
  )
  act(() => { resolveFetch({ ok: 1, json: () => [] }) })
  await new Promise((r) => setTimeout(r, 500))
  expect(screen.getByText('There are no matches for your search criteria.')).toBeInTheDocument()
})

test('should fail with network error', async () => {
  (window.fetch as jest.Mock).mockRejectedValue(new Error('upsala'))
  render(
    <GlobalProvider>
      <Widget.component />
    </GlobalProvider>
  )
  await new Promise((r) => setTimeout(r, 500))
  expect(screen.getByText('Couldn\'t fetch GitHub trends!')).toBeInTheDocument()
})

afterAll(() => {
  window.fetch = fetchOrig
})
