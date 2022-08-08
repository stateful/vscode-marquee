import { activate } from '../src/extension'

const channel = {
  appendLine: jest.fn()
}

describe('Extension Manager', () => {
  let manager: any

  beforeEach(() => {
    manager = activate({} as any, channel as any)
    ;(manager.marquee.disposable.updateState as jest.Mock).mockClear()
  })

  it('does nothing if _isFetching is set to true', async () => {
    ;(manager.marquee.disposable.updateState as jest.Mock).mockClear()
    await manager.marquee.disposable.fetchFeeds()
    expect(manager.marquee.disposable.updateState).toBeCalledTimes(0)
  })

  it('throws an error if channel wasn\'t found', async () => {
    (manager.marquee.disposable.updateState as jest.Mock).mockClear()
    manager.marquee.disposable['_isFetching'] = false
    const tangle = { broadcast: jest.fn() }

    manager.marquee.disposable._tangle = tangle
    manager.marquee.disposable._state = { channel: 'foobar' }
    manager.marquee.disposable._configuration = {
      feeds: {
        barfoo: 'some url',
        somethingElse: 'some url'
      }
    }
    await manager.marquee.disposable.fetchFeeds()
    expect(tangle.broadcast.mock.calls).toMatchSnapshot()
    expect(manager.marquee.disposable.updateState.mock.calls)
      .toMatchSnapshot()
  })

  it('can successfully fetch items', async () => {
    (manager.marquee.disposable.updateState as jest.Mock).mockClear()
    manager.marquee.disposable['_isFetching'] = false
    const tangle = { broadcast: jest.fn() }

    manager.marquee.disposable._tangle = tangle
    manager.marquee.disposable._state = { channel: 'barfoo' }
    manager.marquee.disposable._configuration = {
      feeds: {
        barfoo: 'some url',
        somethingElse: 'some url'
      }
    }
    await manager.marquee.disposable.fetchFeeds()
    expect(manager.marquee.disposable['_parser'].parseURL)
      .toBeCalledWith('some url')
    expect(tangle.broadcast.mock.calls).toMatchSnapshot()
    expect(manager.marquee.disposable.updateState.mock.calls)
      .toMatchSnapshot()
  })
})


// async fetchFeeds () {
//   if (this._isFetching) {
//     return
//   }

//   this._isFetching = true
//   await this.updateState('isFetching', true)

//   try {
//     const url = this._configuration.feeds[this._state.channel]
//     if (!url) {
//       throw new Error(
//         `Channel "${this._state.channel}" not found, ` +
//         `available channels are ${Object.keys(this._configuration.feeds).join(', ')}`
//       )
//     }

//     this._channel.appendLine(`Fetch News ("${this._state.channel}") from ${url}`)
//     const feed = await this._parser.parseURL(url)

//     await this.updateState('news', feed.entries)
//     await this.updateState('isFetching', false)
//     await this.updateState('error', undefined)
//     this._tangle?.broadcast({
//       news: feed.items,
//       isFetching: false,
//       error: undefined
//     } as State & Configuration)
//     setTimeout(() => { this._isFetching = false }, 100)
//   } catch (err: any) {
//     await this.updateState('isFetching', false)
//     await this.updateState('error', { message: err.message } as Error)
//     this._tangle?.broadcast({
//       news: [] as FeedItem[],
//       isFetching: false,
//       error: undefined
//     } as State & Configuration)
//     setTimeout(() => { this._isFetching = false }, 100)
//   }
// }
// }
