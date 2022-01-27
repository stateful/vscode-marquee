import type { MarqueeWindow } from '@vscode-marquee/utils';
import type { Forecast, GeoData } from './types';

declare const window: MarqueeWindow;

export function kToF (k: number) {
  return Math.floor((k - 273.15) * 1.8 + 32);
};

export function kToC (k: number) {
  return Math.floor(k - 273.15);
};

const USER_GEO_LOCATION_ERROR = 'Couldn\'t fetch users geolocation!';
const ERROR_MESSAGE = "Couldn't fetch weather data!";

export async function fetchWeather (lat: number, lng: number) {
  const searchParams = new URLSearchParams({ props: window.marqueeUserProps });

  searchParams.append('lat', lat.toString());
  searchParams.append('lon', lng.toString());
  const url = `${window.marqueeBackendBaseUrl}/getWeather?${searchParams.toString()}`;
  console.log(`Fetch weather using params: ${url}`);
  const res = await fetch(url).catch(
    () => { throw new Error(ERROR_MESSAGE); });

  if (!res.ok) {
    throw new Error(`${ERROR_MESSAGE} (status: ${res.status})`);
  }

  return res.json() as Promise<Forecast>;
}

export async function fetchGeoData (city?: string) {
  const searchParams = new URLSearchParams({ props: window.marqueeUserProps });

  if (city) {
    searchParams.append('city', city);
  }

  const targetUrl = !city ? window.marqueeBackendGeoUrl : window.marqueeBackendFwdGeoUrl;
  const geoUrl = `${targetUrl}?${searchParams.toString()}`;
  console.log(`Fetch geolocation${city ? ` from ${city}` : ''} via: ${geoUrl}`);
  const res = await fetch(geoUrl).catch(
    () => { throw new Error(USER_GEO_LOCATION_ERROR); });

  if (!res.ok) {
    throw new Error(`${USER_GEO_LOCATION_ERROR} (status: ${res.status}${city ? `, query: "${city}"` : ''})`);
  }

  const { data } = await res.json();
  return data as GeoData;
}
