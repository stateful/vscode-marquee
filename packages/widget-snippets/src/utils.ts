import { languages, vscLanguages } from './constants';
import type { Language } from './types';

export const getHighlightLanguage = (language: Language): Language => {
  let lang: Language = language;
  //if we get an unexpected language, default to text
  if (!language || typeof language !== "object") {
    return { name: "text", value: "text" };
  }

  //does the language exist in the available highliters
  let matches = languages.filter((entry) => {
    return language.value === entry.value;
  });

  //it doesn't exist in the highlighers
  if (matches.length === 0) {
    // is there a translation key to map to the right highlighter
    let hasMapping = vscLanguages.hasOwnProperty(language.value);
    if (hasMapping) {
      let key = vscLanguages[language.value];
      lang = { name: key, value: key } as Language;
    } else {
      // its a language object, and the string key doesn't exist
      // in either the available highliters
      // or in the vscode languages mapping
      lang = { name: "text", value: "text" } as Language;
    }
  }

  return lang;
};

