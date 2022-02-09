import React, { useState, useEffect } from "react";
import { useDebouncedCallback } from "use-debounce";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.core.css";
import "../../css/quill.bubble.css";

const toolbarOptions = [
  ["bold", "underline"],
  ["code-block"],
  [{ header: 1 }, { header: 2 }],
  [{ list: "bullet" }],
  [{ color: [] }],
  ['link']
];

interface NoteEditorProps {
  text?: string
  body?: string
  name?: string
  border?: string
  _change: (value: string, editorText: string) => void
}

let NoteEditor = ({
  text = "",
  body = "",
  name = "widget",
  border = "",
  _change,
}: NoteEditorProps) => {
  const [editorBody, setEditorBody] = useState(body || "");
  const [editorText, setEditorText] = useState(text || "");

  const editorCallback = useDebouncedCallback((value) => {
    _change(value, editorText);
  }, 200);

  const textCallback = useDebouncedCallback((editor) => {
    setEditorText(editor.getText());
  }, 200);

  useEffect(() => {
    if (body !== editorBody) {
      setEditorBody(body);
    }
  }, [body]);

  useEffect(() => {
    editorCallback(editorBody);
  }, [editorBody]);

  return (
    <div
      className={`noteEditorContainer-${name}`}
      style={{ border: border, minHeight: "100px" }}
    >
      <ReactQuill
        modules={{
          clipboard: {
            matchVisual: false,
          },
          toolbar: toolbarOptions,
        }}
        bounds={`.noteEditorContainer-${name}`}
        theme="bubble"
        placeholder="Type things here..."
        value={editorBody}
        onChange={(newBody, delta, source, editor) => {
          textCallback(editor);
          setEditorBody(newBody);
        }}
      />
    </div>
  );
};

export default React.memo(NoteEditor);
