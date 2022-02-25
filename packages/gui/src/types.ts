import type { ContextProperties } from "@vscode-marquee/utils";
import type { EmojiData } from 'emoji-mart';
import type { presetModes } from './constants';

export type LayoutSize = 'lg' | 'md' | 'sm' | 'xs' | 'xxs';
export type LayoutType = Record<LayoutSize, ReactGridLayout.Layout[]>;
export type PresetModes = typeof presetModes[number];

export interface Mode {
  layouts: LayoutType,
  widgets: Record<string, boolean>,
  icon?: EmojiData
}

export type ModeConfig = Record<PresetModes | string, Mode>;
export type WidgetComponent = React.MemoExoticComponent<React.ForwardRefExoticComponent<React.RefAttributes<unknown>>>;
export interface WidgetMap {
  label: string
  element: WidgetComponent
}

export interface WidgetConfig {
  name: string
  icon: JSX.Element
  label?: string
  tags: string[]
  description: string
  component: WidgetComponent
}

export interface Theme {
  id: number
  background?: string
  backgroundColor?: string
  title: string
  description: string
  author: string
}

export interface State {
  modeName: string
  prevMode: string | null
}

export interface Configuration {
  modes: ModeConfig
}

export interface AdditionalProps {
  thirdPartyWidgets: WidgetConfig[]
}

export interface Context extends ContextProperties<State & Configuration & AdditionalProps> {
  _setCurrentModeLayout: (newLayouts: ReactGridLayout.Layouts) => void
  _setModeWidget: (targetMode: string, widgetName: string, value: ReactGridLayout.Layout | Boolean) => void
  _addMode: (newModeName: string, emoji: EmojiData) => void
  _removeMode: (removeModeName: string) => void
  _resetModes: () => void
  _duplicateMode: (oldModeName: string, newModeName: string, newEmoji: EmojiData) => void
  _removeModeWidget: (widgetName: string) => void
  _setModeName: (newModeName: string) => void
}
