import React from 'react'
import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/react'
import { GlobalProvider, connect } from '@vscode-marquee/utils'

import { NewsProvider } from '../src/Context'
import Pop from '../src/components/Pop'

test('renders component with progress bar', async () => {
  const setChannel = jest.fn()
  const setIsFetching = jest.fn()

  ;(connect as jest.Mock).mockReturnValue({
    feeds: {
      Foobar: 'https://some.rss/link',
      Barfoo: 'sptth://emos.ssr/knil'
    },
    channel: 'Foobar',
    setChannel,
    setIsFetching
  })

  render(
    <GlobalProvider>
      <NewsProvider>
        <Pop />
      </NewsProvider>
    </GlobalProvider>
  )

  const btn = screen.getByLabelText('widget-settings')
  expect(btn).toBeInTheDocument()
  await userEvent.click(btn)
  await userEvent.click(screen.getByText('Foobar'))
  expect(screen.getByText('Barfoo')).toBeInTheDocument()
  await userEvent.click(screen.getByText('Barfoo'))
  expect(setChannel).toBeCalledWith('Barfoo')
  expect(setIsFetching).toBeCalledWith(true)
})
