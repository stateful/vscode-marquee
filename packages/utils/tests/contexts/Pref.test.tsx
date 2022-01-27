import React, { useContext } from 'react';
import { act } from 'react-dom/test-utils';
import { render } from '@testing-library/react';

import PrefContext, { PrefProvider } from '../../src/contexts/Pref';

let _bg: any;
let _name: any;
let _themeColor: any;
let _widgetFilter: any;
let _updateName: any;
let _updateBg: any;
let _updateWidgetFilter: any;

test('WidgetLayout filters non display widgets', () => {
  const TestComponent = () => {
    const { bg, name, widgetFilter, themeColor, updateBg, updateName, updateWidgetFilter } = useContext(PrefContext);
    _bg = bg;
    _name = name;
    _widgetFilter = widgetFilter;
    _themeColor = themeColor;
    _updateBg = updateBg;
    _updateName = updateName;
    _updateWidgetFilter = updateWidgetFilter;

    return (<div>Hello World</div>);
  };

  render(<PrefProvider><TestComponent /></PrefProvider>);
  expect(_bg).toBe(1);

  act(() => { _updateBg(2); });
  expect(_bg).toBe(2);

  expect(_name).toBe('name here...');
  act(() => { _updateName('foobar'); });
  expect(_name).toBe('foobar');

  expect(_widgetFilter).toBe('');
  act(() => { _updateWidgetFilter('foobar'); });
  expect(_widgetFilter).toBe('foobar');

  expect(_themeColor).toEqual({a: 0.8, b: 0, g: 0, r: 0 });
});
