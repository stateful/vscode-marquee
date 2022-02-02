import vscode from "vscode";
import path from "path";

import { MarqueeEvents } from "@vscode-marquee/utils";
import { Message, StateManager, Todo, Snippet, Note } from "./state.manager";

import { isExpanded, filterByScope } from './utils';

const DEFAULT_STATE = { todos: [], snippets: [], notes: [] };

export interface Dialog {
  note?: any;
  snippet?: any;
  todo?: any;
}

export interface ContextMenu {
  readonly id: string;
  getDialogs(cmd: string): keyof MarqueeEvents;
}

interface Elem {
  id: number;
  type: string;
  caption: string;
}

export class TreeView implements vscode.TreeDataProvider<Item> {
  private _onDidChangeTreeData: vscode.EventEmitter<Item | undefined> = new vscode.EventEmitter<Item | undefined>();
  readonly onDidChangeTreeData: vscode.Event<Item | undefined> = this._onDidChangeTreeData.event;
  private readonly toplevel: Array<Elem> = [
    { id: 0, type: "todo", caption: "Todo" },
    { id: 1, type: "snippets", caption: "Snippets" },
    { id: 2, type: "notes", caption: "Notes" }
  ];
  private state: Message = DEFAULT_STATE;
  public focus: Item | null = null;

  constructor(
    private readonly context: vscode.ExtensionContext,
    private readonly stateMgr: StateManager
  ) {


    this.context.subscriptions.push(
      vscode.commands.registerCommand("marquee.toggleScope", () => {
        this.toggleScope();
      })
    );

    this.update();
    this._updateTodos();
  }

  clearTree () {
    this.state = DEFAULT_STATE;
    this.update();
  }

  private update() {
    this.stateMgr.handleUpdates(this.handleStateManagerUpdates.bind(this));
  }

  private _updateTodos () {
    const aws = this.stateMgr.getActiveWorkspace();
    const recovered = this.stateMgr.recover();
    const { todos } = this.context.globalState.get('widgets.todo') || {};

    if (todos) {
      this.state.todos = filterByScope(
        todos,
        aws,
        recovered.globalScope
      );

      const openArr: any = [];
      const closedArr: any = [];
      this.state.todos.forEach((todo: any) => {
        if (todo.archived) {
          return;
        }
        if (todo.checked === false) {
          openArr.push(todo);
        } else {
          closedArr.push(todo);
        }
      });

      let todoIndex = this.toplevel.findIndex((entry: any) => {
        return entry.caption.indexOf("Todo") !== -1;
      });
      const scope = recovered.globalScope ? "global" : "workspace";
      this.toplevel[
        todoIndex
      ].caption = `Todo [${scope}] (${openArr.length} open / ${closedArr.length} closed)`;
    }
  }

  private handleStateManagerUpdates (msg: Message) {
    this._updateTodos();
    const aws = this.stateMgr.getActiveWorkspace();
    const obj: Message = { ...msg.east, ...msg.west };

    const recovered = this.stateMgr.recover();

    const snippets = obj.snippets ? obj.snippets : recovered.snippets || [];
    this.state.snippets = filterByScope(snippets, aws, recovered.globalScope);

    const notes = obj.notes ? obj.notes : recovered.notes || [];
    this.state.notes = filterByScope(notes, aws, recovered.globalScope);

    this.refresh();
  }

  toggleScope() {
    this.stateMgr.save((latest: any) => {
      latest.globalScope = !latest.globalScope;
      return latest;
    });

    this.update();
  }

  refresh(): void {
    this._onDidChangeTreeData.fire(undefined);
  }

