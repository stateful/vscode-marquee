import { fromEvent } from "rxjs";
import {
  filter,
  pluck,
  map,
  catchError,
} from "rxjs/operators";

const message$ = fromEvent(window, "message");

export const createConsumer = (namespace: string) => {
  return message$.pipe(
    filter((ev: any) => {
      return typeof ev.data === "object";
    }),
    map((ev) => {
      return ev.data;
    }),
    pluck("east"),
    filter((east) => {
      return typeof east === "object";
    }),
    pluck(namespace),
    filter((obj) => typeof obj !== "undefined"),
    // @ts-expect-error rxjs catchError return null
    catchError((e) => {
      console.log(e);
      return null;
    })
  );
};
