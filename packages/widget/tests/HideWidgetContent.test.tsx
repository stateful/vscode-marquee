import React from 'react';
import userEvent from '@testing-library/user-event';
import { render } from '@testing-library/react';

import { getEventListener, MarqueeEvents } from '@vscode-marquee/utils';

import { HideWidgetContent } from '../src';

test('should emit events properly', () => {
  const listener = getEventListener<MarqueeEvents>();
  const onOpenSettings = jest.fn();
  const onRemoveWidget = jest.fn();
  listener.on('openSettings', onOpenSettings);
  listener.on('removeWidget', onRemoveWidget);
  const { getByText, container } = render(<HideWidgetContent name="foobar" />);
  expect(getByText('Can be undone in')).toBeTruthy();

  expect(onRemoveWidget).toBeCalledTimes(0);
  userEvent.click(getByText('Hide this widget'));
  expect(onRemoveWidget).toBeCalledTimes(1);

  expect(onOpenSettings).toBeCalledTimes(0);
  userEvent.click(container.querySelector('svg')!);
  expect(onOpenSettings).toBeCalledTimes(1);
});