  getChildren(element?: Item): Thenable<Item[]> {

    if (!element) {
      const elems = this.toplevel.map((elem) => {
        const item = new Item(
          elem.caption,
          elem.id.toString(),
          isExpanded(elem.id),
          this.context.extensionPath,
          elem.type
        );
        item.contextValue = `${elem.type}Headline`;
        if (item.contextValue === "todoHeadline") {
          this.focus = item;
        }
        return item;
      });

      return Promise.resolve(elems);
    } else {
      if (element.label.indexOf("Todo") !== -1) {
        return Promise.resolve(
          TodoItem.map(this.state.todos || [], this.context.extensionPath)
        );
      }

      if (element.label.indexOf("Snippets") !== -1) {
        return Promise.resolve(
          SnippetItem.map(this.state.snippets || [], this.context.extensionPath)
        );
      }

      if (element.label.indexOf("Notes") !== -1) {
        return Promise.resolve(
          NoteItem.map(this.state.notes || [], this.context.extensionPath)
        );
      }
    }

    return Promise.resolve([]);
  }

  getTreeItem(element: Item): vscode.TreeItem {
    return element;
  }

  getParent() {
    return null;
  }
}

export class Item extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public readonly id: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly basePath: string,
    public readonly type: string,
    public readonly command?: vscode.Command,
    public readonly checked?: boolean,
    public readonly archived?: boolean
  ) {
    super(label, collapsibleState);

    this.contextValue = this.type;

    const snippetsIconLight = this.getIconPath("snippets-light.svg");
    const snippetsIconDark = this.getIconPath("snippets-dark.svg");

    const checkedIconDark = this.getIconPath("checked-dark.svg");
    const checkedIconLight = this.getIconPath("checked-light.svg");

    const uncheckedIconDark = this.getIconPath("checked-border-dark.svg");
    const uncheckedIconLight = this.getIconPath("checked-border-light.svg");

    const addIconDark = this.getIconPath("add-dark.svg");
    const addIconLight = this.getIconPath("add-light.svg");

    switch (this.type) {
      case "AddNew":
        this.iconPath = {
          light: addIconDark,
          dark: addIconLight,
        };
        break;
      case "Snippet":
        this.iconPath = {
          light: snippetsIconDark,
          dark: snippetsIconLight,
        };
        break;
      case "Todo":
        const checkedLight: string = checked
          ? checkedIconLight
          : uncheckedIconLight;
        const checkedDark: string = checked
          ? checkedIconDark
          : uncheckedIconDark;

        this.iconPath = {
          light: checkedDark,
          dark: checkedLight,
        };
        break;
    }
  }

  linkItem(item: any) {
    const i: any = item.item;
    if (i.exists) {
      this.contextValue = `Linked${this.contextValue}`;
    }
  }

  protected getIconPath(file: string): string {
    return path.join(this.basePath, "assets", file);
  }
}

class TodoItem extends Item implements ContextMenu {
  constructor(
    public readonly label: string,
    public readonly id: string,
    public readonly item: Todo,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly basePath: string,
    public readonly type: string,
    public readonly command?: vscode.Command,
    public readonly checked?: boolean,
    public readonly archived?: boolean
  ) {
    super(
      label,
      id,
      collapsibleState,
      basePath,
      type,
      command,
      checked,
      archived
    );
    this.linkItem(this);
  }

  public getDialogs(cmd: 'edit'): keyof MarqueeEvents {
    if (cmd === 'edit') {
      return 'openEditTodoDialog';
    }
    throw new Error(`Unknown dialog "${cmd}"`);
  }

  public static map(todos: any, basePath: string): Array<any> {
    const ts = todos
      .filter((todo: any) => {
        return todo.archived === false;
      })
      .map((todo: any) => {
        // new Todo
        const t = new TodoItem(
          todo.body,
          todo.id,
          todo,
          vscode.TreeItemCollapsibleState.None,
          basePath,
          "Todo",
          {
            command: "marquee.toggleTodo",
            title: "Marquee toggle todo",
          },
          todo.checked,
          todo.archived
        );

        if (t.command) {
          t.command.arguments = [t];
        }
        return t;
      });
    if (ts.length < 1) {
      ts.push(
        // todo empty state
        new TodoItem(
          "Add new todo",
          "addtodos",
          {} as Todo,
          vscode.TreeItemCollapsibleState.None,
          basePath,
          "AddNew",
          {
            command: "marquee.addEmptyTodo",
            title: "Add new todo",
          }
        )
      );
    }

    return ts;
  }
}

