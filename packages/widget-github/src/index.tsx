import React from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFire } from "@fortawesome/free-solid-svg-icons/faFire";

import Github from "./Widget";

export default {
  name: "github",
  icon: <FontAwesomeIcon icon={faFire} />,
  tags: ["github", "trending", "projects", "entertainment"],
  label: 'GitHub',
  description: "The Github trending feed.",
  component: Github,
};
