const actualExport = jest.requireActual('../../../../src/extension');

export default class ExtensionManagerMock {
  on = jest.fn();
  emit = jest.fn();
  updateState = jest.fn();
  broadcast = jest.fn();
  getActiveWorkspace = jest.fn().mockReturnValue(null);
  getTextSelection = jest.fn().mockReturnValue({});
  generateId = jest.fn().mockReturnValue('123457890');
  setBroadcaster = jest.fn();
  _disposables = [];
  state = {};
}

export const WorkspaceType = actualExport.WorkspaceType;
export const pkg = actualExport.pkg;
export const defaultConfigurations = actualExport.defaultConfigurations;
export const DEFAULT_STATE = actualExport.DEFAULT_STATE;
export const DEFAULT_CONFIGURATION = actualExport.DEFAULT_CONFIGURATION;
