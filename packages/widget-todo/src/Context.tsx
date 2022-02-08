import React, { createContext, useState, useEffect } from "react";
import { connect, getEventListener, MarqueeWindow } from "@vscode-marquee/utils";

import AddDialog from "./dialogs/AddDialog";
import EditDialog from "./dialogs/EditDialog";
import type { Todo, Context, Configuration, State, Events } from './types';

declare const window: MarqueeWindow;

const TodoContext = createContext<Context>({} as Context);
const WIDGET_ID = '@vscode-marquee/todo-widget';

const TodoProvider = ({ children }: { children: React.ReactElement }) => {
  const eventListener = getEventListener<Events>();
  const widgetState = getEventListener<Configuration & State>(WIDGET_ID);
  const providerValues = connect<Configuration & State>({
    ...window.marqueeStateConfiguration[WIDGET_ID].state,
    ...window.marqueeStateConfiguration[WIDGET_ID].configuration
  }, widgetState);

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
    return () => {
      widgetState.removeAllListeners();
      eventListener.removeAllListeners();
    };
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
