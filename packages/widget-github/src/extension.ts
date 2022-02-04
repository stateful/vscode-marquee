import vscode from 'vscode';

import ExtensionManager from '@vscode-marquee/utils/extension';

import { DEFAULT_CONFIGURATION, DEFAULT_STATE } from './constants';
import type { Configuration } from './types';

const STATE_KEY = 'widgets.github';

export function activate (
  context: vscode.ExtensionContext,
  channel: vscode.OutputChannel
) {
  const stateManager = new ExtensionManager<{}, Configuration>(context, channel, STATE_KEY, DEFAULT_CONFIGURATION, DEFAULT_STATE);

  return {
    marquee: {
      disposable: stateManager,
      defaultState: stateManager.state,
      defaultConfiguration: stateManager.configuration,
      setup: stateManager.setBroadcaster.bind(stateManager)
    }
  };
}
