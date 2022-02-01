import '@testing-library/jest-dom/extend-expect';

// @ts-expect-error
window.acquireVsCodeApi = jest.fn();

// @ts-expect-error
global.__requireContext = jest.fn();
require.context = jest.fn();

const styles = {
  '--vscode-font-size': '13px',
  '--vscode-icon-foreground': '#c5c5c5',
  '--vscode-foreground': '#cccccc',
  '--vscode-editor-background': '#1e1e1e',
  '--vscode-sideBar-background': '#252526',
  '--vscode-button-background': ' #0e639c',
  '--vscode-button-hoverBackground': '#1177bb',
  '--vscode-button-foreground': '#ffffff',
  '--vscode-editorMarkerNavigationError-background': '#f14c4c',
  '--vscode-editor-selectionBackground': '#264f78',
  '--vscode-editor-hoverHighlightBackground': 'rgba(38, 79, 120, 0.25)',
  '--vscode-editor-inactiveSelectionBackground': '#3a3d41',
  '--vscode-font-family': '-apple-system, BlinkMacSystemFont, sans-serif',
  '--vscode-font-weight': 'normal',
};

for (const [prop, val] of Object.entries(styles)) {
  document.documentElement.style.setProperty(prop, val);
}
