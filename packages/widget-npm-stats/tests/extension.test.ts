import { request } from 'undici'
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

  it('should initiate extension manager properly', async () => {
    await new Promise((r) => setTimeout(r, 100))
    expect(manager.marquee.disposable.updateState).toBeCalledTimes(3)
    expect(manager.marquee.disposable.updateState).toBeCalledWith('stats', {})
    expect(manager.marquee.disposable.updateState).toBeCalledWith('error', null)
    expect(manager.marquee.disposable.updateState).toBeCalledWith('isLoading', false)
  })

  it('should successfully fetch data', async () => {
    manager.marquee.disposable.configuration.packageNames = ['foo', 'bar']
    await manager.marquee.disposable['_loadStatistics']()
    expect((manager.marquee.disposable.updateState as jest.Mock).mock.calls)
      .toMatchSnapshot()
  })

  it('should fail properly', async () => {
    (request as jest.Mock).mockRejectedValue(new Error('ups'))
    await manager.marquee.disposable['_loadStatistics']()
    expect((manager.marquee.disposable.updateState as jest.Mock).mock.calls)
      .toMatchSnapshot()
  })
})
