import vscode from 'vscode'
import { request } from 'undici'
import { activate, NPMStatsExtensionManager } from '../src/extension'

const channel = {
  appendLine: jest.fn()
}

describe('Extension Manager', () => {
  it('should initiate extension manager properly', async () => {
    const manager = activate({} as any, channel as any)
    ;(manager.marquee.disposable.updateState as jest.Mock).mockClear()
    await manager.marquee.disposable['_loadStatistics']()
    expect(manager.marquee.disposable.updateState).toBeCalledTimes(4)
    expect(manager.marquee.disposable.updateState).toBeCalledWith('isLoading', true)
    expect(manager.marquee.disposable.updateState).toBeCalledWith('stats', {})
    expect(manager.marquee.disposable.updateState).toBeCalledWith('error', null)
    expect(manager.marquee.disposable.updateState).toBeCalledWith('isLoading', false)
  })

  it('should successfully fetch data', async () => {
    const manager = new NPMStatsExtensionManager({} as any, {} as any)
    manager.configuration.packageNames = ['foo', 'bar']
    await manager['_loadStatistics']()
    expect((manager.updateState as jest.Mock).mock.calls)
      .toMatchSnapshot()
  })

  it('should fail properly', async () => {
    const manager = new NPMStatsExtensionManager({} as any, {} as any)
    ;(request as jest.Mock).mockRejectedValue(new Error('ups'))
    await manager['_loadStatistics']()
    expect((manager.updateState as jest.Mock).mock.calls)
      .toMatchSnapshot()
  })

  it('_checkWorkspaceForNPMPackage', async () => {
    const channel = { appendLine: jest.fn() }
    // @ts-ignore
    vscode.workspace.workspaceFolders = 'foo'
    // @ts-ignore
    const manager = new NPMStatsExtensionManager({} as any, channel as any, null, { packageNames: [] })
    manager['_configuration'].packageNames = []
    ;(vscode.workspace.fs.readFile as jest.Mock)
      .mockResolvedValue(JSON.stringify({ name: 'foobar' }))
    await manager['_checkWorkspaceForNPMPackage']()
    expect(channel.appendLine).toBeCalledTimes(1)
    expect(manager.updateConfiguration).toBeCalledWith('packageNames', ['foobar'], 42)
    expect(manager['broadcast']).toBeCalledWith({ packageNames: ['foobar'] })
  })
})
