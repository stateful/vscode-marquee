import React, { useContext } from 'react';
import { render } from '@testing-library/react';

import GlobalContext, { GlobalProvider } from '../../src/contexts/Global';

let _globalScope: any;

test('WidgetLayout filters non display widgets', () => {
  const TestComponent = () => {
    const { globalScope } = useContext(GlobalContext);
    _globalScope = globalScope;
    return (<div>Hello World</div>);
  };

  render(<GlobalProvider><TestComponent /></GlobalProvider>);
  expect(_globalScope).toBe(true);
});
