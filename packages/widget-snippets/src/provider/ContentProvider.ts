import vscode from 'vscode'

export default class Provider implements vscode.TextDocumentContentProvider {
  static scheme = 'snippet'

  private _onDidChange = new vscode.EventEmitter<vscode.Uri>()

  provideTextDocumentContent (): string | Thenable<string> {
    return ''
  }

  dispose () {
    this._onDidChange.dispose()
  }

  get onDidChange () {
    return this._onDidChange.event
  }
}
