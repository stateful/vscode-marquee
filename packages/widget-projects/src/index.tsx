import React from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faProjectDiagram } from "@fortawesome/free-solid-svg-icons/faProjectDiagram";

import Projects from "./Widget";

export default {
  name: "projects",
  icon: <FontAwesomeIcon icon={faProjectDiagram} />,
  tags: ["workspace", "organize", "productivity"],
  label: 'Projects',
  description: "Search and access VSCode project folders and workspaces.",
  component: Projects,
};
export { Projects };
