import React, {
  createContext,
  useState,
  useEffect,
  useMemo
} from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { store, getEventListener, MarqueeEvents } from "@vscode-marquee/utils";
import { ThirdPartyWidget } from '@vscode-marquee/widget';
import type { MarqueeWindow, MarqueeInterface, ThirdPartyWidgetOptions } from '@vscode-marquee/utils';
import type { EmojiData } from 'emoji-mart';

import {
  defaultLayout, modeConfig, defaultEnabledWidgets, thirdPartyWidgetLayout
} from "../constants";
import { widgetConfig } from "../constants";
import { Layout, ModeConfig, Mode, LayoutType, WidgetConfig, LayoutSize, WidgetMap } from "../types";

declare const window: MarqueeWindow;

const pendingThirdPartyWidgets: ThirdPartyWidgetOptions[] = [];

interface Props {
  children: any
}

const ModeContext = createContext<Context>({} as Context);

interface Context {
  modes: ModeConfig
  mode: Mode
  modeName: string
  thirdPartyWidgets: WidgetConfig[]
  modeConfig: ModeConfig
  prevMode: string | null

  widgets: Record<string, WidgetMap>,

  _setModeName: (newModeName: string) => void
  _isWidgetInMode: (widgetName: string) => void
  _setCurrentModeLayout: (newLayouts: ReactGridLayout.Layouts) => void
  _setModeWidget: (targetMode: string, widgetName: string, value: Layout | Boolean) => void
  _addMode: (newModeName: string, emoji: EmojiData) => void
  _removeMode: (removeModeName: string) => void
  _resetModes: () => void
  _duplicateMode: (oldModeName: string, newModeName: string, newEmoji: EmojiData) => void
  _removeModeWidget: (widgetName: string) => void
}

