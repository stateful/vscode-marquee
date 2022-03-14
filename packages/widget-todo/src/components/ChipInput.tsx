import React, { KeyboardEvent, useEffect } from "react";
import Chip from "@material-ui/core/Chip";
import TextField from "@material-ui/core/TextField";
import { InputAdornment, TextFieldProps } from "@material-ui/core";

type Props = Omit<TextFieldProps, "value" | "onChange"> & {
  value: Array<string>;
  onChange: (tags: Array<string>) => void;
};

export default function TagsInput({ onChange, value, ...inputProps }: Props) {
  const [inputValue, setInputValue] = React.useState("");
  const [selectedItems, setSelectedItems] = React.useState(value ?? []);

  useEffect(() => {
    onChange(selectedItems);
  }, [selectedItems, onChange]);

  function handleKeyDown(
    event: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    if (event.key === "Enter") {
      if (!selectedItems.includes(inputValue)) {
        // only add new tag if it's not a duplicate
        setSelectedItems((oldSelectedItems) => [
          ...oldSelectedItems,
          inputValue,
        ]);
      }
      setInputValue("");
    }
    if (
      event.key === "Backspace" &&
      selectedItems.length > 0 &&
      inputValue.length === 0
    ) {
      // Removing last tag on backspace, and populating the text input with the
      // respective value.
      const lastItem = selectedItems.slice(-1).pop()!;
      setInputValue(lastItem);
      setSelectedItems((oldSelectedItems) => oldSelectedItems.slice(0, -1));
    }
  }

  const handleDelete = (item: string) => () => {
    setSelectedItems((oldSelectedItems) =>
      oldSelectedItems.filter((it) => it !== item)
    );
  };

  return (
    <TextField
      value={inputValue}
      InputProps={{
        startAdornment: selectedItems.map((item) => (
          <InputAdornment
            position="start"
          >
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
