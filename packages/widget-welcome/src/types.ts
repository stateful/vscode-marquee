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

export interface Context extends ContextProperties<State> {
  _setLiked: (id: string) => void
  _setRead: (id: string) => void
  _resetRead: () => void
};

export interface State {
  read: string[];
  liked: string[];
  tricks: Trick[];
  error: Error | null;
}

export interface Configuration {}

export interface Events {
  upvote: string;
}

export interface Storage extends Pick<Context, 'read' | 'liked'> {}
