import React from 'react'
import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/react'
import { GlobalProvider, connect } from '@vscode-marquee/utils'
import type { MarqueeWindow } from '@vscode-marquee/utils'

import { NewsProvider } from '../src/Context'
import Pop from '../src/components/Pop'

declare const window: MarqueeWindow

test('allows to change rss feed channel', async () => {
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

test('offers a button to update RSS feeds', async () => {
  const setChannel = jest.fn()
  const setIsFetching = jest.fn()

  ;(connect as jest.Mock).mockReturnValue({
    feeds: {},
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
  const updateBtn = screen.getByLabelText('Update RSS Feeds')
  expect(updateBtn).toBeInTheDocument()
  await userEvent.click(updateBtn)
  expect(window.vscode.postMessage).toBeCalledWith({
    west: {
      execCommands: [{
        args: ['@ext:stateful.marquee News Feeds'],
        command: 'workbench.action.openSettings'
      }]
    }
  })
})
