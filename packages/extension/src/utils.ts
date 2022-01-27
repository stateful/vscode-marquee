import vscode from 'vscode';

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
