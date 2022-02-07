import React, { createContext, useState, useEffect } from "react";
import { getEventListener, MarqueeEvents, connect, MarqueeWindow } from "@vscode-marquee/utils";

import { fetchGeoData, fetchWeather } from './utils';
import type { Context, Configuration, Forecast, Scale, Location } from './types';

declare const window: MarqueeWindow;

const WeatherContext = createContext<Context>({} as Context);
const WIDGET_ID = '@vscode-marquee/weather-widget';

const WeatherProvider = function ({ children }: { children: React.ReactElement }) {
  const widgetState = getEventListener<Configuration>(WIDGET_ID);
  const providerValues = connect<Configuration>({
    ...window.marqueeStateConfiguration[WIDGET_ID].state,
    ...window.marqueeStateConfiguration[WIDGET_ID].configuration
  }, widgetState);

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