const ModeProvider = ({ children }: Props) => {
  let modeStore = store("modes");
  let modeSelStore = store("modes", false);
  let prefStore = store("modes");

  const [thirdPartyWidgets, setThirdPartyWidgets] = useState([] as WidgetConfig[]);
  const [modes, setModes] = useState({} as ModeConfig);
  const [modeName, setModeName] = useState(null as any as string);
  const [prevMode, setPrevMode] = useState(null as any as string | null);

  const widgetMapping: Record<string, WidgetMap> = useMemo(() => {
    const newMap: Record<string, WidgetMap> = {};
    [...widgetConfig, ...thirdPartyWidgets].map((widgetObj: WidgetConfig) => {
      newMap[widgetObj.name] = {
        label: widgetObj.label || 'Unknown Widget',
        element: widgetObj.component
      };
    });
    return newMap;
  }, [widgetConfig, thirdPartyWidgets]);

  if (!window.marqueeExtension) {
    window.marqueeExtension = {
      defineWidget: (
        widgetOptions: ThirdPartyWidgetOptions,
        constructor: CustomElementConstructor,
        options?: ElementDefinitionOptions
      ) => {
        customElements.define(widgetOptions.name, constructor, options);
        setThirdPartyWidgets([...thirdPartyWidgets, {
          name: widgetOptions.name,
          icon: <FontAwesomeIcon icon={widgetOptions.icon} />,
          label: widgetOptions.label,
          tags: widgetOptions.tags,
          description: widgetOptions.description,
          component: ThirdPartyWidget,
        }]);
        pendingThirdPartyWidgets.push(widgetOptions);
      }
    } as MarqueeInterface;
  }

  useEffect(() => {
    if (pendingThirdPartyWidgets.length) {
      for (const mn of Object.keys(modes)) {
        for (const w of pendingThirdPartyWidgets) {
          if (typeof modes[mn].widgets[w.name] === 'boolean') {
            continue;
          }
          modes[mn].widgets[w.name] = true;
          for (const size of Object.keys(modes[mn].layouts)) {
            modes[mn].layouts[size as LayoutSize].push({
              ...thirdPartyWidgetLayout[size as LayoutSize],
              i: w.name
            });
          }
        }
      }
    }

    modeStore.set("modes", modes);
  }, [modes]);

  useEffect(() => {
    modeSelStore.set("modeName", modeName);
  }, [modeName]);

  useEffect(() => {
    modeSelStore.set("prevMode", prevMode);
  }, [prevMode]);

  const mode: Mode = useMemo(() => {
    return (modes && modes[modeName]) || {};
  }, [modes, modeName]);
  const eventListener = getEventListener<MarqueeEvents>();
  eventListener.emit('updateWidgetDisplay', mode.widgets);

  const _setModeName = (newModeName: string) => {
    if (newModeName !== modeName) {
      setPrevMode(modeName);
      setModeName(newModeName);
    }
  };

  const _isWidgetInMode = (widgetName: string) => {
    return Boolean(mode.widgets[widgetName]);
  };

  const _setCurrentModeLayout = (newLayouts: ReactGridLayout.Layouts) => {
    setModes((prevState) => ({
      ...prevState,
      [modeName]: {
        ...prevState[modeName],
        layouts: newLayouts,
      } as Mode,
    }));
  };

  const _setModeWidget = (targetMode: string, widgetName: string, value: Layout | Boolean) => {
    setModes((prevState) => ({
      ...prevState,
      [targetMode]: {
        ...prevState[targetMode],
        widgets: {
          ...prevState[targetMode].widgets,
          [widgetName]: value,
        },
      } as Mode,
    }));
  };

  const _removeModeWidget = (widgetName: string) => {
    _setModeWidget(modeName || 'default', widgetName, false);
  };

  const _resetModes = () => {
    setModes(modeConfig);
    setModeName("default");
    setPrevMode(null);
    modeStore.set("layoutMigrated", false);
    legacyLayoutMigration();
  };

  const _removeMode = (removeModeName: string) => {
    //it must exist
    if (!modes[removeModeName]) {
      return;
    }

    //if we are deleting the selected mode
    if (removeModeName === modeName) {
      setModeName("default");
    }

    setModes((prevModes) => {
      return Object.assign(
        {},
        ...Object.entries(prevModes)
          .filter(([k]) => k !== removeModeName)
          .map(([k, v]) => ({ [k]: v }))
      );
    });
  };

  const _addModeWithParams = (newModeName: string, emoji: EmojiData, layouts: LayoutType, widgets: Record<string, boolean>) => {
    newModeName = newModeName.toLowerCase();

    if (!modes[newModeName]) {
      let newModeObj: Mode = {
        layouts: layouts,
        widgets: widgets,
        icon: emoji,
      };
      setModes((prevState) => ({
        ...prevState,
        [newModeName]: newModeObj,
      }));
    }
  };

  const _duplicateMode = (oldModeName: string, newModeName: string, newEmoji: EmojiData) => {
    let prevLayouts = Object.assign({}, modes[oldModeName].layouts);
    let prevWidgets = Object.assign({}, modes[oldModeName].widgets);

    _addModeWithParams(newModeName, newEmoji, prevLayouts, prevWidgets);
  };

  const _addMode = (newModeName: string, emoji: EmojiData) => {
    _addModeWithParams(
      newModeName,
      emoji,
      defaultLayout,
      defaultEnabledWidgets
    );
  };

  const legacyLayoutMigration = () => {
    const complete = modeStore.get("layoutMigrated");

    let migratedLayouts = prefStore.get("layouts");
    let migratedWidgets = prefStore.get("widgets");

    let migratedName = "migrated layout";

    let migratedMode = {
      icon: {
        id: "floppy_disk",
        name: "Floppy Disk",
        short_names: ["floppy_disk"],
        colons: ":floppy_disk:",
        emoticons: [],
        unified: "1f4be",
        skin: null,
        native: "💾",
      },
      widgets: migratedWidgets,
      layouts: migratedLayouts,
    };

    if (
      !complete &&
      migratedLayouts &&
      migratedWidgets &&
      !modes[migratedName]
    ) {
      modeStore.set("layoutMigrated", true);
      setModes((prevModes) => ({
        ...prevModes,
        [migratedName]: migratedMode,
      }));
    }
  };

  useEffect(() => {
    // use two handlers
    // @ts-expect-error requires Observer as return value
    modeStore.subscribe(() => {
      setModes(modeStore.get("modes") || modeConfig);
      legacyLayoutMigration();
    });
    // @ts-expect-error requires Observer as return value
    modeSelStore.subscribe(() => {
      setModeName(modeSelStore.get("modeName") || "default");
      setPrevMode(modeSelStore.get("prevMode"));
    });
  }, []);

  return (
    <ModeContext.Provider
      value={{
        modes: modes,
        mode: mode,
        modeName: modeName,
        _setModeName: _setModeName,
        widgets: widgetMapping,
        thirdPartyWidgets: thirdPartyWidgets,
        modeConfig: modeConfig,
        _isWidgetInMode: _isWidgetInMode,
        _setCurrentModeLayout: _setCurrentModeLayout,
        _setModeWidget: _setModeWidget,
        _addMode: _addMode,
        _removeMode: _removeMode,
        _resetModes: _resetModes,
        _duplicateMode: _duplicateMode,
        _removeModeWidget: _removeModeWidget,
        prevMode: prevMode,
      }}
    >
      {children}
    </ModeContext.Provider>
  );
};

export default ModeContext;
export { ModeProvider };
