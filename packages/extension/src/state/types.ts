import { ExtensionContext } from 'vscode'

import { State } from '../utils'
import type {
  STATE_KEY as keyUtils,
  State as StateUtils
} from '@vscode-marquee/utils/extension'
import type {
  STATE_KEY as keyWelcomeWidget,
  State as StateWelcomeWidget
} from '@vscode-marquee/widget-welcome/extension'
import type {
  STATE_KEY as keyNewsWidget,
  State as StateNewsWidget
} from '@vscode-marquee/widget-news/extension'
import type {
  STATE_KEY as keyProjectsWidget,
  State as StateProjectsWidget
} from '@vscode-marquee/widget-projects/extension'
import type {
  STATE_KEY as keyGitHubWidget,
  State as StateGitHubWidget
} from '@vscode-marquee/widget-github/extension'
import type {
  STATE_KEY as keyWeatherWidget,
  State as StateWeatherWidget
} from '@vscode-marquee/widget-weather/extension'
import type {
  STATE_KEY as keyTodoWidget,
  State as StateTodoWidget
} from '@vscode-marquee/widget-todo/extension'
import type {
  STATE_KEY as keyMarkdownWidget,
  State as StateMarkdownWidget
} from '@vscode-marquee/widget-markdown/extension'
import type {
  STATE_KEY as keyNotesWidget,
  State as StateNotesWidget
} from '@vscode-marquee/widget-notes/extension'
import type {
  STATE_KEY as keyNPMStatsWidget,
  State as StateNPMStatsWidget
} from '@vscode-marquee/widget-npm-stats/extension'
import type {
  STATE_KEY as keySnippetsWidget,
  State as StateSnippetsWidget
} from '@vscode-marquee/widget-snippets/extension'

export type WidgetKeys = (
  typeof keyUtils | typeof keyWelcomeWidget | typeof keyNewsWidget | typeof keyProjectsWidget |
  typeof keyGitHubWidget | typeof keyWeatherWidget | typeof keyTodoWidget | typeof keyMarkdownWidget |
  typeof keyNotesWidget | typeof keyNPMStatsWidget | typeof keySnippetsWidget
)

export type WidgetStates = {
  [keyUtils]: StateUtils & State
  [keyWelcomeWidget]: StateWelcomeWidget
  [keyNewsWidget]: StateNewsWidget
  [keyProjectsWidget]: StateProjectsWidget
  [keyGitHubWidget]: StateGitHubWidget
  [keyWeatherWidget]: StateWeatherWidget
  [keyTodoWidget]: StateTodoWidget
  [keyMarkdownWidget]: StateMarkdownWidget
  [keyNotesWidget]: StateNotesWidget
  [keyNPMStatsWidget]: StateNPMStatsWidget
  [keySnippetsWidget]: StateSnippetsWidget
}

export abstract class StateProvider {
  abstract context: ExtensionContext

  /**
   * Allows to sync a specific key value pair with provider
   * @param key state key
   * @param value state value
   */
  abstract setState<Keys extends WidgetKeys> (
    key: Keys,
    value: WidgetStates[Keys]
  ): Promise<void>
  abstract setState<
    Keys extends WidgetKeys,
    Property extends keyof WidgetStates[Keys],
    ReturnType extends WidgetStates[Keys][Property]
  > (
    key: `${Keys}.${Property extends string ? Property : never}`,
    value: ReturnType
  ): Promise<void>

  /**
   * Get the latest state from the provider and returns it
   */
  abstract getState<Keys extends WidgetKeys> (widgetKey: Keys): WidgetStates[Keys]
  abstract getState<Keys extends WidgetKeys, State extends WidgetStates[Keys], Property extends keyof State> (
    widgetKey: Keys,
    property: Property
  ): State[Property]
}
