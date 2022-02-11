import vscode from 'vscode';
import fs from 'fs/promises';

// @ts-expect-error mock
import manager from 'disposableManager';

import StateManager from '../src/stateManager';
import oldConfigFile from './__fixtures__/oldMarqueeConfig.json';

jest.mock('../src/utils', () => ({ activateGUI: () => ({ marquee: { disposable: require('disposableManager') }}) }));
jest.mock('@vscode-marquee/utils/extension', () => ({ activate: () => ({ marquee: { disposable: require('disposableManager') }}) }));
jest.mock('@vscode-marquee/widget-welcome/extension', () => ({ activate: () => ({ marquee: { disposable: require('disposableManager') }}) }));
jest.mock('@vscode-marquee/widget-projects/extension', () => ({ activate: () => ({ marquee: { disposable: require('disposableManager') }}) }));
jest.mock('@vscode-marquee/widget-github/extension', () => ({ activate: () => ({ marquee: { disposable: require('disposableManager') }}) }));
jest.mock('@vscode-marquee/widget-weather/extension', () => ({ activate: () => ({ marquee: { disposable: require('disposableManager') }}) }));
jest.mock('@vscode-marquee/widget-todo/extension', () => ({ activate: () => ({ marquee: { disposable: require('disposableManager') }}) }));
jest.mock('@vscode-marquee/widget-notes/extension', () => ({ activate: () => ({ marquee: { disposable: require('disposableManager') }}) }));
jest.mock('@vscode-marquee/widget-snippets/extension', () => ({ activate: () => ({ marquee: { disposable: require('disposableManager') }}) }));
jest.mock('fs/promises', () => ({
  readFile: jest.fn().mockResolvedValue(JSON.stringify({ foo: 'bar' })),
  writeFile: jest.fn().mockResolvedValue({})
}));

test('StateManager initiation', () => {
  const stateManager = new StateManager('context' as any, 'channel' as any);
  expect(stateManager['_subscriptions']).toMatchSnapshot();
});

test('_import', async () => {
  const stateManager = new StateManager('context' as any, 'channel' as any);
  await stateManager['_import']();
  expect(vscode.window.showErrorMessage).toBeCalledWith(
    'Error importing file: Invalid Marquee Configuration'
  );
});

test('_import transforms old config types', async () => {
  const stateManager = new StateManager({ extensionPath: '/foo/bar' } as any, 'channel' as any);
  (vscode.window.showOpenDialog as jest.Mock).mockResolvedValue([{ fsPath: '/foo/bar' }]);
  (fs.readFile as jest.Mock).mockResolvedValue(JSON.stringify(oldConfigFile));
  await stateManager['_import']();
  expect(manager.updateConfiguration.mock.calls).toMatchSnapshot();
  expect(manager.updateState.mock.calls).toMatchSnapshot();
  expect(manager.emit).toBeCalledWith('gui.close');
  expect(manager.emit).toBeCalledWith('gui.open', true);
});

test('_export', async () => {
  const stateManager = new StateManager({ extensionPath: '/foo/bar' } as any, 'channel' as any);
  (vscode.window.showOpenDialog as jest.Mock).mockResolvedValue([{ fsPath: '/foo/bar' }]);
  (fs.readFile as jest.Mock).mockResolvedValue(JSON.stringify({ version: '1.2.3' }));
  await stateManager['_export']();
  expect((fs.writeFile as jest.Mock).mock.calls).toMatchSnapshot();
  expect(vscode.window.showInformationMessage).toBeCalledWith('Successfully exported Marquee state to /bar/foo');
});

test('_export with error', async () => {
  const stateManager = new StateManager({ extensionPath: '/foo/bar' } as any, 'channel' as any);
  (vscode.window.showOpenDialog as jest.Mock).mockResolvedValue([{ fsPath: '/foo/bar' }]);
  (fs.readFile as jest.Mock).mockRejectedValue(new Error('upps'));
  await stateManager['_export']();
  expect(vscode.window.showErrorMessage).toBeCalledWith('Error writing export file: upps');
});

test('access to individual disposables', () => {
  const stateManager = new StateManager({ extensionPath: '/foo/bar' } as any, 'channel' as any);
  expect(stateManager.projectWidget).toEqual(manager);
  expect(stateManager.notesWidget).toEqual(manager);
  expect(stateManager.todoWidget).toEqual(manager);
  expect(stateManager.snippetsWidget).toEqual(manager);
  expect(stateManager.global).toEqual(manager);
});

test('clearAll', async () => {
  const stateManager = new StateManager({ extensionPath: '/foo/bar' } as any, 'channel' as any);
  await stateManager.clearAll();
  expect(manager.clear).toBeCalledTimes(9);
  expect(manager.dispose).toBeCalledTimes(9);
});

test('onWidget', () => {
  const stateManager = new StateManager({ extensionPath: '/foo/bar' } as any, 'channel' as any);
  stateManager.onWidget('foobar', () => {});
  expect(manager.on).toBeCalledTimes(9);
  expect(manager.on).toBeCalledWith('foobar', expect.any(Function));
});

test('dispose', async () => {
  const stateManager = new StateManager({ extensionPath: '/foo/bar' } as any, 'channel' as any);
  stateManager['_subscriptions'] = [{ dispose: jest.fn() }];
  await stateManager.dispose();
  expect(stateManager['_subscriptions'][0].dispose).toBeCalledTimes(1);
});
