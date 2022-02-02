import vscode from 'vscode';

import ExtensionManager from '@vscode-marquee/utils/build/extensionManager';

import { DEFAULT_CONFIGURATION, DEFAULT_STATE } from './constants';
import type { Configuration } from './types';

const STATE_KEY = 'widgets.weather';

class GitHubExtensionManager extends ExtensionManager<{}, Configuration> {
  constructor (
    context: vscode.ExtensionContext,
    channel: vscode.OutputChannel
  ) {
    super(context, channel, STATE_KEY, DEFAULT_CONFIGURATION, DEFAULT_STATE);
  }
}

export function activate (
  context: vscode.ExtensionContext,
  channel: vscode.OutputChannel
) {
  const stateManager = new GitHubExtensionManager(context, channel);

  return {
    marquee: {
      disposable: stateManager,
      defaultState: stateManager.state,
      defaultConfiguration: stateManager.configuration,
      setup: stateManager.setBroadcaster.bind(stateManager)
    }
  };
}
