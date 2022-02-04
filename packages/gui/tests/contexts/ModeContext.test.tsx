import React, { useContext } from 'react';
import { act } from 'react-dom/test-utils';
import { render } from '@testing-library/react';
import type { MarqueeWindow } from '@vscode-marquee/utils';
import { faBrain } from "@fortawesome/free-solid-svg-icons/faBrain";

import ModeContext, { ModeProvider } from '../../src/contexts/ModeContext';

declare const window: MarqueeWindow;

let _thirdPartyWidgets: any;
let _widgets: any;
let _modeName: any;
let _prevMode: any;
let _modes: any;
let __addMode: any;
let __removeMode: any;
let __resetModes: any;

test('WidgetLayout filters non display widgets', () => {
  expect(window.marqueeExtension).not.toBeTruthy();
  const TestComponent = () => {
    const { widgets, thirdPartyWidgets, modes, _resetModes, _removeMode, _addMode } = useContext(ModeContext);
    _thirdPartyWidgets = thirdPartyWidgets;
    _widgets = widgets;
    _modes = modes;
    __addMode = _addMode;
    __removeMode = _removeMode;
    __resetModes = _resetModes;
    return (<div>Hello World</div>);
  };

  render(<ModeProvider><TestComponent /></ModeProvider>);
  expect(window.marqueeExtension).toBeTruthy();
  expect(typeof window.marqueeExtension.defineWidget).toBe('function');

  expect(_thirdPartyWidgets).toHaveLength(0);
  act(() => {
    window.marqueeExtension.defineWidget({
      name: 'foo-bar',
      icon: faBrain,
      label: 'some label',
      tags: ['some', 'tags'],
      description: 'some description'
    }, class Foobar extends HTMLElement {});
  });
  expect(_thirdPartyWidgets).toHaveLength(1);
  expect(_widgets['foo-bar']).toBeTruthy();

  // act(() => { __setModeName('work'); });
  expect(_modeName).toBe('work');
  expect(_prevMode).toBe(null);

  act(() => { __addMode('foobar', null); });
  expect(_modes).toMatchSnapshot();

  act(() => { __removeMode('foobar'); });
  expect(_modeName).toBe('work');
  expect(_modes).toEqual({});

  act(() => { __resetModes(); });
  expect(_modeName).toBe('default');
});
