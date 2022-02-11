import React from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faNewspaper } from "@fortawesome/free-solid-svg-icons";

import News from "./Widget";

export default {
  name: "news",
  icon: <FontAwesomeIcon icon={faNewspaper} />,
  label: 'News',
  tags: ["hackernews", "HNN", "programing", "entertainment"],
  description: "The Hacker News feed, with more feeds coming soon.",
  component: News,
};
export { News };
