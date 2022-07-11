import type { ContextProperties } from '@vscode-marquee/utils'

export interface FeedItem {
  comments_count: number
  domain: string
  id: number
  points: number
  time: number
  time_ago: string
  title: string
  type: string
  url: string
  user: string
}

export interface State {
  news: FeedItem[]
  isFetching: boolean,
  channel: string,
  error: string | null
}

export interface Configuration {
  feeds: Record<string, string>
}

export interface Context extends ContextProperties<Configuration & State> {}
