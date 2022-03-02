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
