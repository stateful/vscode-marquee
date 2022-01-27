import React from 'react';

import { HN_API } from './constants';
import type { WidgetState, HackerNews } from "./types";

export async function fetchNews (data: WidgetState, setData: React.Dispatch<React.SetStateAction<WidgetState>>) {
  setData({ ...data, isFetching: true });

  const resp = await fetch(
    HN_API + data.channel,
    { mode: 'cors' }
  ).catch((err) => ({
    ok: false,
    status: 0,
    json: () => err
  }));

  if (!resp.ok) {
    return setData({
      ...data,
      isFetching: false,
      error: new Error(`Failed to fetch news! (status: ${resp.status})`)
    });
  }

  setData({
    isFetching: false,
    news: await resp.json() as HackerNews[],
    channel: data.channel
  });
}
