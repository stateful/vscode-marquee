import React from 'react';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';

import FeedbackDialog from "../../src/dialogs/FeedbackDialog";

import { sendFeedbackRequest } from '../../src/utils';

jest.mock('../../src/utils', () => ({
  sendFeedbackRequest: jest.fn().mockResolvedValue({})
}));

test('should render component and handle user input properly', async () => {
  const close = jest.fn();
  render(<FeedbackDialog close={close} />);

  expect(screen.getByText('Send us a quick note')).toBeTruthy();
  expect(sendFeedbackRequest).toBeCalledTimes(0);

  userEvent.click(screen.getByText('Send'));
  const textarea = screen.getByPlaceholderText('Feedback here...');
  expect(textarea.parentElement?.className).toContain('Mui-error');
  expect(sendFeedbackRequest).toBeCalledTimes(0);

  userEvent.type(textarea, 'foobar');
  expect(textarea.parentElement?.className).not.toContain('Mui-error');
  expect(sendFeedbackRequest).toBeCalledTimes(0);

  userEvent.click(screen.getByText('Send'));
  const emailInput = screen.getByPlaceholderText('you@you.com');
  expect(emailInput.parentElement?.className).toContain('Mui-error');
  expect(sendFeedbackRequest).toBeCalledTimes(0);

  userEvent.type(emailInput, 'me@you.de');
  expect(emailInput.parentElement?.className).not.toContain('Mui-error');
  userEvent.click(screen.getByText('Send'));
  expect(sendFeedbackRequest).toBeCalledTimes(1);
  expect(sendFeedbackRequest).toBeCalledWith('foobar', 'me@you.de');

  await new Promise((resolve) => setTimeout(resolve, 10));
  expect(close).toBeCalledTimes(1);

  (sendFeedbackRequest as jest.Mock).mockRejectedValue(new Error('upsii'));
  userEvent.click(screen.getByText('Send'));
  await new Promise((resolve) => setTimeout(resolve, 10));
  expect(screen.getByText((text: string) => text.includes('upsii'))).toBeTruthy();
});
