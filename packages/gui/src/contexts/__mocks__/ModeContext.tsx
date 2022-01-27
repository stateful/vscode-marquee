import React from 'react';

import { modeConfig } from '../../constants';

const ModeContext = jest.requireActual('../ModeContext');

export const _setCurrentModeLayout = jest.fn();
export const _removeModeWidget = jest.fn();
export const _duplicateMode = jest.fn();
export const _setModeWidget = jest.fn();
export const _setModeName = jest.fn();
export const _removeMode = jest.fn();
export const _resetModes = jest.fn();
export const _addMode = jest.fn();
export const ModeProvider = ({ children }: any) => (
  <ModeContext.default.Provider value={{
    _setCurrentModeLayout,
    _removeModeWidget,
    _setModeWidget,
    _duplicateMode,
    _setModeName,
    _removeMode,
    _resetModes,
    _addMode,
    modes: modeConfig,
    modeName: 'default',
    prevMode: 'prevMode',
    mode: modeConfig.default,
    thirdPartyWidgets: [],
    widgets: {
      news: {
        element: React.forwardRef(
          // @ts-expect-error
          (props, ref) => <div ref={ref}>Example Widget #1</div>),
      } as any,
      welcome: {
        element: React.forwardRef(
          // @ts-expect-error
          (props, ref) => <div ref={ref}>Example Widget #2</div>)
      } as any,
      github: {
        element: React.forwardRef(
          // @ts-expect-error
          (props, ref) => <div ref={ref}>Example Widget #3</div>)
      } as any
    }
  } as any}>
    {children}
  </ModeContext.default.Provider>
);
export default ModeContext.default;
