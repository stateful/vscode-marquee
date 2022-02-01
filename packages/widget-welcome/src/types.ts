import { ContextProperties } from "@vscode-marquee/utils";

export interface Trick {
  order: number;
  id: string;
  content: string;
  title: string;
  active: boolean;
  notify: boolean;
  createdAt: number;
  votes: { upvote: number }
}

type IgnoredSetters = 'setTricks' | 'setLiked' | 'setRead' | 'setError';
export type Context = Omit<ContextProperties<State & Pick<Events, 'error'>>, IgnoredSetters> & {
  _setLiked: (id: string) => void
  _setRead: (id: string) => void
  _resetRead: () => void
} & Pick<Events, 'tricks'>;

export interface State {
  read: string[];
  liked: string[];
}

export interface Configuration {}

export interface Events {
  upvote: string;
  tricks: Trick[];
  error?: Error;
}

export interface Storage extends Pick<Context, 'read' | 'liked'> {}
