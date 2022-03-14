import React, { KeyboardEvent } from "react";
import Chip from "@material-ui/core/Chip";
import TextField from "@material-ui/core/TextField";
import { InputAdornment, TextFieldProps } from "@material-ui/core";

type Props = Omit<TextFieldProps, "value" | "onChange"> & {
  value: Array<string>;
  onChange: (tags: Array<string>) => void;
};

export default function TagsInput({ onChange, value, ...inputProps }: Props) {
  const [inputValue, setInputValue] = React.useState("");

  function handleKeyDown(
    event: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    if (event.key === "Enter") {
      if (!value.includes(inputValue)) {
        // only add new tag if it's not a duplicate
        onChange([...value, inputValue]);
      }
      setInputValue("");
    }
    if (
      event.key === "Backspace" &&
      value.length > 0 &&
      inputValue.length === 0
    ) {
      // Removing last tag on backspace, and populating the text input with the
      // respective value.
      const lastItem = value.slice(-1).pop()!;
      setInputValue(lastItem);
      onChange(value.slice(0, -1));
    }
  }

  const handleDelete = (item: string) => () => {
    onChange(value.filter((it) => it !== item));
  };

  return (
    <TextField
      value={inputValue}
      InputProps={{
        startAdornment: value.map((item) => (
          <InputAdornment position="start">
            <Chip
              key={item}
              tabIndex={-1}
              label={item}
              onDelete={handleDelete(item)}
            />
          </InputAdornment>
        )),
        onChange: (event) => setInputValue(event.target.value),
        onBlur: () => setInputValue(""),
        onKeyDown: handleKeyDown,
      }}
      {...inputProps}
    />
  );
}