class SnippetItem extends Item implements ContextMenu {
  constructor(
    public readonly label: string,
    public readonly id: string,
    public readonly item: Snippet,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly basePath: string,
    public readonly command: vscode.Command,
    public readonly empty: boolean = false,
    public readonly type: string = "Snippet"
  ) {
    super(label, id, collapsibleState, basePath, type);
    const dark = empty
      ? this.getIconPath("add-light.svg")
      : this.getIconPath("snippets-light.svg");
    const light = empty
      ? this.getIconPath("add-dark.svg")
      : this.getIconPath("snippets-dark.svg");

    this.iconPath = {
      light,
      dark,
    };

    this.linkItem(this);
  }

  public getDialogs(cmd: 'edit'): keyof MarqueeEvents {
    if (cmd === 'edit') {
      return 'openEditSnippetDialog';
    }
    throw new Error(`Unknown dialog "${cmd}"`);
  }

  public static map(snippets: any, basePath: string): Array<SnippetItem> {
    const snps = snippets.slice(0, 12).map((snippet: Snippet) => {
      const t = new SnippetItem(
        snippet.title,
        snippet.id,
        snippet,
        vscode.TreeItemCollapsibleState.None,
        basePath,
        {
          command: "marquee.insertSnippet",
          title: "Insert snippet",
        }
      );

      if (t.command) {
        t.command.arguments = [snippet];
      }

      return t;
    });

    if (snps.length < 1) {
      snps.push(
        new SnippetItem(
          "Add new snippet",
          "addItemSnippet",
          {} as Snippet,
          vscode.TreeItemCollapsibleState.None,
          basePath,
          {
            command: "marquee.addEmptySnippet",
            title: "Add new snippet",
          },
          true,
          "AddNew"
        )
      );
    }

    return snps;
  }
}

class NoteItem extends SnippetItem {
  constructor(
    public readonly label: string,
    public readonly id: string,
    public readonly item: Note,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly basePath: string,
    public readonly command: vscode.Command,
    public readonly empty: boolean = false,
    public readonly type: string = "Note"
  ) {
    super(
      label,
      id,
      item as Note,
      collapsibleState,
      basePath,
      command,
      empty,
      type
    );

    const dark = empty
      ? this.getIconPath("add-light.svg")
      : this.getIconPath("notes-light.svg");
    const light = empty
      ? this.getIconPath("add-dark.svg")
      : this.getIconPath("notes-dark.svg");

    this.iconPath = {
      light,
      dark,
    };
  }

  public getDialogs(cmd: 'edit'): keyof MarqueeEvents {
    if (cmd === 'edit') {
      return 'openEditNoteDialog';
    }
    throw new Error(`Unknown dialog "${cmd}"`);
  }

  public static map(notes: any, basePath: string): Array<NoteItem> {
    const ns = notes.slice(0, 12).map((note: Note) => {
      const t = new NoteItem(
        note.title,
        note.id,
        note,
        vscode.TreeItemCollapsibleState.None,
        basePath,
        {
          command: "marquee.edit",
          title: "Open note",
        }
      );

      if (t.command) {
        t.command.arguments = [t];
      }

      return t;
    });

    if (ns.length < 1) {
      ns.push(
        new NoteItem(
          "Add new note",
          "addItemNote",
          {} as Note,
          vscode.TreeItemCollapsibleState.None,
          basePath,
          {
            command: "marquee.addEmptyNote",
            title: "Add new note",
          },
          true,
          "AddNew"
        )
      );
    }

    return ns;
  }
}
