import React from 'react';
import userEvent from '@testing-library/user-event';
import { render } from '@testing-library/react';
import { PrefProvider } from '@vscode-marquee/utils';

import InfoDialog from "../../src/dialogs/InfoDialog";

jest.mock('../../src/img/powered_by_google_on_non_white.png', () => {});
jest.mock('../../src/img/powered_by_google_on_white.png', () => {});

test('should render component properly', () => {
  const close = jest.fn();
  const { getByText } = render(<PrefProvider><InfoDialog close={close} /></PrefProvider>);
  userEvent.click(getByText('Close'));
  expect(close).toBeCalledTimes(1);
  expect(getByText('Lago di Garda, Italy - contributed by Jan Delay'))
    .toBeTruthy();
});
