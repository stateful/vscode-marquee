import type { ContextProperties } from "@vscode-marquee/utils"

export interface Since {
  name: string
  value: string
}

export interface Contributor {
  username: string
  avatar: string
}

export interface SpokenLanguage {
  name: string
  urlParam: string
}

export interface Trend {
  description: string
  url: string
  author: string
  name: string
  currentPeriodStars: number
  language: string
  languageColor: string
  forks: number
  stars: number
  builtBy: Contributor[]
}

export type SinceConfiguration = 'Daily' | 'Weekly' | 'Monthly'
export interface Configuration {
  since?: SinceConfiguration
  language?: string
  spoken?: string
  trendFilter?: string
}

export interface ContextTypes extends Configuration {
  trends: Trend[]
  isFetching: boolean
  showDialog: boolean
  error?: Error
}

export interface Context extends ContextProperties<ContextTypes> {
  _updateSpoken: (id: SpokenLanguage) => void
  _updateLanguage: (val: SpokenLanguage) => void
  _updateSince: (val: Since) => void
  _updateFilter: (trendFilter: string) => void
}

export interface Events {
  openGitHubDialog: boolean
}
