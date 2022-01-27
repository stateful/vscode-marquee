import React from 'react';
import userEvent from '@testing-library/user-event';
import { render } from '@testing-library/react';

import { TrendProvider } from "../../src/Context";
import TrendingDialogLauncher from '../../src/components/TrendingDialog';

const fetchOrig = window.fetch;
beforeEach(() => {
  window.fetch = jest.fn().mockResolvedValue({
    ok: 1,
    json: () => []
  });
});

test.only('renders component correctly', async () => {
  const { container, getByText, getAllByText } = render(
    <TrendProvider>
      <TrendingDialogLauncher />
    </TrendProvider>
  );
  userEvent.click(container.querySelector('button')!);
  expect(getAllByText('Selection...')).toHaveLength(2);
  expect(getByText('Since...')).toBeTruthy();
});

afterAll(() => {
  window.fetch = fetchOrig;
});
