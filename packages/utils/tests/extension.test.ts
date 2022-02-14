import vscode from 'vscode';
import ExtensionManager from '../src/extension';

const context = {
  globalState: {
    setKeysForSync: jest.fn(),
    get: jest.fn().mockReturnValue({ someRandomConfig: 'foobar' }),
    update: jest.fn()
  }
};

test('generate proper default state and configuration', () => {
  const manager = new ExtensionManager(
    context as any,
    {} as any,
    'widget.todo',
    { defaultConfig: true },
    { defaultState: true }
  );
  expect(manager.configuration).toMatchSnapshot();
  expect(manager.state).toMatchSnapshot();
});

test('should apply old configuration if available', () => {
  context.globalState.get.mockReturnValue({ defaultConfig: 'old config', defaultState: 'old state' });
  const manager = new ExtensionManager(
    context as any,
    {} as any,
    'widget.todo',
    { defaultConfig: true },
    { defaultState: true }
  );
  expect(manager.configuration).toMatchSnapshot();
  expect(manager.state).toMatchSnapshot();
});

test('_onConfigChange', () => {
  const manager = new ExtensionManager(
    context as any,
    { appendLine: jest.fn() } as any,
    'widget.todo',
    { defaultConfig: true },
    { defaultState: true }
  );
  manager['broadcast'] = jest.fn();
  (vscode.workspace.getConfiguration as jest.Mock)
    .mockClear()
    .mockReturnValue({ get: jest.fn().mockReturnValue('some new value') });

  manager['_stopListenOnChangeEvents'] = true;
  const event = { affectsConfiguration: jest.fn() };
  expect(manager['_onConfigChange'](event)).toBe(false);
  expect(event.affectsConfiguration).toBeCalledTimes(0);

  manager['_stopListenOnChangeEvents'] = false;
  event.affectsConfiguration.mockReturnValue(false);
  expect(manager['_onConfigChange'](event)).toBe(true);
  expect(vscode.workspace.getConfiguration).toHaveBeenCalledTimes(0);

  event.affectsConfiguration.mockReturnValue(true);
  expect(manager['_onConfigChange'](event)).toBe(true);
  expect(vscode.workspace.getConfiguration).toHaveBeenCalledTimes(1);
  expect(manager.configuration).toEqual({ defaultConfig: 'some new value' });
  expect(manager['broadcast']).toHaveBeenCalledWith({ defaultConfig: 'some new value' });
});

test('broadcast', () => {
  const manager = new ExtensionManager(
    context as any,
    { appendLine: jest.fn() } as any,
    'widget.todo',
    { defaultConfig: true },
    { defaultState: true }
  );
  manager['broadcast']({ foo: 'bar' } as any);

  const tangle = { broadcast: jest.fn() };
  manager['_tangle'] = tangle as any;
  manager['broadcast']({ bar: 'foo' } as any);
  expect(tangle.broadcast).toBeCalledWith({ bar: 'foo' });
});

test('updateConfiguration', async () => {
  const manager = new ExtensionManager(
    context as any,
    { appendLine: jest.fn() } as any,
    'widget.todo',
    { defaultConfig: true },
    { defaultState: true }
  );
  const waitPromise = new Promise((resolve) => setTimeout(resolve, 100));
  const config = {
    update: jest.fn().mockReturnValue(waitPromise),
    get: jest.fn().mockReturnValue('some new value')
  };

  ;(vscode.workspace.getConfiguration as jest.Mock)
    .mockClear()
    .mockReturnValue(config);
  await manager.updateConfiguration('defaultConfig', 'some other new value' as any);
  expect(manager.configuration.defaultConfig).toBe('some other new value');
  expect(config.update).toBeCalledWith('widget.todo.defaultConfig', 'some other new value', 1);
});

test('updateState', async () => {
  const manager = new ExtensionManager(
    context as any,
    { appendLine: jest.fn() } as any,
    'widget.todo',
    { defaultConfig: true },
    { defaultState: true }
  );
  manager.emit = jest.fn();
  await manager.updateState('defaultState', 'some new state' as any);
  expect(manager.state.defaultState).toBe('some new state');
  expect(manager.emit).toBeCalledWith('stateUpdate', {
    defaultState: 'some new state',
    defaultConfig: 'old config'
  });
});

