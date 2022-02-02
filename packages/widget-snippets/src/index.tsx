import React from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCode } from "@fortawesome/free-solid-svg-icons";

import Snippets from "./Widget";

export default {
  name: "snippets",
  icon: <FontAwesomeIcon icon={faCode} />,
  tags: ["productivity", "workflow", "search", "organize"],
  description:
    "Create or extract code snippets then edit, organize and insert them directly into code.",
  component: Snippets,
};
export { Snippets };
