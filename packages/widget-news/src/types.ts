import { HN_CHANNELS } from "./constants";

export interface HackerNews {
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

export type HackerNewsChannels = typeof HN_CHANNELS[number];

export interface WidgetState {
  news: HackerNews[]
  isFetching: boolean,
  channel: HackerNewsChannels,
  error?: Error
}
