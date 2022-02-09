import React, { useContext, useState, useEffect, useMemo } from "react";
import {
  Grid,
  IconButton,
  Divider,
  Chip,
} from "@material-ui/core";

import DoneIcon from "@material-ui/icons/Done";
import NavigateNextIcon from "@material-ui/icons/NavigateNext";
import NavigateBeforeIcon from "@material-ui/icons/NavigateBefore";
import ThumbUpAltIcon from "@material-ui/icons/ThumbUpAlt";

import { GlobalContext } from "@vscode-marquee/utils";
import type { MarqueeWindow } from '@vscode-marquee/utils';

import TrickContext from "../Context";
import type { Trick } from '../types';

declare const window: MarqueeWindow;

interface Props {
  trick: Trick
}

function createMarkup(content: string) {
  return { __html: content };
}

let LikeButton = React.memo((props: Props) => {
  const { liked, _setLiked } = useContext(TrickContext);
  let { trick } = props;

  let sendLike = async () => {
    window.vscode.postMessage({ west: { upvote: { id: trick.id } } });
    _setLiked(trick.id);
  };

  if (!liked.includes(trick.id)) {
    return (
      <Chip
        style={{
          border: "1px solid gray",
          padding: "4px",
        }}
        size="small"
        label="Like"
        clickable
        variant="outlined"
        onClick={() => {
          sendLike();
        }}
        icon={<ThumbUpAltIcon />}
      />
    );
  } else {
    return <></>;
  }
});

let TrickContent = () => {
  const { tricks, read, _setRead } = useContext(TrickContext);
  const { themeColor } = useContext(GlobalContext);

  let [infoIndex, setInfoIndex] = useState(0);

  let tricksArr = useMemo(() => {
    let notRead = tricks.filter((trick: Trick) => {
      return !read.includes(trick.id);
    });

    return notRead;
  }, [tricks, read]);

  useEffect(() => {
    if (!tricksArr[infoIndex]) {
      if (infoIndex !== 0) {
        setInfoIndex(infoIndex - 1);
      } else {
        setInfoIndex(0);
      }
    }
  }, [tricksArr]);

  return (
    <Grid
      container
      direction="column"
      wrap="nowrap"
      alignItems="center"
      style={{
        maxWidth: "100%",
        background: `rgba(${themeColor.r}, ${themeColor.g}, ${themeColor.b}, ${themeColor.a})`,
        padding: "8px",
        // margin: "4px",
        borderRadius: "4px",
        height: "90%",
        width: "100%",
      }}
    >
      <Grid item xs={9} style={{ maxWidth: "100%", width: "100%" }}>
        <Grid
          container
          alignItems="center"
          wrap="nowrap"
          direction="row"
          style={{ height: "100%" }}
        >
          <Grid item xs={1}>
            <Grid container justifyContent="center" alignContent="center">
              <Grid item>
                {infoIndex !== 0 && (
                  <IconButton
                    onClick={() => {
                      setInfoIndex(infoIndex - 1);
                    }}
                    size="small"
                  >
                    <NavigateBeforeIcon />
                  </IconButton>
                )}
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={10}>
            <Grid
              container
              alignItems="center"
              style={{
                minHeight: "110px",
                overflow: "auto",
                padding: "8px",
                paddingRight: "16px",
                paddingLeft: "16px",
                width: "100%",
              }}
            >
              <Grid item>
                {tricksArr.length === 0 && (
                  <div>You're all up to date 🚀, nice work! 🙃</div>
                )}
                {tricksArr.length !== 0 && tricksArr[infoIndex] && (
                  <div
                    dangerouslySetInnerHTML={createMarkup(
                      tricksArr[infoIndex].content
                    )}
                  />
                )}
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={1}>
            <Grid container justifyContent="center" alignContent="center">
              <Grid item>
                {tricksArr.length > 0 && infoIndex + 1 !== tricksArr.length && (
                  <IconButton
                    onClick={() => {
                      setInfoIndex(infoIndex + 1);
                    }}
                    size="small"
                  >
                    <NavigateNextIcon />
                  </IconButton>
                )}
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      <Grid item xs={1} style={{ maxWidth: "100%", width: "80%" }}>
        {tricksArr.length !== 0 && <Divider style={{ width: "100%" }} />}
      </Grid>

      <Grid item xs={2} style={{ maxWidth: "100%" }}>
        <Grid
          container
          justifyContent="space-evenly"
          alignItems="center"
          spacing={1}
          style={{ padding: "16px" }}
        >
          <Grid item>
            {tricksArr && tricksArr[infoIndex] && (
              <LikeButton trick={tricksArr[infoIndex]} />
            )}
          </Grid>
          <Grid item>
            {tricksArr && tricksArr[infoIndex] !== undefined && (
              <Chip
                style={{
                  padding: "4px",
                }}
                size="small"
                label="Mark as read"
                variant="outlined"
                clickable
                onClick={() => {
                  _setRead(tricksArr[infoIndex].id);
                }}
                icon={<DoneIcon />}
              />
            )}
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default React.memo(TrickContent);
