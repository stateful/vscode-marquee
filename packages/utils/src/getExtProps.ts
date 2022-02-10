import os from "os";
import vscode from "vscode";

import { pkg } from './constants';

const EXTENSION_ID = "stateful.marquee";
const TELEMETRY_CONFIG_ID = "telemetry";
const TELEMETRY_CONFIG_ENABLED_ID = "enableTelemetry";

export default function getExtProps(): { [key: string]: string } {
  const extProps = Object.create(null);

  const config = vscode.workspace.getConfiguration(TELEMETRY_CONFIG_ID);
  if (!config.get<boolean>(TELEMETRY_CONFIG_ENABLED_ID, true)) {
    return extProps;
  }

  extProps["os"] = os.platform();
  extProps["platformversion"] = (os.release() || "").replace(
    /^(\d+)(\.\d+)?(\.\d+)?(.*)/,
    "$1$2$3"
  );
  extProps["extname"] = EXTENSION_ID;
  extProps["extversion"] = pkg.version;
  if (vscode && vscode.env) {
    extProps["vscodemachineid"] = vscode.env.machineId;
    extProps["vscodesessionid"] = vscode.env.sessionId;
    extProps["vscodeversion"] = vscode.version;

    switch (vscode.env.uiKind) {
      case vscode.UIKind.Web:
        extProps["uikind"] = "web";
        break;
      case vscode.UIKind.Desktop:
        extProps["uikind"] = "desktop";
        break;
      default:
        extProps["uikind"] = "unknown";
    }
  }
  return extProps;
}
