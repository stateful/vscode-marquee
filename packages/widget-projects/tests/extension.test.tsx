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

// export class ProjectsExtensionManager extends ExtensionManager<State, Configuration> {
//   constructor (
//     context: vscode.ExtensionContext,
//     channel: vscode.OutputChannel
//   ) {
//     super(context, channel, STATE_KEY, DEFAULT_CONFIGURATION, DEFAULT_STATE)

//     const aws = this.getActiveWorkspace()
//     /**
//      * add new workspace to list
//      */
//     if (
//       /**
//        * the current workspace can be detected
//        */
//       aws &&
//       /**
//        * the workspace path is not a number
//        * (happens e.g. when connecting to docker container)
//        */
//       isNaN(Number(aws.path)) &&
//       /**
//        * the workspace isn't part of the existing list
//        */
//       !this._state.workspaces.find((ws: any) => ws.id === aws.id) &&
//       /**
//        * we are not running on a remote machine, this is necessary
//        * because we aren't able to connect to remote VSCode instances
//        * through `vscode.openFolder`
//        * see more: https://github.com/microsoft/vscode-remote-release/issues/6243
//        */
//       typeof vscode.env.remoteName === 'undefined'
//     ) {
//       this.updateState('workspaces', [...this._state.workspaces, aws])
//     }

//     /**
//      * count workspace usage
//      */
//     if (aws) {
//       const newWorkspaceVisitCount = this.state.visitCount[aws.id]
//         ? this.state.visitCount[aws.id] + 1
//         : 1

//       const visitCount = {
//         ...this.state.visitCount,
//         [aws.id]: newWorkspaceVisitCount
//       }

//       /**
//        * remove ids from `visitCount` list that aren't in workspace list (cleanup)
//        */
//       for (const id of Object.keys(visitCount)) {
//         if (!this._state.workspaces.find((w) => w.id === id)) {
//           delete visitCount[id]
//         }
//       }

//       this.updateState('visitCount', visitCount)
//     }
//   }
// }

// export function activate (
//   context: vscode.ExtensionContext,
//   channel: vscode.OutputChannel
// ) {
//   const stateManager = new ProjectsExtensionManager(context, channel)

//   return {
//     marquee: {
//       disposable: stateManager,
//       defaultState: stateManager.state,
//       defaultConfiguration: stateManager.configuration,
//       setup: stateManager.setBroadcaster.bind(stateManager)
//     }
//   }
// }

// export * from './types'
