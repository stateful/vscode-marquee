import type { MarqueeWindow } from '@vscode-marquee/utils'

import { spokenLanguages, trendLanguages } from './constants'
import type { SinceConfiguration } from './types'

declare const window: MarqueeWindow
const ERROR_MESSAGE = 'Couldn\'t fetch GitHub trends!'
const CACHE_TIMEOUT = 1000 * 60 * 30 // 30min

function getResourceURL (since?: SinceConfiguration, language?: string, spoken?: string) {
  const searchParams = new URLSearchParams({ props: window.marqueeUserProps })

  if (since) {
    searchParams.append('since', since.toLocaleLowerCase())
  }

  const languageParam = trendLanguages.find((l) => l.name === language)
  if (languageParam) {
    searchParams.append('language', languageParam.urlParam)
  }

  const spokenParam = spokenLanguages.find((l) => l.name === spoken)
  if (spokenParam) {
    searchParams.append('spoken', spokenParam.urlParam)
  }

  return `${window.marqueeBackendBaseUrl}/getRepositories?${searchParams.toString()}`
}

export function setCache (key: string, data: any) {
  const currentState = window.vscode.getState() || {}
  window.vscode.setState({ ...currentState, [`githubTrends-${key}`]: { time: Date.now(), data } })
}

export function getFromCache (since?: SinceConfiguration, language?: string, spoken?: string) {
  const currentState = window.vscode.getState() || {}
  const url = getResourceURL(since, language, spoken)
  const cache = currentState[`githubTrends-${url}`]
  if (cache && (Date.now() - cache.time) < CACHE_TIMEOUT) {
    return cache.data
  }
  return undefined
}

export async function fetchData (since?: SinceConfiguration, language?: string, spoken?: string) {
  const url = getResourceURL(since, language, spoken)

  console.log(`Fetch repositories via: ${url}`)
  const res = await fetch(url).catch(
    () => { throw new Error(ERROR_MESSAGE) })

  if (!res.ok) {
    throw new Error(`${ERROR_MESSAGE} (status: ${res.status})`)
  }

  const data = await res.json()
  setCache(url, data)
  return data
}
