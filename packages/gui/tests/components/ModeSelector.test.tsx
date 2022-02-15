import React from 'react';
import userEvent from '@testing-library/user-event';
import { render } from '@testing-library/react';
import ModeSelector from '../../src/components/ModeSelector';

jest.mock('../../src/dialogs/ModeDialog', () => () => <div>ModeDialog</div>);

test('should render component correctly', () => {
  const { getByLabelText } = render(
    <ModeSelector />
  );

  // expect(_setModeName).toBeCalledTimes(0);
  userEvent.click(getByLabelText('Set Mode').querySelector('span')!);
  // expect(_setModeName).toBeCalledWith('play');
});
