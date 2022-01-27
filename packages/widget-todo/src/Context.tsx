import React, { createContext, useState, useEffect } from "react";
import { store, createConsumer, getEventListener, MarqueeEvents } from "@vscode-marquee/utils";
import AddDialog from "./dialogs/AddDialog";
import EditDialog from "./dialogs/EditDialog";
import type { Todo, Context } from './types';

const TodoContext = createContext<Context>({} as Context);

const TodoProvider = ({ children }: { children: React.ReactElement }) => {
  const eventListener = getEventListener<MarqueeEvents>();
  const todoStore = store("todos", false);

  const [todos, setTodos] = useState([] as Todo[]);
  const [todoFilter, setTodoFilter] = useState("");
  const [hide, setHide] = useState(false);
  const [autoDetect, setAutoDetect] = useState(true);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState(null);
  const [showArchived, setShowArchived] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState<string | undefined>();

  useEffect(() => {
    todoStore.set("todoFilter", todoFilter);
  }, [todoFilter]);

  useEffect(() => {
    todoStore.set("hide", hide);
  }, [hide]);

  useEffect(() => {
    todoStore.set("showArchived", showArchived);
  }, [showArchived]);

  let _addTodo = (body: string, tags: string[] = []) => {
    const globalTodos: Todo[] = todoStore.get("todos") || [];
    const randomString = [...Array(8)].map(() => Math.random().toString(36)[2]).join('');
    globalTodos.unshift({
      body,
      tags,
      checked: false,
      id: randomString,
      archived: false,
      workspaceId: activeWorkspaceId,
    });
    setTodos(globalTodos);
    todoStore.set("todos", globalTodos);
  };

  let _removeTodo = (id: string) => {
    let globalTodos: Todo[] = todoStore.get("todos") || [];
    let newTodos = globalTodos.filter((todo) => todo.id !== id);
    setTodos(globalTodos);
    todoStore.set("todos", newTodos);
  };

  let _updateTodo = (todo: Todo) => {
    let globalTodos: Todo[] = todoStore.get("todos") || [];
    let index = globalTodos.findIndex((entry) => entry.id === todo.id);
    globalTodos[index] = todo;
    setTodos(globalTodos);
    todoStore.set("todos", globalTodos);
  };

  let _setTodos = (todos: Todo[]) => {
    setTodos(todos);
    todoStore.set("todos", todos);
  };

  let _updateFilter = (todoFilter: string) => {
    setTodoFilter(todoFilter);
  };

  let _updateHide = (hide: boolean) => {
    setHide(hide);
  };

  let _updateShowArchived = (show: boolean) => {
    setShowArchived(show);
  };

  let _updateAutoDetect = (auto: boolean) => {
    setAutoDetect(auto);
    todoStore.set("autoDetect", auto);
  };

  let _resetTodos = () => {
    todoStore.set("todos", []);
  };

  const handler = () => {
    setAutoDetect(todoStore.get("autoDetect"));
    let globalTodos = todoStore.get("todos") || [];
    if (JSON.stringify(globalTodos) !== JSON.stringify(todos)) {
      setTodos(globalTodos);
    } else if (todos.length === 0) {
      setTodos(globalTodos);
    }
    setTodoFilter(todoStore.get("todoFilter") || "");
    setHide(todoStore.get("hide") || false);
    setShowArchived(todoStore.get("showArchived") || false);
  };

  useEffect(() => {
    todoStore.subscribe(handler as any);
    handler();
    createConsumer("activeWorkspace").subscribe((aws) => {
      if (aws && aws.id) {
        setActiveWorkspaceId(aws.id);
      }
    });

    eventListener.on('openAddTodoDialog', setShowAddDialog);
    eventListener.on('openEditTodoDialog', setShowEditDialog);
  }, []);

  return (
    <TodoContext.Provider
      value={{
        todos,
        todoFilter,
        hide,
        showArchived,
        autoDetect,
        activeWorkspaceId,

        showAddDialog,
        setShowAddDialog,
        showEditDialog,
        setShowEditDialog,

        _resetTodos,
        _addTodo,
        _removeTodo,
        _updateTodo,
        _setTodos,
        _updateHide,
        _updateFilter,
        _updateShowArchived,
        _updateAutoDetect,
      }}
    >
      { showAddDialog && (
        <AddDialog close={() => setShowAddDialog(false)} />
      )}
      { showEditDialog && todos.find((t) => showEditDialog === t.id) && (
        <EditDialog close={() => setShowEditDialog(undefined)} todo={todos.find((t) => showEditDialog === t.id)!} />
      )}
      {children}
    </TodoContext.Provider>
  );
};

export default TodoContext;

export { TodoProvider };
