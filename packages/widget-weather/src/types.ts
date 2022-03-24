interface WeatherDetails {
  description: string
  icon: string
  id: number
  main: string
}

export interface WeatherData {
  clouds: number
  dew_point: number
  dt: number
  feels_like: number
  humidity: number
  pressure: number
  sunrise: number
  sunset: number
  temp: number
  uvi: number
  visibility: number
  weather: WeatherDetails[]
  wind_deg: number
  wind_gust: number
  wind_speed: number
}

interface AddressComponents {
  long_name: string
  short_name: string
  types: string[]
}

export interface LatLng {
  lat: number
  lng: number
}

export interface Location extends LatLng {
  city: string
}

export interface GeoData {
  geocoder: string
  place: {
    address_components: AddressComponents[]
    formatted_address: string
    geometry: {
      bounds: {
        northeast: LatLng
        southwest: LatLng
      }
      location: LatLng
      location_type: string
      viewport: {
        northeast: LatLng
        southwest: LatLng
      }
    }
    place_id: string
    place_name: string
    types: string[]
  }
}

export interface Forecast {
  current: WeatherData
  daily: WeatherData[]
  hourly: WeatherData[]
  minutely: WeatherData[]
  lat: number
  lon: number
  timezone: string
  timezone_offset: number
}

export interface WeatherPayload {
  forecast: Forecast
  geo: GeoData
}

export interface Configuration {
  city?: string
  scale?: ScaleUnits
}

export interface Context extends Configuration {
  forecast?: Forecast
  isFetching: boolean
  error?: Error
  showDialog: boolean

  _updateCity: (city?: string) => void
  _updateScale: (scale: any) => void
  setShowDialog: (show: boolean) => void
}

type ScaleUnits = 'Fahrenheit' | 'Celsius'
export interface Scale {
  name: ScaleUnits
  value: Lowercase<ScaleUnits>
}

export interface Events {
  openWeatherDialog: boolean
}
