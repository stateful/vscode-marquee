import type { MarqueeWindow } from '@vscode-marquee/utils';

import { spokenLanguages, trendLanguages } from './constants';
import type { SinceConfiguration } from './types';

declare const window: MarqueeWindow;
const ERROR_MESSAGE = "Couldn't fetch GitHub trends!";

export async function fetchData (since?: SinceConfiguration, language?: string, spoken?: string) {
  const searchParams = new URLSearchParams({ props: window.marqueeUserProps });

  if (since) {
    searchParams.append('since', since.toLocaleLowerCase());
  }

  const languageParam = trendLanguages.find((l) => l.name === language);
  if (languageParam) {
    searchParams.append('language', languageParam.urlParam);
  }

  const spokenParam = spokenLanguages.find((l) => l.name === spoken);
  if (spokenParam) {
    searchParams.append('spoken', spokenParam.urlParam);
  }

  const url = `${window.marqueeBackendBaseUrl}/getRepositories?${searchParams.toString()}`;
  console.log(`Fetch repositories via: ${url}`);
  const res = await fetch(url).catch(
    () => { throw new Error(ERROR_MESSAGE); });

  if (!res.ok) {
    throw new Error(`${ERROR_MESSAGE} (status: ${res.status})`);
  }

  return res.json();
}
