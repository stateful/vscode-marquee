import React from 'react';
import { render } from '@testing-library/react';
import { ModeProvider } from '../../src/contexts/ModeContext';
import ModeTabPop from '../../src/components/ModeTabPop';

jest.mock('../../src/contexts/ModeContext');
jest.mock('../../src/dialogs/ModeEditDialog', () => ({
  ModeEditDialog: () => <div>ModeEditDialog</div>
}));

test('should render component correctly', async () => {
  const { getByText } = render(
    <ModeProvider>
      <ModeTabPop name="work">
        <div>some foobar children</div>
      </ModeTabPop>
    </ModeProvider>
  );
  expect(getByText('some foobar children')).toBeTruthy();
});
