import React, { createContext, useState, useEffect } from "react";
import store from "../store";

import { getVSColor } from '../utils';
import type { RGBA } from '../types';

interface PrefProps {
  children: any;
}

export interface Context {
  themeColor: RGBA
  bg: number;
  updateBg: (bg: number) => void,
  name: string;
  updateName: (name: string) => void;
  widgetFilter: string;
  updateWidgetFilter: (widgetFilter: string) => void
}

const rgba = ['r', 'g', 'b', 'a'] as const;
const defaultName = "name here...";
const PrefContext = createContext<Context>({} as Context);

const PrefProvider = (props: PrefProps) => {
  const prefStore = store("prefs", false);
  const { children } = props;

  /**
   * theme color propagated into template
   */
  const cssThemeValue = window.getComputedStyle(document.documentElement)
    .getPropertyValue('--marquee-theme-color')
    .trim();
  const themeColor = cssThemeValue === 'transparent' || !cssThemeValue.match(/[\.\d]+/g)
    ? getVSColor()
    : cssThemeValue
        .match(/[\.\d]+/g)!
        .map(Number)
        .reduce((acc, val, i) => {
          acc[rgba[i]] = val;
          return acc;
        }, {} as RGBA);

  const [bg, setBg] = useState(1);
  const [name, setName] = useState("");
  const [widgetFilter, setWidgetFilter] = useState("");

  let updateWidgetFilter = (widgetFilter: string) => {
    setWidgetFilter(widgetFilter);
    prefStore.set("widgetFilter", widgetFilter);
  };

  let updateName = (name: string) => {
    setName(name);
    prefStore.set("name", name);
  };

  let updateBg = (bg: number) => {
    setBg(bg);
    prefStore.set("bg", bg);
  };

  const handler = () => {
    //Safe guard for future refactoring
    let globalBg = prefStore.get("bg");
    if (!globalBg) {
      globalBg = 1;
      setBg(globalBg);
    } else if (globalBg !== bg) {
      setBg(globalBg);
    }

    setName(prefStore.get("name") || defaultName);
    setWidgetFilter(prefStore.get("widgetFilter") || "");
  };

  useEffect(() => {
    handler();
    prefStore.subscribe(handler as any);

    return () => {
      setBg(1);
      setName("");
      setWidgetFilter("");
    };
  }, []);

  return (
    <PrefContext.Provider
      value={{
        bg,
        name,
        themeColor,
        widgetFilter,
        updateName,
        updateBg,
        updateWidgetFilter,
      }}
    >
      {children}
    </PrefContext.Provider>
  );
};

export default PrefContext;
export { PrefProvider, PrefContext, defaultName };
