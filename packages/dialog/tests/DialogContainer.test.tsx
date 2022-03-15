import React from 'react';
import { render, screen } from '@testing-library/react';

import { DialogContainer } from '../src';

test('should render component', () => {
  render(<DialogContainer>Foobar</DialogContainer>);
  expect(screen.getByRole('presentation')).toHaveStyle({
    position: 'fixed',
    zIndex: 1300
  });
  expect(screen.getByRole('dialog'))
    .not.toHaveClass('.MuiDialog-paperFullScreen');
});

test('should display in full screen mode', () => {
  render(<DialogContainer fullScreen={true}>Foobar</DialogContainer>);
  expect(screen.getByRole('dialog'))
    .toHaveClass('MuiDialog-paperFullScreen');
});
