import React from 'react'
import { render, screen } from '@testing-library/react'
import { GlobalProvider, connect } from '@vscode-marquee/utils'

import { NewsProvider } from '../src/Context'
import Widget from '../src'

test('renders component with progress bar', async () => {
  (connect as jest.Mock).mockReturnValue({
    isFetching: true,
    feeds: {
      Foobar: 'https://some.rss/feed'
    }
  })

  render(
    <GlobalProvider>
      <NewsProvider>
        <Widget.component />
      </NewsProvider>
    </GlobalProvider>
  )
  expect(screen.getByRole('progressbar')).toBeInTheDocument()
})

test('displays error message', async () => {
  (connect as jest.Mock).mockReturnValue({
    isFetching: false,
    news: [],
    error: new Error('upsala'),
    feeds: {
      Foobar: 'https://some.rss/feed'
    }
  })

  render(
    <GlobalProvider>
      <NewsProvider>
        <Widget.component />
      </NewsProvider>
    </GlobalProvider>
  )
  expect(screen.getByText('upsala')).toBeInTheDocument()
})

test('tells you if there are no news', async () => {
  (connect as jest.Mock).mockReturnValue({
    isFetching: false,
    news: [],
    feeds: {
      Foobar: 'https://some.rss/feed'
    }
  })

  render(
    <GlobalProvider>
      <NewsProvider>
        <Widget.component />
      </NewsProvider>
    </GlobalProvider>
  )
  expect(screen.getByText('No news available at the moment!'))
    .toBeInTheDocument()
})

test('show loaded news', async () => {
  (connect as jest.Mock).mockReturnValue({
    isFetching: false,
    news: [{
      title: 'foobar title',
      link: 'https://stateful.com/rss',
      pubDate: Date.now() - (3 * 1000 * 60),
      creator: 'Max Mustermann'
    }],
    channel: 'Foobar',
    feeds: {
      Foobar: 'https://some.rss/feed'
    }
  })

  render(
    <GlobalProvider>
      <NewsProvider>
        <Widget.component />
      </NewsProvider>
    </GlobalProvider>
  )
  expect(screen.getByText('by Max Mustermann 3 minutes ago'))
    .toBeInTheDocument()
  expect(screen.getByText('foobar title'))
    .toBeInTheDocument()
})
