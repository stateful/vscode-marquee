import vscode from "vscode";

import ExtensionManager, {
  activate as activateUtils,
  State as GlobalState,
  Configuration as GlobalConfiguration
} from '@vscode-marquee/utils/extension';
import { activate as activateWelcomeWidget } from '@vscode-marquee/widget-welcome/extension';
import { activate as activateProjectsWidget, ProjectsExtensionManager } from '@vscode-marquee/widget-projects/extension';
import { activate as activateGitHubWidget } from '@vscode-marquee/widget-github/extension';
import { activate as activateWeatherWidget } from '@vscode-marquee/widget-weather/extension';
import { activate as activateTodoWidget, TodoExtensionManager } from '@vscode-marquee/widget-todo/extension';
import { activate as activateNotesWidget, NoteExtensionManager } from '@vscode-marquee/widget-notes/extension';
import { activate as activateSnippetsWidget, SnippetExtensionManager } from '@vscode-marquee/widget-snippets/extension';

import { activateGUI } from './utils';
import type { ExtensionExport } from './types';

const MARQUEE_WIDGETS = {
  '@vscode-marquee/utils': activateUtils,
  '@vscode-marquee/gui': activateGUI,
  '@vscode-marquee/welcome-widget': activateWelcomeWidget,
  '@vscode-marquee/projects-widget': activateProjectsWidget,
  '@vscode-marquee/github-widget': activateGitHubWidget,
  '@vscode-marquee/weather-widget': activateWeatherWidget,
  '@vscode-marquee/todo-widget': activateTodoWidget,
  '@vscode-marquee/notes-widget': activateNotesWidget,
  '@vscode-marquee/snippets-widget': activateSnippetsWidget
};

export default class StateManager implements vscode.Disposable {
  public readonly widgetExtensions: vscode.Extension<ExtensionExport>[] = Object.entries(MARQUEE_WIDGETS).map(
    ([id, activate]) => ({
      id,
      exports: activate(this._context, this._channel),
      isActive: true,
      packageJSON: { marqueeWidget: true }
    } as any as vscode.Extension<ExtensionExport>)
  );

  /**
   * widget subscriptions
   */
  private _subscriptions: vscode.Disposable[] = this.widgetExtensions.map(
    (ex) => ex.exports.marquee.disposable);

  constructor (
    private readonly _context: vscode.ExtensionContext,
    private readonly _channel: vscode.OutputChannel
  ) {}

  get projectWidget () {
    return this.widgetExtensions.find(
      (e) => e.id === '@vscode-marquee/projects-widget'
    )?.exports.marquee.disposable as ProjectsExtensionManager;
  }

  get notesWidget () {
    return this.widgetExtensions.find(
      (e) => e.id === '@vscode-marquee/notes-widget'
    )?.exports.marquee.disposable as NoteExtensionManager;
  }

  get todoWidget () {
    return this.widgetExtensions.find(
      (e) => e.id === '@vscode-marquee/todo-widget'
    )?.exports.marquee.disposable as TodoExtensionManager;
  }

  get snippetsWidget () {
    return this.widgetExtensions.find(
      (e) => e.id === '@vscode-marquee/snippets-widget'
    )?.exports.marquee.disposable as SnippetExtensionManager;
  }

  get global () {
    return this.widgetExtensions.find(
      (e) => e.id === '@vscode-marquee/utils'
    )?.exports.marquee.disposable as ExtensionManager<GlobalState, GlobalConfiguration>;
  }

  /**
   * clear state and configuration of all Marquee widgets
   */
  clearAll () {
    for (const widget of this.widgetExtensions) {
      widget.exports.marquee.disposable.dispose();
    }
  }

  dispose() {
    this._subscriptions.forEach((s) => s.dispose());
  }
}

/**
 * Todo: implement export/import
 */
// disposables.push(
//   vscode.commands.registerCommand("marquee.jsonImport", () => {
//     this.wipe();
//     vscode.window
//       .showOpenDialog({
//         canSelectFiles: true,
//         canSelectFolders: false,
//         canSelectMany: false,
//         openLabel: 'Import',
//         filters: FILE_FILTER,
//         title: 'Import Marquee Extension',
//       })
//       .then((importPath) => {
//         const filePath = (importPath || [])[0];

//         if (!filePath) {
//           return;
//         }

//         try {
//           const importJSON = readFileSync(filePath.fsPath);
//           const obj = JSON.parse(importJSON.toString());

//           /**
//            * ToDo(Christian): use "type" property to detect valid marquee extension
//            * once everyone has updated
//            */
//           if (!obj.version) {
//             throw new Error('Invalid Marquee Configuration');
//           }

//           this.context.globalState
//             .update(persistenceKey, obj)
//             .then(() => {
//               vscode.window.showInformationMessage(
//                 `Successfully imported Marquee state from ${filePath.path}`
//               );
//               return this.openGui();
//             });
//         } catch (err: any) {
//           vscode.window.showErrorMessage(
//             `Error importing file marquee-export.json: ${err.message}`
//           );
//           return this.openGui();
//         }
//       });
//   })
// );

// disposables.push(
//   vscode.commands.registerCommand("marquee.jsonExport", () => {
//     const json = this._stateMgr.clearAll();

//     const {
//       autoDetect,
//       bg,
//       language,
//       name,
//       notes,
//       read,
//       since,
//       snippets,
//       spoken,
//       todos,
//       version,
//       workspaces,
//     } = json;

//     const jsonExport = {
//       type: CONFIG_FILE_TYPE,
//       autoDetect,
//       bg,
//       language,
//       name,
//       notes,
//       read,
//       since,
//       snippets,
//       spoken,
//       todos,
//       version,
//       workspaces,
//     };

//     vscode.window
//       .showSaveDialog({
//         saveLabel: 'Export',
//         filters: FILE_FILTER,
//         title: 'Export Marquee Extension',
//       })
//       .then((exportPath) => {
//         if (!exportPath) {
//           return;
//         }

//         const efile = exportPath?.fsPath;
//         try {
//           writeFileSync(efile, JSON.stringify(jsonExport, null, 1));
//           vscode.window.showInformationMessage(
//             `Successfully exported Marquee state to ${efile}`
//           );
//         } catch (err: any) {
//           vscode.window.showErrorMessage(
//             `Error writing export file marquee-export.json: ${err.message}`
//           );
//         }
//       });
//   })
// );
