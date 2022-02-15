import type { EmojiData } from 'emoji-mart';
import type { ModeConfig, WidgetConfig, LayoutType, WidgetMap, Mode } from '../types';
import { ACTIONS } from './actions';

export interface State {
  modeName: string
  prevMode: string | null
}

export interface Configuration {
  modes: ModeConfig
}

export interface SetModenameAction {
  type: typeof ACTIONS.SET_MODENAME
  value: string
}

export interface SePrevModeAction {
  type: typeof ACTIONS.SET_PREVMODE
  value: string
}

export interface SetModesAction {
  type: typeof ACTIONS.SET_MODES
  value: ModeConfig
}

export interface SetThirdPartyWidgetAction {
  type: typeof ACTIONS.SET_THIRD_PARTY_WIDGET
  value: WidgetConfig
}

export interface SetCurrentModeLayoutAction {
  type: typeof ACTIONS.SET_CURRENT_LAYOUT_MODE
  value: ReactGridLayout.Layouts
}

export interface SetModeWidgetAction {
  type: typeof ACTIONS.SET_MODE_WIDGET
  value: {
    targetMode: string
    widgetName: string
    layout: ReactGridLayout.Layout | Boolean
  }
}

export interface RemoveModeWidgetAction {
  type: typeof ACTIONS.REMOVE_MODE_WIDGET
  value: string
}

export interface ResetModesAction {
  type: typeof ACTIONS.RESET_MODES
}

export interface RemoveModeAction {
  type: typeof ACTIONS.REMOVE_MODE
  value: string
}

export interface AddModeWithParamsAction {
  type: ACTIONS.ADD_MODE_WITH_PARAMS
  value: {
    newModeName: string,
    emoji: EmojiData,
    layouts: LayoutType,
    widgets: Record<string, boolean>
  }
}

export interface DuplicateModeAction {
  type: ACTIONS.DUPLICATE_MODE,
  value: {
    oldModeName: string
    newModeName: string
    newEmoji: EmojiData
  }
}

export type ActionTypes = DuplicateModeAction | AddModeWithParamsAction | RemoveModeAction | ResetModesAction | RemoveModeWidgetAction | SetModeWidgetAction | SetCurrentModeLayoutAction | SetModenameAction | SePrevModeAction | SetModesAction | SetThirdPartyWidgetAction;
export interface ReduxState extends State, Configuration {
  mode: Mode
  thirdPartyWidgets: WidgetConfig[]
  widgets: Record<string, WidgetMap>,
}
