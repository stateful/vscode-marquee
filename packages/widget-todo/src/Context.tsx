import React, { createContext, useState, useEffect } from "react";
import { connect, getEventListener, MarqueeEvents, MarqueeWindow } from "@vscode-marquee/utils";

import AddDialog from "./dialogs/AddDialog";
import EditDialog from "./dialogs/EditDialog";
import { DEFAULT_STATE, DEFAULT_CONFIGURATION } from "./constants";
import type { Todo, Context, Configuration, State } from './types';

declare const window: MarqueeWindow;

const TodoContext = createContext<Context>({} as Context);

const TodoProvider = ({ children }: { children: React.ReactElement }) => {
  const eventListener = getEventListener<MarqueeEvents>();
  const widgetState = getEventListener<Configuration & State>('@vscode-marquee/todo-widget');
  const providerValues = connect<Configuration & State>({ ...DEFAULT_CONFIGURATION, ...DEFAULT_STATE }, widgetState);

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState<string | undefined>();

  let _addTodo = (body: string, tags: string[] = [], isWorkspaceTodo = true) => {
    const globalTodos: Todo[] = providerValues.todos;
    const randomString = [...Array(8)].map(() => Math.random().toString(36)[2]).join('');
    globalTodos.unshift({
      body,
      tags,
      checked: false,
      id: randomString,
      archived: false,
      workspaceId: isWorkspaceTodo && window.activeWorkspace
        ? window.activeWorkspace.id
        : null,
    });
    providerValues.setTodos(globalTodos);
  };

  let _removeTodo = (id: string) => {
    let globalTodos: Todo[] = providerValues.todos;
    let newTodos = globalTodos.filter((todo) => todo.id !== id);
    providerValues.setTodos(newTodos);
  };

  let _updateTodo = (todo: Todo) => {
    let globalTodos: Todo[] = providerValues.todos;
    let index = globalTodos.findIndex((entry) => entry.id === todo.id);
    globalTodos[index] = todo;
    providerValues.setTodos(globalTodos);
  };

  let _resetTodos = () => {
    providerValues.setTodos([]);
  };

  useEffect(() => {
    eventListener.on('openAddTodoDialog', setShowAddDialog);
    eventListener.on('openEditTodoDialog', setShowEditDialog);
  }, []);

  return (
    <TodoContext.Provider
      value={{
        ...providerValues,

        showAddDialog,
        setShowAddDialog,
        showEditDialog,
        setShowEditDialog,

        _resetTodos,
        _addTodo,
        _removeTodo,
        _updateTodo
      }}
    >
      { showAddDialog && (
        <AddDialog close={() => setShowAddDialog(false)} />
      )}
      { showEditDialog && providerValues.todos.find((t) => showEditDialog === t.id) && (
        <EditDialog
          close={() => setShowEditDialog(undefined)}
          todo={providerValues.todos.find((t) => showEditDialog === t.id)!}
        />
      )}
      {children}
    </TodoContext.Provider>
  );
};

export default TodoContext;

export { TodoProvider };
