import React from 'react';
import { render } from '@testing-library/react';
import { PrefProvider } from '@vscode-marquee/utils';

import wrapper from '../src/components/WidgetWrapper';

test('should fail gracefully on error', () => {
  const dragHandle = <div>DragHandle</div>;
  const Widget = wrapper((...props: any[]) => {
    throw new Error('ups');
    return <div {...props}>hello world</div>;
  });
  const { queryByText } = render(
    <PrefProvider>
      {/* @ts-expect-error */}
      <Widget name="testWidget" dragHandle={dragHandle} />
    </PrefProvider>
  );
  expect(queryByText('hello world')).not.toBeTruthy();
});
