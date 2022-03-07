import React, { useState, MouseEvent } from "react";
import Popover from "@mui/material/Popover";
import { Grid, Button } from "@mui/material";
import "emoji-mart/css/emoji-mart.css";
import { NimblePicker, Emoji, EmojiData, BaseEmoji, CustomEmoji } from "emoji-mart";
import ViewCompactIcon from "@mui/icons-material/ViewCompact";

import data from "./emoji-data.json";

interface EmojiPopProps {
  onSelect: (emoji: EmojiData) => void
  modeIcon?: BaseEmoji | CustomEmoji
}

let EmojiPop = ({ onSelect, modeIcon }: EmojiPopProps) => {
  const [anchorEl, setAnchorEl] = useState(null as (HTMLButtonElement | null));

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? "emoji-popover" : undefined;

  return (
    <div>
      <Button
        // size="small"
        onClick={handleClick}
        variant="outlined"
        startIcon={
          modeIcon ? <Emoji emoji={modeIcon} size={16} /> : <ViewCompactIcon />
        }
      >
        Change the icon
      </Button>

      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
      >
        <Grid container style={{ padding: "16px" }} direction="column">
          <NimblePicker
            theme={
              document.body.classList[0] === "vscode-light" ? "light" : "dark"
            }
            onSelect={onSelect}
            set="google"
            data={data}
            title="Marquee Modes"
            showSkinTones={false}
            showPreview={false}
          />
        </Grid>
      </Popover>
    </div>
  );
};

export default React.memo(EmojiPop);
