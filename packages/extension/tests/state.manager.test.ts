import vscode from 'vscode';
import { StateManager } from '../src/state.manager';

const context = {} as any;

describe('StateManager', () => {
  test('updateWorkspaces', () => {
    jest.spyOn(StateManager.prototype, 'handlePersistence')
      .mockImplementation(jest.fn());
    jest.spyOn(StateManager.prototype, 'getActiveWorkspace')
      .mockImplementation(jest.fn());
    const state = new StateManager(context as any);
    expect(state.updateWorkspaces({})).toMatchSnapshot();
    expect(state.updateWorkspaces({ activeWorkspaceId: 'foobar' }))
      .toMatchSnapshot();

    // @ts-expect-error mock
    state.getActiveWorkspace.mockReturnValue({ id: 'foo' });
    expect(state.updateWorkspaces({})).toMatchSnapshot();
    expect(state.updateWorkspaces({ workspaces: [{ id: 'foo' }] }))
      .toMatchSnapshot();

    // @ts-expect-error mock
    vscode.env.remoteName = 'codespaces';
    expect(state.updateWorkspaces({ workspaces: [{ id: 'foobar' }] }))
      .toMatchSnapshot();
  });
});
