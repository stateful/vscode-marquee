import React, { createContext, useState, useEffect } from "react";
import { getEventListener, MarqueeEvents, connect } from "@vscode-marquee/utils";

import { fetchGeoData, fetchWeather } from './utils';
import { DEFAULT_CONFIGURATION } from "./constants";
import type { Context, Configuration, Forecast, Scale, Location } from './types';

const WeatherContext = createContext<Context>({} as Context);

const WeatherProvider = function ({ children }: { children: React.ReactElement }) {
  const widgetState = getEventListener<Configuration>('@vscode-marquee/weather-widget');
  const providerValues = connect<Configuration>(DEFAULT_CONFIGURATION, widgetState);

  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<Error>();
  const [coords, setCoords] = useState<Location>();
  const [forecast, setForecast] = useState<Forecast>();
  const [showDialog, setShowDialog] = useState(false);

  const _updateScale = (scale: Scale) => {
    providerValues.setScale(scale.name);
  };

  const _updateCity = (city?: string) => {
    providerValues.setCity(city);
  };

  useEffect(() => {
    if (typeof providerValues.city === 'undefined') {
      return;
    }

    setIsFetching(true);
    fetchGeoData(providerValues.city).then(
      (res) => {
        setError(undefined);
        setCoords({
          ...res.place.geometry.location,
          city: res.place.address_components[0]?.short_name
        });
      },
      (e: Error) => setError(e)
    ).finally(() => setIsFetching(false));
  }, [providerValues.city]);

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

  useEffect(() => {
    const eventListener = getEventListener<MarqueeEvents>();
    eventListener.on('openWeatherDialog', setShowDialog);
  }, []);

  return (
    <WeatherContext.Provider
      value={{
        city: coords?.city,
        scale: providerValues.scale,
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
