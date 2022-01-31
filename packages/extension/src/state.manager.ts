import vscode from "vscode";
import crypto from "crypto";
import { Subject, from } from "rxjs";
import {
  pluck,
  filter,
  map,
  catchError,
  throttleTime,
  publishBehavior,
  refCount,
} from "rxjs/operators";
import { Item } from "./tree.view";

export const persistenceKey = "persistence";

export interface Message {
  feedback?: object;
  fwdgeo?: object;
  activeWorkspaceId?: string | null;
  autoDetect?: boolean;
  execCommands?: Array<{ command: string; args: Array<object>, options?: any }>;
  globalScope?: boolean;
  geo?: object;
  language?: any;
  liked?: Array<string>;
  modeName?: string;
  modes?: Array<{ layouts: Array<object>; widgets: Array<object> }>;
  news?: Array<object>;
  snippets?: Array<object>;
  dialogs?: Array<object>;
  read?: Array<string>;
  since?: any;
  theme?: object;
  persistence?: object;
  ready?: boolean;
  scope?: boolean;
  todos?: Array<object>;
  notes?: Array<object>;
  tricks?: Array<object>;
  upvote?: object;
  notify?: { type: NotificationType; message: string };
  version?: string;
  east?: Message;
  west?: Message;
  widgets?: any;
  workspaces?: Array<object>;
}

export enum NotificationType {
  ERROR = "error",
}

export enum WorkspaceType {
  WORKSPACE = "workspace",
  FOLDER = "folder",
  NONE = "none",
}

export interface Workspace {
  id: string;
  name: string;
  type: WorkspaceType;
  path: string;
}

export interface Todo {
  archived: boolean;
  body: string;
  checked: boolean;
  id: string;
  path: string;
  exists?: boolean;
  language: string;
  workspaceId: string | undefined;
}

export interface Snippet {
  archived: boolean;
  title: string;
  body: string;
  createdAt: number;
  id: string;
  origin?: string;
  path: string;
  exists?: boolean;
  language: { name: string; value: string };
  workspaceId: string | undefined;
}

export type Note = Snippet;

export class StateManager {
  protected readonly internal = new Subject<Message>();
  public readonly state = this.internal.pipe(publishBehavior({}), refCount());

  constructor(private readonly context: vscode.ExtensionContext) {
    this.handlePersistence();
  }

  receive(msg: Message) {
    this.emit(msg);
  }

  emit(msg: Message) {
    this.internal.next(msg);
  }

  update(msg: Message) {
    const obj: Message = { ...msg };
    delete obj.persistence;
    const east: Message = { east: obj };
    this.emit(east);
  }

  handlePersistence() {
    const persistence$ = this.state.pipe(
      pluck(persistenceKey),
      filter((save: any) => save !== undefined)
    );
    persistence$
      .pipe(
        map((save) => {
          const obj = {
            ...this.recover(),
            ...save,
          };
          return obj;
        }),
        map((obj) => {
          return from(this.context.globalState.update(persistenceKey, obj));
        }),
        catchError((err: any) => {
          console.log(err);
          return err;
        })
      )
      .subscribe();
  }

  recover(): any {
    return this.context.globalState.get<object>(persistenceKey, {});
  }

  save(handler: Function) {
    const latest = this.recover();
    delete latest.persistence;

    const obj = handler(latest);

    from(this.context.globalState.update(persistenceKey, obj)).subscribe(() => {
      this.emit({ east: obj });
    });
  }

  handleUpdates(obs?: any) {
    const updates = this.state.pipe(
      map((msg) => {
        // console.log(new Date());
        // console.log(JSON.stringify(Object.keys(msg)));

        const obj: Message = { ...msg };
        delete obj.persistence;
        delete obj.ready;
        return obj;
      }),
      filter((obj) => {
        return Object.keys(obj).length > 0;
      }),
      throttleTime(50) // unlikely humans are faster
    );

    if (obs) {
      updates.subscribe(obs);
    }

    return updates;
    // .pipe(
    //   tap((obj) => {
    //     console.log(new Date());
    //     console.log(Object.keys(obj));
    //   })
    // );
  }

  handleItem(op: Function) {
    return (item?: Item) => {
      this.save((latest: any) => {
        const t = `${item?.type.toLowerCase()}s`;
        const target = latest[t];
        if (target && item) {
          const newarr = target.map(op(item));
          const ret = { ...latest };
          ret[t] = newarr;
          return ret;
        }
        return latest;
      });
    };
  }

  /**
   * ToDo(Christian): remove once storage migration finished
   */
  public updateWorkspaces(latest: Message): Message {
    if (latest.workspaces === undefined) {
      latest.workspaces = [];
    }

    const aws = this.getActiveWorkspace();
    if (
      latest.activeWorkspaceId !== null &&
      latest.activeWorkspaceId !== undefined
    ) {
      latest.activeWorkspaceId = undefined;
    }

    if (
      /**
       * the current workspace can be detected
       */
      aws &&
      /**
       * the workspace path is not a number
       * (happens e.g. when connecting to docker container)
       */
      isNaN(Number(aws.path)) &&
      /**
       * the workspace isn't part of the existing list
       */
      !latest.workspaces.find((ws: any) => ws.id === aws.id) &&
      /**
       * we are not running on a remote machine, this is necessary
       * because we aren't able to connect to remote VSCode instances
       * through `vscode.openFolder`
       * see more: https://github.com/microsoft/vscode-remote-release/issues/6243
       */
      typeof vscode.env.remoteName === 'undefined'
    ) {
      latest.workspaces.push(aws);
    }

    return latest;
  }

  /**
   * ToDo(Christian): remove once storage migration finished
   */
  public getActiveWorkspace(): Workspace | null {
    const wsp = vscode.workspace;
    let name = wsp.name || "";
    let path = "";
    let type = WorkspaceType.NONE;

    if (wsp.workspaceFile) {
      type = WorkspaceType.WORKSPACE;
      path = wsp.workspaceFile.path;
    } else if (wsp.workspaceFolders) {
      type = WorkspaceType.FOLDER;
      path =
        wsp.workspaceFolders.length > 0 ? wsp.workspaceFolders[0].uri.path : "";
    }

    if (type && path) {
      const shasum = crypto.createHash("sha1");
      const id = shasum.update(path, "utf8").digest("hex");
      const nws: Workspace = { id, name, type, path };

      return nws;
    }

    return null;
  }
}
