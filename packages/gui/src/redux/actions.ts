import type ReactGridLayout from 'react-grid-layout';
import type { EmojiData } from 'emoji-mart';

import { defaultLayout, defaultEnabledWidgets } from "../constants";
import type { ModeConfig, WidgetConfig, LayoutType } from '../types';

export enum ACTIONS {
  SET_MODENAME = 'SET_MODENAME',
  SET_PREVMODE = 'SET_PREVMODE',
  SET_MODES = 'SET_MODES',
  SET_THIRD_PARTY_WIDGET = 'SET_THIRD_PARTY_WIDGET',
  SET_CURRENT_LAYOUT_MODE = 'SET_CURRENT_LAYOUT_MODE',
  SET_MODE_WIDGET = 'SET_MODE_WIDGET',
  REMOVE_MODE_WIDGET = 'REMOVE_MODE_WIDGET',
  RESET_MODES = 'RESET_MODES',
  REMOVE_MODE = 'REMOVE_MODE',
  ADD_MODE_WITH_PARAMS = 'ADD_MODE_WITH_PARAMS',
  DUPLICATE_MODE = 'DUPLICATE_MODE'
}

export const setModeName = (value: string) => ({
  type: ACTIONS.SET_MODENAME,
  value
});

export const setPrevMode = (value: string) => ({
  type: ACTIONS.SET_PREVMODE,
  value
});

export const setModes = (value: ModeConfig) => ({
  type: ACTIONS.SET_MODES,
  value
});

export const setThirdPartyWidget = (value: WidgetConfig) => ({
  type: ACTIONS.SET_THIRD_PARTY_WIDGET,
  value
});

export const setCurrentModeLayout = (value: ReactGridLayout.Layouts) => ({
  type: ACTIONS.SET_CURRENT_LAYOUT_MODE,
  value
});

export const setModeWidget = (targetMode: string, widgetName: string, layout: ReactGridLayout.Layout | Boolean) => ({
  type: ACTIONS.SET_MODE_WIDGET,
  value: { targetMode, widgetName, layout }
});

export const removeModeWidget = (value: string) => ({
  type: ACTIONS.REMOVE_MODE_WIDGET,
  value
});

export const resetModes = () => ({
  type: ACTIONS.RESET_MODES
});

export const removeMode = (value: string) => ({
  type: ACTIONS.REMOVE_MODE,
  value
});

export const addMode = (newModeName: string, emoji: EmojiData, layouts?: LayoutType, widgets?: Record<string, boolean>) => ({
  type: ACTIONS.ADD_MODE_WITH_PARAMS,
  value: {
    newModeName,
    emoji,
    layouts: layouts || defaultLayout,
    widgets: widgets || defaultEnabledWidgets
  }
});

export const duplicateMode = (oldModeName: string, newModeName: string, newEmoji: EmojiData) => ({
  type: ACTIONS.DUPLICATE_MODE,
  value: { oldModeName, newModeName, newEmoji }
});
