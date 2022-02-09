import React from 'react';
import { render } from '@testing-library/react';

import wrapper from '../src/WidgetWrapper';

test('should fail gracefully on error', () => {
  const dragHandle = <div>DragHandle</div>;
  const Widget = wrapper((...props: any[]) => {
    throw new Error('ups');
    return <div {...props}>hello world</div>;
  });
  const { queryByText } = render(
    // @ts-expect-error
    <Widget name="testWidget" dragHandle={dragHandle} />
  );
  expect(queryByText('hello world')).not.toBeTruthy();
});
