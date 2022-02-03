import type vscode from "vscode";
import type { Client } from 'tangle';

import { StateManager } from "./state.manager";
import { MarqueeExtension } from "./extension";

export function activate(context: vscode.ExtensionContext) {
  const stateMgr = new StateManager(context);
  new MarqueeExtension(context, stateMgr);

  return {
    /**
     * demo code for example widget in "/example"
     */
    marquee: {
      setup: (tangle: Client<{ counter: number }>) => {
        let i = 0;
        setInterval(() => {
          tangle.emit('counter', ++i);
        }, 1000);
      }
    }
  };
}

// this method is called when your extension is deactivated
export function deactivate() {}
