import React from 'react';
import userEvent from '@testing-library/user-event';
import { render } from '@testing-library/react';
// @ts-expect-error mock import
import { PrefProvider, updateWidgetFilter } from '@vscode-marquee/utils';

import WidgetFilter from '../../src/components/WidgetFilter';

test('renders component correctly', async () => {
  const { getByPlaceholderText, container } = render(<PrefProvider>
    <WidgetFilter />
  </PrefProvider>);

  userEvent.type(getByPlaceholderText('Search for widgets...'), 'foobar');
  await new Promise((resolve) => setTimeout(resolve, 1000));
  expect(updateWidgetFilter).toBeCalledWith('widgetFilterfoobar');

  userEvent.click(container.querySelector('svg')!);
  expect(updateWidgetFilter).toBeCalledTimes(2);
  expect(updateWidgetFilter).toBeCalledWith('');
});
