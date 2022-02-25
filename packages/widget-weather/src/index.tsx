import React from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCloudSun } from "@fortawesome/free-solid-svg-icons/faCloudSun";

import Weather from "./Widget";

export default {
  name: "weather",
  icon: <FontAwesomeIcon icon={faCloudSun} />,
  label: 'Weather',
  tags: ["plan", "forecast"],
  description: "Weather and a 5 day forecast.",
  component: Weather,
};
