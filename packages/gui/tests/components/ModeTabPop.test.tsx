import React from 'react';
import { render } from '@testing-library/react';
import ModeTabPop from '../../src/components/ModeTabPop';

jest.mock('../../src/dialogs/ModeEditDialog', () => ({
  ModeEditDialog: () => <div>ModeEditDialog</div>
}));

test('should render component correctly', async () => {
  const { getByText } = render(
    <ModeTabPop name="work">
      <div>some foobar children</div>
    </ModeTabPop>
  );
  expect(getByText('some foobar children')).toBeTruthy();
});
