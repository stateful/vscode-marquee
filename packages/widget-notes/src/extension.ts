import vscode from 'vscode';

import ExtensionManager from '@vscode-marquee/utils/extension';

import { DEFAULT_STATE } from './constants';
import type { State } from './types';

const STATE_KEY = 'widgets.notes';

export class NoteExtensionManager extends ExtensionManager<State, {}> {
  constructor (context: vscode.ExtensionContext, channel: vscode.OutputChannel) {
    super(context, channel, STATE_KEY, {}, DEFAULT_STATE);
    this._disposables.push(
      vscode.commands.registerCommand('marquee.note.move', this._moveNote.bind(this))
    );
  }

  /**
   * archive todo
   * @param item TreeView item that represents a todo in a tree view
   * @returns (un)archived todo
   */
   private _moveNote (item: { id: string, archived: boolean }) {
    const awsp = this.getActiveWorkspace();

    if (!awsp) {
      return console.warn('Can\'t move note, no workspace selected');
    }

    const noteIndex = this.state.notes.findIndex((s) => s.id === item.id);

    if (noteIndex < 0) {
      return console.warn(`Couldn't find note to toggle with id "${item.id}"`);
    }

    this.state.notes[noteIndex].workspaceId = awsp.id;
    this.updateState('notes', this.state.notes);
  }
}

export function activate (
  context: vscode.ExtensionContext,
  channel: vscode.OutputChannel
) {
  const stateManager = new NoteExtensionManager(context, channel);

  return {
    marquee: {
      disposable: stateManager,
      defaultState: stateManager.state,
      defaultConfiguration: stateManager.configuration,
      setup: stateManager.setBroadcaster.bind(stateManager)
    }
  };
}
