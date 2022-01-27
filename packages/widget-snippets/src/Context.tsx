import React, { createContext, useState, useEffect } from "react";
import { store, createConsumer, getEventListener, MarqueeEvents } from "@vscode-marquee/utils";

import type { Context, Snippet } from './types';
import AddDialog from "./dialogs/AddDialog";
import EditDialog from "./dialogs/EditDialog";

const SnippetContext = createContext<Context>({} as Context);

let hasRegisteredListener = false;

const SnippetProvider = ({ children }: { children: React.ReactElement }) => {
  const eventListener = getEventListener<MarqueeEvents>();
  const snippetStore = store("snippets", false);

  const [snippets, setSnippets] = useState([] as Snippet[]);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState(null as (string | null));
  const [snippetFilter, setSnippetFilter] = useState("");
  const [snippetSelected, setSnippetSelected] = useState("");
  const [snippetSplitter, setSnippetSplitter] = useState(80);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState<string | undefined>();

  const _updateSnippetFilter = (snippetfilter: string) => {
    setSnippetFilter(snippetfilter);
    snippetStore.set("snippetFilter", snippetfilter);
  };

  const _updateSnippetSelected = (snippetSelected: string) => {
    setSnippetSelected(snippetSelected);
    snippetStore.set("snippetSelected", snippetSelected);
  };

  const _updateSnippetSplitter = (percentage: number) => {
    setSnippetSplitter(percentage);
    snippetStore.set("snippetSplitter", percentage);
  };

  const _addSnippet = (snippet: Partial<Snippet>, cb?: (id: string) => void) => {
    const globalSnippets: Snippet[] = snippetStore.get("snippets") || [];
    const id = [...Array(8)].map(() => Math.random().toString(36)[2]).join('');

    const newSnippet: Snippet = Object.assign({}, snippet, {
      id: id,
      archived: false,
      createdAt: new Date().getTime(),
      origin: null,
      workspaceId: activeWorkspaceId,
    });

    globalSnippets.unshift(newSnippet);
    setSnippets(globalSnippets);
    snippetStore.set("snippets", globalSnippets);

    if (cb) {
      cb(id);
    }
  };
  if (!hasRegisteredListener && activeWorkspaceId) {
    hasRegisteredListener = true;
    eventListener.on('addSnippet', (snippet: Snippet) => {
      if (typeof snippet !== 'object') {
        return;
      }
      _addSnippet(snippet);
    });
  }

  const _removeSnippet = (id: string) => {
    const globalSnippets: Snippet[] = snippetStore.get("snippets") || [];
    const index = globalSnippets.findIndex((snippet) => snippet.id === id);
    globalSnippets.splice(index, 1);

    setSnippets(globalSnippets);
    snippetStore.set("snippets", globalSnippets);
  };

  const _updateSnippet = (snippet: Snippet) => {
    const newSnippets = snippets.map((entry) => {
      if (snippet.id === entry.id) {
        return Object.assign({}, entry, snippet);
      } else {
        return entry;
      }
    });
    setSnippets(newSnippets);
    snippetStore.set("snippets", newSnippets);
  };

  const _setSnippets = (snippets: Snippet[]) => {
    setSnippets(snippets);
    snippetStore.set("snippets", snippets);
  };

  const handler = () => {
    const globalSnippets: Snippet[] = snippetStore.get("snippets") || [];
    if (JSON.stringify(globalSnippets) !== JSON.stringify(snippets)) {
      setSnippets(globalSnippets);
    }

    setSnippetFilter(snippetStore.get("snippetFilter") || "");
    setSnippetSelected(snippetStore.get("snippetSelected") || 0);
    setSnippetSplitter(snippetStore.get("snippetSplitter") || 80);
  };

  useEffect(() => {
    snippetStore.subscribe(handler as any);
    handler();
    createConsumer("activeWorkspace").subscribe((aws) => {
      if (aws && aws.id) {
        setActiveWorkspaceId(aws.id);
      }
    });

    eventListener.on('openAddSnippetDialog', setShowAddDialog);
    eventListener.on('openEditSnippetDialog', setShowEditDialog);
  }, []);

  return (
    <SnippetContext.Provider
      value={{
        snippets,
        snippetFilter,
        snippetSelected,
        snippetSplitter,
        _addSnippet,
        _removeSnippet,
        _updateSnippet,
        _setSnippets,
        _updateSnippetFilter,
        _updateSnippetSelected,
        _updateSnippetSplitter,

        showAddDialog,
        setShowAddDialog,
        showEditDialog,
        setShowEditDialog
      }}
    >
      { showAddDialog && (
        <AddDialog close={() => setShowAddDialog(false)} />
      )}
      { showEditDialog && snippets.find((s) => showEditDialog === s.id) && (
        <EditDialog snippet={snippets.find((s) => showEditDialog === s.id)!} close={() => setShowEditDialog(undefined) } />
      )}
      {children}
    </SnippetContext.Provider>
  );
};

export default SnippetContext;

export { SnippetProvider };
