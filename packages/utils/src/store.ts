import store from "store2";
import { fromEvent, PartialObserver } from "rxjs";
import { filter, pluck, map, throttleTime, catchError } from "rxjs/operators";

import type { MarqueeWindow } from './types';

declare const window: MarqueeWindow;

export default (namespace: string, persistOnly = false) => {
  if (window.vscode) {
    if (typeof persistOnly === "undefined") {
      persistOnly = true;
    }
    const message$ = fromEvent(window, "message");
    const persistence$ = message$.pipe(
      filter((ev: any) => typeof ev.data === "object"),
      map((ev: any) => ev.data),
      pluck("persistence"),
      filter((persistence) => typeof persistence !== "undefined"),
      // @ts-expect-error ToDo(Christian): find out if returning `null` works
      catchError((e) => {
        console.log(e);
        return null;
      })
    );

    const update$ = message$.pipe(
      filter((ev: any) => typeof ev.data === "object"),
      map((ev: any) => ev.data),
      pluck("east"),
      filter((east) => {
        return typeof east === "object";
      }),
      pluck(namespace),
      filter((data) => typeof data !== "undefined"),
      map((data) => {
        const obj: Record<string, any> = {};
        obj[namespace] = data;
        return obj;
      }),
      // @ts-expect-error ToDo(Christian): find out if returning `null` works
      catchError((e) => {
        console.log(e);
        return null;
      })
    );

    persistence$.subscribe((obj) => {
      window.vscode.setState(obj);
    });

    const api = {
      get: (key: string, alt?: any) => {
        const obj = window.vscode.getState();
        if (obj && key in obj) {
          return obj[key];
        } else if (alt) {
          return alt;
        }
        return null;
      },
      set: (key: string, val: any) => {
        const obj = window.vscode.getState() || {};
        if (obj) {
          obj[key] = val;
        }
        window.vscode.setState(obj);

        let update: Record<string, any> = { persistence: obj };
        if (!persistOnly) {
          update["west"] = {};
          update["west"][key] = val;
        }
        window.vscode.postMessage(update);

        return obj[key];
      },
      pop: (key: string, handler: any) => {
        persistence$
          .pipe(
            pluck(key),
            filter((obj) => typeof obj !== "undefined" && obj !== null),
            // @ts-expect-error ToDo(Christian): find out if returning `null` works
            catchError((e) => {
              console.log(e);
              return null;
            })
          )
          .subscribe((obj) => {
            api.set(key, null);
            handler(obj);
          });
      },
      subscribe: (handler: PartialObserver<any>) => {
        persistence$.subscribe(handler);
        if (!persistOnly) {
          update$.pipe(throttleTime(100)).subscribe((data) => {
            const obj = window.vscode.getState() || {};
            const newState = { ...obj, ...data };
            window.vscode.setState(newState);

            // @ts-expect-error ToDo(Christian) fix typing
            handler();
          });
        }
      },
    };
    return api;
  }

  const native = store.namespace(namespace);

  return {
    get: (key: string, alt?: any) => native.get(key, alt),
    set: (key: string, val: any, overwrite = false) => native.set(key, val, overwrite),
    subscribe: () => {
      /* noop */
    },
  };
};
