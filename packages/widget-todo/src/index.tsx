import React from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTasks } from "@fortawesome/free-solid-svg-icons";

import Todo from "./Widget";
import TodoContext, { TodoProvider } from "./Context";

export default {
  name: "todo",
  icon: <FontAwesomeIcon icon={faTasks} />,
  tags: ["todo", "organization", "productivity"],
  description: "The Todo widget for simplifying priorities.",
  component: Todo,
};
export { Todo, TodoContext, TodoProvider };
