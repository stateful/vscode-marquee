import React from 'react';
import userEvent from '@testing-library/user-event';
import { render } from '@testing-library/react';

import ThemeDialog from "../../src/dialogs/ThemeDialog";
import { GlobalProvider } from '@vscode-marquee/utils';

jest.mock('../../../utils/src/contexts/Global');
jest.mock('../../src/utils/backgrounds', () => jest.fn((bg) => bg));

test('should render component properly', () => {
  const close = jest.fn();
  const { getByText } = render(
    <GlobalProvider>
      <ThemeDialog close={close} />
    </GlobalProvider>
  );
  userEvent.click(getByText('Close'));
  expect(close).toBeCalledTimes(1);
});
