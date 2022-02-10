import os from "os";
import fs from 'fs';
import path from 'path';
import vscode from "vscode";

const EXTENSION_ID = "stateful.marquee";
const TELEMETRY_CONFIG_ID = "telemetry";
const TELEMETRY_CONFIG_ENABLED_ID = "enableTelemetry";

export function getMarqueeVersion (context: vscode.ExtensionContext) {
  const extensionPath = path.join(context.extensionPath, "package.json");
  const packageFile = fs.readFileSync(extensionPath, "utf-8");
  const packageJson = JSON.parse(packageFile);
  return packageJson.version;
}

export default function getExtProps(context: vscode.ExtensionContext): { [key: string]: string } {
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
  extProps["extversion"] = getMarqueeVersion(context);
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
