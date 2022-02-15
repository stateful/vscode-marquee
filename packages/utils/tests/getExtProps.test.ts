import { getExtProps } from '../src/getExtProps';

jest.mock('../src/constants', () => ({
  pkg: { version: '1.2.3' }
}));
jest.mock('os', () => ({
  platform: () => 'some platform',
  release: () => 'some release'
}));
jest.mock('vscode', () => ({
  workspace: { getConfiguration: jest.fn().mockReturnValue(new Map([
    ['enableTelemetry', true]
  ])) },
  env: {
    machineId: 'machineId',
    sessionId: 'sessionId',
    uiKind: 'uiKind'
  },
  version: '3.2.1',
  UIKind: { Web: 'uiKind' }
}));

test('should get proper extension props', () => {
  expect(getExtProps()).toMatchSnapshot();
});
