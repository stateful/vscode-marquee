import { MarqueeWindow, getEventListener } from "@vscode-marquee/utils";
import { ACTIONS } from "./actions";
import { widgetConfig } from "../constants";
import type { ActionTypes, State, Configuration, ReduxState } from './types';
import type { Mode, WidgetConfig, WidgetMap, ModeConfig } from '../types';

declare const window: MarqueeWindow;

const WIDGET_ID = '@vscode-marquee/gui';
export const initialState: ReduxState = {
  ...window.marqueeStateConfiguration[WIDGET_ID].state,
  ...window.marqueeStateConfiguration[WIDGET_ID].configuration,
  thirdPartyWidgets: [],
  widgets: {},
  mode: {}
};

export const reducer = (
  state: ReduxState = initialState,
  action: ActionTypes
): ReduxState => {
  switch (action.type) {
    case ACTIONS.SET_PREVMODE: {
      return {
        ...state,
        prevMode: action.value
      };
    }
    case ACTIONS.SET_MODENAME: {
      return {
        ...state,
        prevMode: state.modeName,
        modeName: action.value
      };
    }
    case ACTIONS.SET_MODES: {
      return {
        ...state,
        modes: action.value
      };
    }
    case ACTIONS.SET_THIRD_PARTY_WIDGET: {
      const thirdPartyWidgets = [...state.thirdPartyWidgets, action.value];
      const widgetMapping: Record<string, WidgetMap> = {};
      [...widgetConfig, ...thirdPartyWidgets].map((widgetObj: WidgetConfig) => {
        widgetMapping[widgetObj.name] = {
          label: widgetObj.label || 'Unknown Widget',
          element: widgetObj.component
        };
      });
      return {
        ...state,
        thirdPartyWidgets,
        widgets: widgetMapping
      };
    }
    case ACTIONS.SET_CURRENT_LAYOUT_MODE: {
      const newModes: ModeConfig = {
        ...state.modes,
        [state.modeName]: {
          ...state.modes[state.modeName],
          layouts: action.value,
        } as Mode,
      };
      return { ...state, modes: newModes };
    }
    case ACTIONS.SET_MODE_WIDGET: {
      const newModeWidgets: ModeConfig = {
        ...state.modes,
        [action.value.targetMode]: {
          ...state.modes[action.value.targetMode],
          widgets: {
            ...state.modes[action.value.targetMode].widgets,
            [action.value.widgetName]: action.value.layout,
          },
        } as Mode,
      };
      return { ...state, modes: newModeWidgets };
    }
    case ACTIONS.REMOVE_MODE_WIDGET: {
      const removedModeWidget: ModeConfig = {
        ...state.modes,
        [state.modeName]: {
          ...state.modes[state.modeName],
          widgets: {
            ...state.modes[state.modeName].widgets,
            [action.value]: false,
          },
        } as Mode,
      };
      return { ...state, modes: removedModeWidget };
    }
    case ACTIONS.RESET_MODES: {
      const newVal = {
        modes: {},
        modeName: 'default',
        prevMode: null
      } as State & Configuration;
      return {
        ...state,
        ...newVal,
        mode: {} as Mode,
      };
    }
    case ACTIONS.REMOVE_MODE: {
      let modeName = state.modeName;
      if (!state.modes[action.value]) {
        return state;
      }

      // if we are deleting the selected mode
      if (action.value === state.modeName) {
        modeName = 'default';
      }

      const newVal = {
        modeName,
        modes: Object.assign(
          {},
          ...Object.entries(state.modes)
            .filter(([k]) => k !== action.value)
            .map(([k, v]) => ({ [k]: v }))
        )
      } as State & Configuration;

      return {
        ...state,
        ...newVal,
      };
    }
    case ACTIONS.ADD_MODE_WITH_PARAMS: {
      const newModeName = action.value.newModeName.toLowerCase();

      if (state.modes[newModeName]) {
        return state;
      }

      const newVal = {
        modes: {
          ...state.modes,
          [newModeName]: {
            layouts: action.value.layouts,
            widgets: action.value.widgets,
            icon: action.value.emoji,
          } as Mode
        }
      } as State & Configuration;

      return { ...state, ...newVal };
    }
    case ACTIONS.DUPLICATE_MODE: {
      let prevLayouts = Object.assign({}, state.modes[action.value.oldModeName].layouts);
      let prevWidgets = Object.assign({}, state.modes[action.value.oldModeName].widgets);
      const newVal = {
        modes: {
          ...state.modes,
          [action.value.newModeName]: {
            layouts: prevLayouts,
            widgets: prevWidgets,
            icon: action.value.newEmoji,
          } as Mode
        }
      } as State & Configuration;
      return { ...state, ...newVal };
    }
    default: return state;
  }
};

export default (
  state: ReduxState = initialState,
  action: ActionTypes
): ReduxState => {
  const modeState = getEventListener<State & Configuration>(WIDGET_ID);
  const newState = reducer(state, action);
  newState.mode = newState.modes[newState.modeName];

  const { modeName, prevMode, modes } = newState;
  modeState.broadcast({ modeName, prevMode, modes });
  return newState;
};