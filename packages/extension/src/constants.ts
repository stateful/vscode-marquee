import vscode from 'vscode';

export const DEFAULT_FONT_SIZE = 5;

export const RETRY = 4 * 1000;
export const INIT = 50;
export const config = vscode.workspace.getConfiguration('marquee');
export const FILE_FILTER = { 'Marquee Settings': ['json'] };
export const CONFIG_FILE_TYPE = 'MarqueeSettings';
export const THIRD_PARTY_EXTENSION_DIR = '3rdParty';
