import { activate } from '../src/extension'

describe('Extension Manager', () => {
  let manager: any

  beforeEach(() => {
    manager = activate({} as any)
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
