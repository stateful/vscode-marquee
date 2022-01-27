import React, { useContext } from 'react';
import { act } from 'react-dom/test-utils';
import { render } from '@testing-library/react';

import GlobalContext, { GlobalProvider } from '../../src/contexts/Global';

let _workspaces: any;
let _globalScope: any;
let __updateGlobalScope: any;

test('WidgetLayout filters non display widgets', () => {
  const TestComponent = () => {
    const { workspaces, globalScope, _updateGlobalScope } = useContext(GlobalContext);
    _workspaces = workspaces;
    _globalScope = globalScope;
    __updateGlobalScope = _updateGlobalScope;
    return (<div>Hello World</div>);
  };

  render(<GlobalProvider><TestComponent /></GlobalProvider>);

  expect(_workspaces).toEqual([]);
  expect(_globalScope).toBe(true);

  act(() => { __updateGlobalScope(false); });
  expect(_globalScope).toBe(false);
});
