import React from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMailBulk } from "@fortawesome/free-solid-svg-icons/faMailBulk";

import NavPop from "./components/NavPop";
import Welcome from "./Widget";
import { TrickProvider } from "./Context";

export default {
  name: "welcome",
  icon: <FontAwesomeIcon icon={faMailBulk} />,
  label: "Mailbox",
  tags: ["news", "product", "communication", "tips", "tricks"],
  description: "Where to look for Marquee news, tips and tricks.",
  component: Welcome,
};
export { Welcome, NavPop, TrickProvider };
