import React, { useState, useEffect } from "react";
import { useDebouncedCallback } from "use-debounce";

import "codemirror/lib/codemirror.css";
import "../../css/codemirror.css";
import "../../css/codemirror-material.css";
import "../../css/codemirror-neo.css";

import { Controlled as CodeMirror } from "react-codemirror2";
require("codemirror/mode/yaml/yaml");
require("codemirror/mode/sql/sql");
require("codemirror/mode/jsx/jsx");
require("codemirror/mode/sass/sass");
require("codemirror/mode/css/css");
require("codemirror/mode/rust/rust");
require("codemirror/mode/ruby/ruby");
require("codemirror/mode/python/python");
require("codemirror/mode/php/php");
require("codemirror/mode/clike/clike");
require("codemirror/mode/htmlmixed/htmlmixed");
require("codemirror/mode/shell/shell");
require("codemirror/mode/cmake/cmake");
require("codemirror/mode/xml/xml");
require("codemirror/mode/go/go");
require("codemirror/mode/markdown/markdown");
require("codemirror/mode/stylus/stylus");
require("codemirror/mode/diff/diff");
require("codemirror/mode/javascript/javascript");
require("codemirror/mode/toml/toml");
require("codemirror/mode/vue/vue");

import { getHighlightLanguage } from "../utils";
import type { Language } from '../types';

interface SnippetEditorProps {
  body: string
  language?: Language
  onChange: (body: string) => void
}

let SnippetEditor = ({ body, language, onChange }: SnippetEditorProps) => {
  const [code, setCode] = useState(body);
  const [lang, setLang] = useState("markdown");

  useEffect(() => {
    if (body !== code) {
      setCode(body);
    }
  }, [body]);

  useEffect(() => {
    if (language) {
      setLang(getHighlightLanguage(language).value);
    }
  }, [language]);

  const _onChange = useDebouncedCallback((value) => {
    onChange(value);
  }, 200);

  let theme = "neo";
  if (document.body.classList[0] !== "vscode-light") {
    theme = "material";
  }

  return (
    <CodeMirror
      value={code}
      options={{
        mode: lang,
        theme: theme,
        lineNumbers: true,
        lineWrapping: true,
      }}
      onBeforeChange={(editor, data, value) => {
        setCode(value);
        _onChange(value);
      }}
    />
  );
};

export default React.memo(SnippetEditor);
