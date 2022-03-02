import os from 'os';
import vscode from 'vscode';
import ExtensionManager, { pkg, defaultConfigurations } from '@vscode-marquee/utils/extension';
import { EXTENSION_ID } from './constants';

export const isExpanded = (id: number): vscode.TreeItemCollapsibleState => {
  const found = [0, 1, 2, 3].filter((item: number) => id === item).length > 0;

  if (found) {
    return vscode.TreeItemCollapsibleState.Expanded;
  }

  return vscode.TreeItemCollapsibleState.Collapsed;
};

export const filterByScope = <T>(
  obj: T[],
  aws: null | { id: string },
  globalScope: boolean
) => {
  return obj.filter((n: any) => globalScope || (aws && aws.id === n.workspaceId));
};

export const DEFAULT_STATE = {
  modeName: 'default',
  prevMode: null
};

export const DEFAULT_CONFIGURATION = {
  modes: defaultConfigurations['marquee.configuration.modes'].default,
  proxy: defaultConfigurations['marquee.configuration.proxy'].default,
  fontSize: defaultConfigurations['marquee.configuration.fontSize'].default,
  launchOnStartup: defaultConfigurations['marquee.configuration.launchOnStartup'].default,
  workspaceLaunch: defaultConfigurations['marquee.configuration.workspaceLaunch'].default,
  colorScheme: undefined
};

export function activateGUI (
  context: vscode.ExtensionContext,
  channel: vscode.OutputChannel
) {
  const stateManager = new ExtensionManager<{}, {}>(context, channel, 'configuration', DEFAULT_CONFIGURATION, DEFAULT_STATE);

  return {
    marquee: {
      disposable: stateManager,
      defaultState: stateManager.state,
      defaultConfiguration: stateManager.configuration,
      setup: stateManager.setBroadcaster.bind(stateManager)
    }
  };
}

export const linkMarquee = async (item: any) => {
  let file = item?.item?.origin;

  if (!file) {
    return;
  }

  let splt = file.split(":");
  let ln = "1";
  if (splt.length > 2) {
    ln = splt[splt.length - 1];
    splt = splt.splice(0, splt.length - 1);
    file = splt.join(":");
  } else if (splt.length > 1) {
    [file, ln] = splt;
  }
  const rpath = vscode.Uri.parse(file).fsPath;
  const doc = await vscode.workspace.openTextDocument(rpath);
  if (!doc) {
    return;
  }

  const editor = await vscode.window.showTextDocument(doc);
  const r = doc.lineAt(parseInt(ln)).range;
  if (!editor || !r) {
    return;
  }

  editor.revealRange(r, vscode.TextEditorRevealType.InCenter);
};

export function getExtProps() {
  const extProps: Record<string, string> = {};

  if (globalThis.process) {
    extProps.os = os.platform();
    extProps.platformversion = (os.release() || "").replace(
      /^(\d+)(\.\d+)?(\.\d+)?(.*)/,
      "$1$2$3"
    );
  }

  extProps.extname = EXTENSION_ID;
  extProps.extversion = pkg.version;
  if (vscode && vscode.env) {
    extProps.vscodemachineid = vscode.env.machineId;
    extProps.vscodesessionid = vscode.env.sessionId;
    extProps.vscodeversion = vscode.version;

    switch (vscode.env.uiKind) {
      case vscode.UIKind.Web:
        extProps.uikind = "web";
        break;
      case vscode.UIKind.Desktop:
        extProps.uikind = "desktop";
        break;
      default:
        extProps.uikind = "unknown";
    }
  }
  return extProps;
}
