import React, { createContext, useState, useEffect } from "react";
import { store, createConsumer, getEventListener, MarqueeEvents } from "@vscode-marquee/utils";

import { IContext, Note } from './types';
import AddDialog from "./dialogs/AddDialog";
import EditDialog from "./dialogs/EditDialog";

const NoteContext = createContext<IContext>({} as IContext);

const NoteProvider = ({ children }: { children: React.ReactElement }) => {
  const eventListener = getEventListener<MarqueeEvents>();
  const noteStore = store("notes", false);

  const [notes, setNotes] = useState([] as Note[]);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState(null as (string | null));
  const [noteFilter, setNoteFilter] = useState("");
  const [noteSelected, setNoteSelected] = useState("");
  const [noteSplitter, setNoteSplitter] = useState(80);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState<string | undefined>();

  const _updateNoteFilter = (noteFilter: string) => {
    setNoteFilter(noteFilter);
    noteStore.set("noteFilter", noteFilter);
  };

  const _updateNoteSelected = (noteSelected: string) => {
    setNoteSelected(noteSelected);
    noteStore.set("noteSelected", noteSelected);
  };

  const _updateNoteSplitter = (percentage: number) => {
    setNoteSplitter(percentage);
    noteStore.set("noteSplitter", percentage);
  };

  const _addNote = (note: Partial<Note>, cb?: (id: string) => void) => {
    const globalNotes = noteStore.get("notes") || [];
    const id = [...Array(8)].map(() => Math.random().toString(36)[2]).join('');

    const newNote = Object.assign({}, note, {
      id: id,
      archived: false,
      createdAt: new Date().getTime(),
      origin: null,
      workspaceId: activeWorkspaceId,
    });

    globalNotes.unshift(newNote);
    setNotes(globalNotes);
    noteStore.set("notes", globalNotes);

    if (cb) {
      cb(id);
    }
  };

  const _removeNote = (id: string) => {
    const globalNotes: Note[] = noteStore.get("notes") || [];
    const index = globalNotes.findIndex((note) => note.id === id);
    globalNotes.splice(index, 1);

    setNotes(globalNotes);
    noteStore.set("notes", globalNotes);
  };

  const _updateNote = (note: Note) => {
    const globalNotes: Note[] = noteStore.get("notes") || [];
    const index = globalNotes.findIndex((entry) => entry.id === note.id);
    globalNotes[index] = note;
    setNotes(globalNotes);
    noteStore.set("notes", globalNotes);
  };

  const _setNotes = (notes: Note[]) => {
    setNotes(notes);
    noteStore.set("notes", notes);
  };

  const handler = () => {
    const globalNotes = noteStore.get("notes") || [];
    if (JSON.stringify(globalNotes) !== JSON.stringify(notes)) {
      setNotes(globalNotes);
    } else if (notes.length === 0) {
      setNotes(globalNotes);
    }

    setNoteFilter(noteStore.get("noteFilter") || "");
    setNoteSelected(noteStore.get("noteSelected") || 0);
    setNoteSplitter(noteStore.get("noteSplitter") || 80);
  };

  useEffect(() => {
    noteStore.subscribe(handler as any);
    handler();
    createConsumer("activeWorkspace").subscribe((aws) => {
      if (aws && aws.id) {
        setActiveWorkspaceId(aws.id);
      }
    });

    eventListener.on('openAddNoteDialog', setShowAddDialog);
    eventListener.on('openEditNoteDialog', setShowEditDialog);
  }, []);

  return (
    <NoteContext.Provider
      value={{
        notes,
        noteFilter,
        noteSelected,
        noteSplitter,
        _addNote,
        _removeNote,
        _updateNote,
        _setNotes,
        _updateNoteFilter,
        _updateNoteSelected,
        _updateNoteSplitter,

        showAddDialog,
        setShowAddDialog,
        showEditDialog,
        setShowEditDialog
      }}
    >
      {showAddDialog && (
        <AddDialog close={() => setShowAddDialog(false)} />
      )}
      { showEditDialog && notes.find((n) => n.id === showEditDialog) && (
        <EditDialog note={notes.find((n) => n.id === showEditDialog)!} close={() => setShowEditDialog(undefined) } />
      )}
      {children}
    </NoteContext.Provider>
  );
};

export default NoteContext;

export { NoteProvider };
