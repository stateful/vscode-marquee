import React, { createContext, useState, useEffect } from "react";
import { connect, getEventListener, MarqueeEvents, MarqueeWindow } from "@vscode-marquee/utils";

import AddDialog from "./dialogs/AddDialog";
import EditDialog from "./dialogs/EditDialog";
import type { State, Context, Note } from './types';

declare const window: MarqueeWindow;
const NoteContext = createContext<Context>({} as Context);
const WIDGET_ID = '@vscode-marquee/notes-widget';

const NoteProvider = ({ children }: { children: React.ReactElement }) => {
  const eventListener = getEventListener<MarqueeEvents>();
  const widgetState = getEventListener<State>(WIDGET_ID);
  const providerValues = connect<State>(window.marqueeStateConfiguration[WIDGET_ID].state, widgetState);

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState<string | undefined>();

  const _addNote = (note: Pick<Note, 'title' | 'body' | 'text'>, isWorkspaceTodo: boolean): string => {
    const globalNotes = providerValues.notes;
    const id = [...Array(8)].map(() => Math.random().toString(36)[2]).join('');

    const newNote = Object.assign({}, note, {
      id: id,
      archived: false,
      createdAt: new Date().getTime(),
      origin: null,
      workspaceId: isWorkspaceTodo
        ? window.activeWorkspace?.id || null
        : null,
    });

    globalNotes.unshift(newNote);
    providerValues.setNotes(globalNotes);
    return id;
  };

  const _removeNote = (id: string) => {
    const globalNotes = providerValues.notes;
    const index = globalNotes.findIndex((note) => note.id === id);

    if (index < 0) {
      return console.error(`Couldn't find note with id "${id}"`);
    }

    globalNotes.splice(index, 1);
    providerValues.setNotes(globalNotes);
  };

  const _updateNote = (note: Note) => {
    const globalNotes = providerValues.notes;
    const index = globalNotes.findIndex((entry) => entry.id === note.id);

    if (index < 0) {
      return console.error(`Couldn't find note with id "${note.id}"`);
    }

    if (JSON.stringify(note) === JSON.stringify(globalNotes[index])) {
      return;
    }

    globalNotes[index] = note;
    providerValues.setNotes(globalNotes);
  };

  useEffect(() => {
    eventListener.on('openAddNoteDialog', setShowAddDialog);
    eventListener.on('openEditNoteDialog', setShowEditDialog);
    return () => {
      widgetState.removeAllListeners();
      eventListener.removeAllListeners();
    };
  }, []);

  return (
    <NoteContext.Provider
      value={{
        ...providerValues,
        _addNote,
        _removeNote,
        _updateNote,

        showAddDialog,
        setShowAddDialog,
        showEditDialog,
        setShowEditDialog
      }}
    >
      {showAddDialog && (
        <AddDialog close={() => setShowAddDialog(false)} />
      )}
      { showEditDialog && providerValues.notes.find((n) => n.id === showEditDialog) && (
        <EditDialog note={providerValues.notes.find((n) => n.id === showEditDialog)!} close={() => setShowEditDialog(undefined) } />
      )}
      {children}
    </NoteContext.Provider>
  );
};

export default NoteContext;

export { NoteProvider };
