import React from 'react';
import { act } from 'react-dom/test-utils';
import { render, screen } from '@testing-library/react';
import { getEventListener, MarqueeEvents } from '@vscode-marquee/utils';

// @ts-expect-error mock import
import { ModeProvider, _removeModeWidget } from '../src/contexts/ModeContext';
import Container, { WidgetLayout } from '../src/Container';
import modeConfig from '../src/contexts/__mocks__/modeConfig.json';
import { GlobalProvider } from '@vscode-marquee/utils';

jest.mock('../../utils/src/contexts/Global');
jest.mock('../src/utils/backgrounds', () => jest.fn((bg) => bg));
jest.mock('../src/contexts/ModeContext');
jest.mock('../src/components/Navigation', () => () => (
  <div role="Navigation">Navigation</div>
));
jest.mock('../src/dialogs/SettingsDialog', () => () => (
  <div role="SettingsDialog">SettingsDialog</div>
));

test('WidgetLayout filters non display widgets', () => {
  modeConfig.default.widgets['welcome'] = false;
  render(
    <ModeProvider>
      <GlobalProvider>
        <WidgetLayout />
      </GlobalProvider>
    </ModeProvider>
  );

  expect(screen.getByText('Example Widget #1')).toBeTruthy();
  expect(screen.getByText('Example Widget #3')).toBeTruthy();
});

test('Container', () => {
  const l = getEventListener<MarqueeEvents>();
  const { container } = render(
    <ModeProvider>
      <GlobalProvider>
        <Container />
      </GlobalProvider>
    </ModeProvider>
  );
  expect(screen.getAllByText('Navigation')).toHaveLength(2);
  expect(screen.queryByRole('SettingsDialog')).not.toBeTruthy();
  expect(_removeModeWidget).toBeCalledTimes(0);

  act(() => {
    l.emit('openSettings', undefined as never);
  });
  expect(screen.queryByRole('SettingsDialog')).toBeTruthy();

  act(() => {
    l.emit('removeWidget', 'news');
  });
  expect(_removeModeWidget).toBeCalledTimes(1);
  expect(container.querySelector('.appContainer')?.getAttribute('style'))
    .toContain('background-image: url(./4.jpg)');
});
