import { ProjectsExtensionManager } from '../src/extension'

jest.mock('@vscode-marquee/utils/extension', () => class ExtensionManagerMock {
  public getActiveWorkspace = jest.fn().mockReturnValue({
    id: 'foobar',
    path: '/foo/bar'
  })
  public updateState = jest.fn()
  public _state = {
    workspaces: [] as any,
    visitCount: {}
  }

  /**
   * use fake params to modify the behavior of mock
   */
  constructor (ws: any) {
    ws.id && this._state.workspaces.push(ws)
  }
})

test('should update state with new workspaces', () => {
  const ws = { id: 'foobar', path: '/foo/bar' }
  const manager = new ProjectsExtensionManager({} as any, {} as any)
  expect(manager.updateState).toBeCalledWith('workspaces', [ws])
})

test('should count workspace visit', () => {
  const ws = { id: 'foobar', path: '/foo/bar' }
  const manager = new ProjectsExtensionManager(ws as any, {} as any)
  expect(manager.updateState).toBeCalledWith('visitCount', { [ws.id]: 1 })
})

test('should remember last visit', () => {
  const ws = { id: 'foobar', path: '/foo/bar' }
  const manager = new ProjectsExtensionManager(ws as any, {} as any)
  expect(manager.updateState).toBeCalledWith('lastVisited', { [ws.id]: expect.any(Number) })
})
