import hexRgb from "hex-rgb";

import type { RGBA } from '../src/types';

export const getVSColor = () => {
  let vsCodeBgColor = process.env.NODE_ENV === 'test'
    ? '#000000'
    : getComputedStyle(document.documentElement)
        .getPropertyValue("--vscode-sideBar-background");

  let vsRgba = hexRgb(vsCodeBgColor);
  return {
    r: vsRgba.red,
    g: vsRgba.green,
    b: vsRgba.blue,
    a: 0.8,
  } as RGBA;
};
