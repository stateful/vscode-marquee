import React from 'react';
import userEvent from '@testing-library/user-event';
import { render } from '@testing-library/react';
import { PrefProvider } from '@vscode-marquee/utils';

import ThemeDialog from "../../src/dialogs/ThemeDialog";

jest.mock('../../src/utils/backgrounds', () => jest.fn((bg) => bg));

test('should render component properly', () => {
  const close = jest.fn();
  const { getByText } = render(<PrefProvider><ThemeDialog close={close} /></PrefProvider>);
  userEvent.click(getByText('Close'));
  expect(close).toBeCalledTimes(1);
});
