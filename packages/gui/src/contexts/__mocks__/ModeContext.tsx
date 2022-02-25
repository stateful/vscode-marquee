import React from 'react';

import modeConfig from './modeConfig.json';

const ModeContext = jest.requireActual('../ModeContext');

export const _setCurrentModeLayout = jest.fn();
export const _removeModeWidget = jest.fn();
export const _duplicateMode = jest.fn();
export const _setModeWidget = jest.fn();
export const _removeMode = jest.fn();
export const _resetModes = jest.fn();
export const _addMode = jest.fn();
export const _setModeName = jest.fn();
export const ModeProvider = ({ children }: any) => (
  <ModeContext.default.Provider value={{
    _setCurrentModeLayout,
    _removeModeWidget,
    _setModeWidget,
    _duplicateMode,
    _removeMode,
    _resetModes,
    _addMode,
    _setModeName,
    modeName: 'default',
    modes: modeConfig,
    thirdPartyWidgets: []
  } as any}>
    {children}
  </ModeContext.default.Provider>
);
export default ModeContext.default;
