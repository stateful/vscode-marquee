import vscode from 'vscode'

export class StateStore implements vscode.Disposable {
  #disposables: vscode.Disposable[] = []
  public dispose () {
    this.#disposables.forEach((d) => d.dispose())
  }
}
