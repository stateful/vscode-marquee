import React, { createContext, useState, useEffect } from "react";
import { getEventListener, MarqueeEvents, store } from "@vscode-marquee/utils";

import { fetchGeoData, fetchWeather } from './utils';
import type { Context, FetchParams, Forecast, Scale, Location } from './types';

const DEFAULT_SCALE: Scale = {
  name: "fahrenheit",
  value: "fahrenheit"
};

const WeatherContext = createContext<Context>({} as Context);

const WeatherProvider = function ({ children }: { children: React.ReactElement }) {
  const WeatherStore = store("weather");
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<Error>();
  const [coords, setCoords] = useState<Location>();
  const [fetchParams, setFetchParams] = useState<FetchParams>({ scale: DEFAULT_SCALE });
  const [forecast, setForecast] = useState<Forecast>();
  const [showDialog, setShowDialog] = useState(false);

  const _updateScale = (scale: Scale) => {
    setFetchParams({ ...fetchParams, scale });
    WeatherStore.set("scale", scale);
  };

  const _updateCity = (city?: string) => {
    setFetchParams(city ? { ...fetchParams, city } : { scale: fetchParams.scale });
    WeatherStore.set("city", city);
  };

  useEffect(() => {
    setIsFetching(true);
    fetchGeoData(fetchParams?.city).then(
      (res) => {
        setError(undefined);
        setCoords({
          ...res.place.geometry.location,
          city: res.place.place_name
        });
      },
      (e: Error) => setError(e)
    ).finally(() => setIsFetching(false));
  }, [fetchParams.city]);

  useEffect(() => {
    if (!coords) {
      return;
    }

    setIsFetching(true);
    fetchWeather(coords?.lat, coords?.lng).then(
      (res) => setForecast(res),
      (e: Error) => setError(e)
    ).finally(() => setIsFetching(false));
  }, [coords?.lat, coords?.lng]);

  WeatherStore.subscribe((() => {
    const newFetchParams: FetchParams = {
      // default to undefined as `get` can return `null`
      city: WeatherStore.get("city") || undefined,
      scale: WeatherStore.get("scale") || DEFAULT_SCALE
    };

    /**
     * only update if search params have updated
     */
    if (JSON.stringify(fetchParams) === JSON.stringify(newFetchParams)) {
      return;
    }

    setFetchParams(newFetchParams);
  }) as any);

  useEffect(() => {
    const eventListener = getEventListener<MarqueeEvents>();
    eventListener.on('openWeatherDialog', setShowDialog);
  }, []);

  return (
    <WeatherContext.Provider
      value={{
        city: coords?.city,
        scale: fetchParams?.scale,
        error,
        forecast,
        isFetching,
        showDialog,
        setShowDialog,
        _updateScale,
        _updateCity,
      }}
    >
      {children}
    </WeatherContext.Provider>
  );
};

export default WeatherContext;
export { WeatherProvider };
