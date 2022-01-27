import React from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFire } from "@fortawesome/free-solid-svg-icons";

import Github from "./Widget";

export default {
  name: "github",
  icon: <FontAwesomeIcon icon={faFire} />,
  tags: ["github", "trending", "projects", "entertainment"],
  description: "The Github trending feed.",
  component: Github,
};
