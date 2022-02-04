import vscode from 'vscode';
import ExtensionManager from '@vscode-marquee/utils/extension';

export const isExpanded = (id: number): vscode.TreeItemCollapsibleState => {
  const found = [0, 1, 2, 3].filter((item: number) => id === item).length > 0;

  if (found) {
    return vscode.TreeItemCollapsibleState.Expanded;
  }

  return vscode.TreeItemCollapsibleState.Collapsed;
};

export const filterByScope = (
  obj: { workspaceId: string }[],
  aws: null | { id: string },
  globalScope: boolean
) => {
  return obj.filter((n: any) => {
    if (globalScope) {
      return true;
    } else if (aws && aws.id === n.workspaceId) {
      return true;
    }
    return false;
  });
};

export const DEFAULT_STATE = {
  modeName: 'default',
  prevMode: null
};

export const DEFAULT_CONFIGURATION = {
  modes: {}
};

export function activateGUI (
  context: vscode.ExtensionContext,
  channel: vscode.OutputChannel
) {
  const stateManager = new ExtensionManager<{}, {}>(context, channel, 'configuration', DEFAULT_CONFIGURATION, DEFAULT_STATE);

  return {
    marquee: {
      disposable: stateManager,
      defaultState: stateManager.state,
      defaultConfiguration: stateManager.configuration,
      setup: stateManager.setBroadcaster.bind(stateManager)
    }
  };
}
