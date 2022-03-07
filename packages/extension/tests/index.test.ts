// @ts-expect-error mock
import { sendTelemetryEvent } from '@vscode/extension-telemetry';

import { activate, deactivate } from '../src';

jest.mock('../src/extension.ts', () => ({
  MarqueeExtension: class {}
}));

jest.mock('@vscode-marquee/utils/extension', () => ({
  getExtProps: jest.fn().mockReturnValue({ some: 'props' }),
  pkg: { version: '1.2.3' }
}));

jest.useFakeTimers();

test('should activate extension manager', () => {
  let exp = activate('context' as any);
  expect(sendTelemetryEvent).toBeCalledWith('extensionActivate', expect.any(Object));

  expect(typeof exp.marquee).toBe('undefined');

  process.env.NODE_ENV = 'development';
  exp = activate('context' as any);
  const client = { emit: jest.fn() };
  exp.marquee!.setup(client as any);

  jest.advanceTimersByTime(2000);
  expect(client.emit).toBeCalledWith('counter', 1);
});

test('should deactivate extension', () => {
  deactivate();
  expect(sendTelemetryEvent).toBeCalledWith('extensionDeactivate');
});
