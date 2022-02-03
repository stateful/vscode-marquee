import vscode from 'vscode';

import ExtensionManager from '@vscode-marquee/utils/extension';

import { DEFAULT_STATE } from './constants';
import type { State } from './types';

const STATE_KEY = 'widgets.notes';

class TodoExtensionManager extends ExtensionManager<State, {}> {
  constructor (
    context: vscode.ExtensionContext,
    channel: vscode.OutputChannel
  ) {
    super(context, channel, STATE_KEY, {}, DEFAULT_STATE);
  }
}

export function activate (
  context: vscode.ExtensionContext,
  channel: vscode.OutputChannel
) {
  const stateManager = new TodoExtensionManager(context, channel);

  return {
    marquee: {
      disposable: stateManager,
      defaultState: stateManager.state,
      defaultConfiguration: stateManager.configuration,
      setup: stateManager.setBroadcaster.bind(stateManager)
    }
  };
}
