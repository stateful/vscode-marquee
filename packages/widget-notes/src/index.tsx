import React from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStickyNote } from "@fortawesome/free-solid-svg-icons";

import Notes from "./Widget";
import NoteContext, { NoteProvider } from "./Context";

export default {
  name: "notes",
  icon: <FontAwesomeIcon icon={faStickyNote} />,
  tags: ["productivity", "organize"],
  description:
    "Rich notes for planning, brainstorming and organizing ones thoughts.",
  component: Notes,
};
export { Notes, NoteContext, NoteProvider };
