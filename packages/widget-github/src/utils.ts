import type { MarqueeWindow } from '@vscode-marquee/utils';

import type { Since, SpokenLanguage } from './types';

declare const window: MarqueeWindow;
const ERROR_MESSAGE = "Couldn't fetch GitHub trends!";

export async function fetchData (since?: Since, language?: SpokenLanguage, spoken?: SpokenLanguage) {
  const searchParams = new URLSearchParams({ props: window.marqueeUserProps });

  if (since) {
    searchParams.append('since', since.value);
  }
  if (language) {
    searchParams.append('language', language.urlParam);
  }
  if (spoken) {
    searchParams.append('spoken', spoken.urlParam);
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
