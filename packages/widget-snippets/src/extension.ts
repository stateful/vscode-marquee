import vscode from 'vscode';

import ExtensionManager from '@vscode-marquee/utils/extension';

import { DEFAULT_STATE } from './constants';
import type { State } from './types';

const STATE_KEY = 'widgets.snippets';

export function activate (
  context: vscode.ExtensionContext,
  channel: vscode.OutputChannel
) {
  const stateManager = new ExtensionManager<State, {}>(context, channel, STATE_KEY, {}, DEFAULT_STATE);

  return {
    marquee: {
      disposable: stateManager,
      defaultState: stateManager.state,
      defaultConfiguration: stateManager.configuration,
      setup: stateManager.setBroadcaster.bind(stateManager)
    }
  };
}
