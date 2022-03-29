import React from 'react'
import { act } from 'react-dom/test-utils'
import userEvent from '@testing-library/user-event'
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
    })
  })
  expect(window.fetch).toBeCalledWith(
    'https://api.hackerwebapp.com/news',
    { mode: 'cors' }
  )
  await new Promise((r) => setTimeout(r, 100))
  expect(screen.getByText('Foobar Title')).toBeInTheDocument()
  expect(screen.getByText('42 points by john.doe 5hrs')).toBeInTheDocument()
})

test('should allow to switch channels', async () => {
  const { container } = render(
    <GlobalProvider>
      <Widget.component />
    </GlobalProvider>
  )
  userEvent.click(container.querySelectorAll('button svg')[0])
  expect(screen.getByText('Hide this widget')).toBeInTheDocument()
  // await new Promise(r => setTimeout(r, 1000))
  userEvent.click(screen.getByLabelText('Channel'))
  userEvent.click(screen.getByText('Jobs'))
  expect(window.fetch).toBeCalledWith(
    'https://api.hackerwebapp.com/jobs',
    { mode: 'cors' }
  )
})

afterAll(() => {
  window.fetch = fetchOrig
})
