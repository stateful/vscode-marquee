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

export interface Context {
  tricks: Trick[];
  read: string[];
  liked: string[];
  error?: Error;

  setTricks: React.Dispatch<React.SetStateAction<Trick[]>>
  _setLiked: (id: string) => void;
  _setRead: (id: string) => void;
  _resetRead: () => void;
}

export interface State {
  tricks: Trick[];
  read: string[];
  liked: string[];
  error?: Error;

  upvote: string
}

export interface Storage extends Pick<Context, 'read' | 'liked'> {}
