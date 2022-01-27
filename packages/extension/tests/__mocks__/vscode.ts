const vscode: any = {
  env: {}
};
vscode.TreeItemCollapsibleState = {
  Expanded: 'foo',
  Collapsed: 'bar'
};

vscode.commands = {
  registerCommand: jest.fn().mockImplementation((cmd: string) => cmd)
};

vscode.TreeItem = jest.fn();
vscode.EventEmitter = jest.fn();

export default vscode;
