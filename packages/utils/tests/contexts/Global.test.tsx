import React, { useContext } from 'react';
import { act } from 'react-dom/test-utils';
import { render } from '@testing-library/react';

import GlobalContext, { GlobalProvider } from '../../src/contexts/Global';

let _globalScope: any;
let _setGlobalScope: any;

test('WidgetLayout filters non display widgets', () => {
  const TestComponent = () => {
    const { globalScope, setGlobalScope } = useContext(GlobalContext);
    _globalScope = globalScope;
    _setGlobalScope = setGlobalScope;
    return (<div>Hello World</div>);
  };

  render(<GlobalProvider><TestComponent /></GlobalProvider>);
  expect(_globalScope).toBe(true);

  act(() => { _setGlobalScope(false); });
  expect(_globalScope).toBe(false);
});
