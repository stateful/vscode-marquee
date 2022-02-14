import React from 'react';
import userEvent from '@testing-library/user-event';
import { render } from '@testing-library/react';

import ThemeDialog from "../../src/dialogs/ThemeDialog";
// @ts-expect-error
import { GlobalProvider, setBackground } from '@vscode-marquee/utils';

jest.mock('../../../utils/src/contexts/Global');
jest.mock('../../src/utils/backgrounds', () => jest.fn((bg) => bg));

test('should render component properly', () => {
  const close = jest.fn();
  const { getByText, container } = render(
    <GlobalProvider>
      <ThemeDialog close={close} />
    </GlobalProvider>
  );
  userEvent.click(getByText('Close'));
  expect(close).toBeCalledTimes(1);

  userEvent.click(container.querySelectorAll('.MuiTypography-body2')[7]);
  expect(setBackground).toBeCalledWith('8');
});
