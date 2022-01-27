import React from 'react';
import { render } from '@testing-library/react';

import { DoubleClickHelper } from '../../src';

test('should show no options', () => {
  const { getByTitle } = render(<DoubleClickHelper content="foobar" />);
  expect(getByTitle('foobar')).toBeTruthy();
});
