import type { MarqueeWindow } from '@vscode-marquee/utils'
import type { Forecast, GeoData, Location } from './types'

declare const window: MarqueeWindow

export function kToF (k: number) {
  return Math.floor((k - 273.15) * 1.8 + 32)
};

export function kToC (k: number) {
  return Math.floor(k - 273.15)
};

const USER_GEO_LOCATION_ERROR = 'Couldn\'t fetch users geolocation!'
const ERROR_MESSAGE = 'Couldn\'t fetch weather data!'
const REFETCH_TRESHOLD = 1000 * 60 * 30 // 30min

/**
 * no need to fetch forecast for same lat and lng input for
 * given `REFETCH_TRESHOLD` given that weather doesn't change
 * that often
 */
export function forecastCache (lat: number, lng: number) {
  const stateResultKey = `geoData-${lat},${lng}`
  const currentState = window.vscode.getState() || {}

  if (currentState[stateResultKey] && (Date.now() - currentState[stateResultKey].time) < REFETCH_TRESHOLD) {
    return currentState[stateResultKey].data
  }

  return undefined
}

export async function fetchWeather (lat: number, lng: number) {
  const stateResultKey = `geoData-${lat},${lng}`
  const currentState = window.vscode.getState() || {}
  const searchParams = new URLSearchParams({ props: window.marqueeUserProps })
  const cache = forecastCache(lat, lng)

  if (cache) {
    return cache
  }

  searchParams.append('lat', lat.toString())
  searchParams.append('lon', lng.toString())
  const url = `${window.marqueeBackendBaseUrl}/getWeather?${searchParams.toString()}`
  console.log(`Fetch weather using params: ${url}`)
  const res = await fetch(url).catch(
    () => { throw new Error(ERROR_MESSAGE) })

  if (!res.ok) {
    throw new Error(`${ERROR_MESSAGE} (status: ${res.status})`)
  }

  const data = await res.json() as Promise<Forecast>
  window.vscode.setState({ ...currentState, [stateResultKey]: { time: Date.now(), data } })
  return data
}

export function geoDataCache (city?: string) {
  const currentState = window.vscode.getState() || {}
  const stateResultKey = `geoData-${city || 'unknown'}`

  if (currentState[stateResultKey]) {
    return currentState[stateResultKey] as Location
  }

  return undefined
}

export async function fetchGeoData (city?: string) {
  const cachedData = geoDataCache(city)
  if (cachedData) {
    return cachedData
  }

  const searchParams = new URLSearchParams({ props: window.marqueeUserProps })
  if (city) {
    searchParams.append('city', city)
  }

  const targetUrl = !city ? window.marqueeBackendGeoUrl : window.marqueeBackendFwdGeoUrl
  const geoUrl = `${targetUrl}?${searchParams.toString()}`
  console.log(`Fetch geolocation${city ? ` from ${city}` : ''} via: ${geoUrl}`)
  const res = await fetch(geoUrl).catch(
    () => { throw new Error(USER_GEO_LOCATION_ERROR) })

  if (!res.ok) {
    throw new Error(`${USER_GEO_LOCATION_ERROR} (status: ${res.status}${city ? `, query: "${city}"` : ''})`)
  }

  const { data } = await res.json() as { data: GeoData }
  const result: Location = {
    ...data.place.geometry.location,
    city: data.place.address_components[0]?.short_name
  }

  /**
   * store geo data for locations into state as given input and
   * output stays the same
   */
  const currentState = window.vscode.getState() || {}
  const stateResultKey = `geoData-${city || 'unknown'}`
  window.vscode.setState({ ...currentState, [stateResultKey]: result })

  return result
}

/**
 * Simple method to convert a unix timestamp into a "9:30 pm" format
 * without having to import momentjs
 * @param date
 * @returns
 */
export const formatAMPM = (date: Date) => {
  let hours = date.getHours()
  let minutes = date.getMinutes()
  const ampm = hours >= 12 ? 'pm' : 'am'

  hours %= 12
  hours = hours || 12
  const minutesStr = minutes < 10 ? `0${minutes}` : minutes.toString()
  return `${hours}:${minutesStr} ${ampm.toUpperCase()}`
}
