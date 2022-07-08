import type { ContextProperties } from '@vscode-marquee/utils'

export type StatResponse = {
  [packageName: string]: Record<string, number>
}

export interface State {
  stats: StatResponse
  isLoading: boolean
  error?: Error | null
}
export interface Configuration {
  packageNames: string[]
  from?: number
  until?: number
}

export interface Context extends ContextProperties<Configuration & State> { }

type JSONValue =
  | string
  | number
  | boolean
  | JSONObject
  | JSONArray

export interface JSONObject {
  [x: string]: JSONValue
}

export interface JSONArray extends Array<JSONValue> { }