test('clear', async () => {
  context.globalState.get.mockClear();
  context.globalState.get.mockReturnValue({});
  const config = {
    get: jest.fn().mockReturnValue({}),
    update: jest.fn()
  };

  ;(vscode.workspace.getConfiguration as jest.Mock)
    .mockClear()
    .mockReturnValue(config);
  const manager = new ExtensionManager(
    context as any,
    { appendLine: jest.fn() } as any,
    'widget.todo',
    { defaultConfig: true },
    { defaultState: true }
  );
  manager.emit = jest.fn();

  await manager.updateConfiguration('defaultConfig', 'some other value #2' as any);
  await manager.updateState('defaultState', 'some other state #2' as any);

  expect(manager.configuration).toEqual({ defaultConfig: 'some other value #2' });
  expect(manager.state).toEqual({ defaultState: 'some other state #2' });

  await manager.clear();

  expect(context.globalState.update).toBeCalledWith('persistence', undefined);
  expect(context.globalState.update).toBeCalledWith('widget.todo', { defaultState: true });
  expect(manager.emit).toBeCalledWith('stateUpdate', { defaultState: true });

  expect(config.update).toBeCalledWith('widget.todo', undefined, 1);
  expect(config.update).toBeCalledWith('widget.todo.defaultConfig', true, 1);

  expect(manager.configuration).toEqual({ defaultConfig: true });
  expect(manager.state).toEqual({ defaultState: true });
});

test('getActiveWorkspace', () => {
  const manager = new ExtensionManager(
    context as any,
    { appendLine: jest.fn() } as any,
    'widget.todo',
    { defaultConfig: true },
    { defaultState: true }
  );
  expect(manager.getActiveWorkspace()).toMatchSnapshot();
});

test('getTextSelection', () => {
  const editor = {
    selection: {
      start: { line: 0, character: 1 },
      end: { line: 2, character: 3 }
    },
    document: {
      uri: { path: '/foo/bar' },
      languageId: '42',
      getText: jest.fn().mockReturnValue('foobar')
    }
  };
  const manager = new ExtensionManager(
    context as any,
    { appendLine: jest.fn() } as any,
    'widget.todo',
    { defaultConfig: true },
    { defaultState: true }
  );
  expect(manager.getTextSelection(editor as any)).toMatchSnapshot();
  expect((vscode.Range as jest.Mock).mock.calls).toEqual([[0, 1, 2, 3]]);
});

test('setBroadcaster', () => {
  const tangle = {
    listen: jest.fn().mockReturnValue('a subscription')
  };
  const manager = new ExtensionManager(
    context as any,
    { appendLine: jest.fn() } as any,
    'widget.todo',
    { defaultConfig: true },
    { defaultState: true }
  );
  manager.setBroadcaster(tangle as any);
  expect(tangle.listen).toBeCalledWith('defaultState', expect.any(Function));
  expect(tangle.listen).toBeCalledWith('defaultConfig', expect.any(Function));
  expect(manager['_subscriptions']).toEqual(['a subscription', 'a subscription']);
});

test('generateId', () => {
  const manager = new ExtensionManager(
    context as any,
    { appendLine: jest.fn() } as any,
    'widget.todo',
    { defaultConfig: true },
    { defaultState: true }
  );
  expect(typeof manager.generateId()).toBe('string');
});

test('reset', () => {
  const manager = new ExtensionManager(
    context as any,
    { appendLine: jest.fn() } as any,
    'widget.todo',
    { defaultConfig: true },
    { defaultState: true }
  );
  manager.reset();

  const tangle = { removeAllListeners: jest.fn() };
  const sub = { unsubscribe: jest.fn() };
  manager['_subscriptions'] = [sub];
  manager['_tangle'] = tangle as any;

  manager.reset();

  expect(tangle.removeAllListeners).toHaveBeenCalledTimes(1);
  expect(sub.unsubscribe).toHaveBeenCalledTimes(1);
  expect(typeof manager['_tangle']).toBe('undefined');
});

test('dispose', () => {
  const manager = new ExtensionManager(
    context as any,
    { appendLine: jest.fn() } as any,
    'widget.todo',
    { defaultConfig: true },
    { defaultState: true }
  );

  manager.reset = jest.fn();
  const disposable = { dispose: jest.fn() };
  manager['_disposables'] = [disposable];

  manager.dispose();

  expect(manager.reset).toHaveBeenCalledTimes(1);
  expect(disposable.dispose).toHaveBeenCalledTimes(1);
});
