import React, { useState } from 'react'
import { Box, Dialog, Grid, Typography } from '@mui/material'

import HidePop from './HidePop'
import Dragger from './Dragger'
import ToggleFullScreen from './ToggleFullScreen'

interface Props {
  name: string;
  label: string;
}
const WidgetBody = ({ name } : { name:string }) => {
  const WidgetTag = name
  return(
    <Grid item xs>
      <Grid
        container
        wrap="nowrap"
        direction="column"
        style={{ height: '100%' }}
      >
        <Grid item xs style={{ overflow: 'auto' }}>
          <WidgetTag />
        </Grid>
      </Grid>
    </Grid>
  )
}

const ThirdPartyWidget = ({ name, label }: Props) => {
  const [fullscreenMode, setFullscreenMode] = useState(false)
  if(!fullscreenMode){
    return (
      <>
        <Grid item xs={1} style={{ maxWidth: '100%' }}>
          <Box sx={{
            borderBottom: '1px solid var(--vscode-editorGroup-border)',
            padding: '8px 8px 4px',
          }}>
            <Grid
              container
              direction="row"
              wrap="nowrap"
              alignItems="stretch"
              alignContent="stretch"
              justifyContent="space-between"
            >
              <Grid item>
                <Typography variant="subtitle1">{label}</Typography>
              </Grid>
              <Grid item>
                <Grid container direction="row" spacing={1}>
                  <Grid item>
                    <HidePop name={name} />
                  </Grid>
                  <Grid item>
                    <ToggleFullScreen toggleFullScreen={setFullscreenMode} isFullScreenMode={fullscreenMode} />
                  </Grid>
                  <Grid item>
                    <Dragger />
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Box>
        </Grid>
        <WidgetBody name={name} />
      </>
    )
  }
  return (
    <Dialog fullScreen open={fullscreenMode} onClose={() => setFullscreenMode(false)}>
      <Grid item xs={1} style={{ maxWidth: '100%' }}>
        <Box sx={{
          borderBottom: '1px solid var(--vscode-editorGroup-border)',
          padding: '8px 8px 4px',
        }}>
          <Grid
            container
            direction="row"
            wrap="nowrap"
            alignItems="stretch"
            alignContent="stretch"
            justifyContent="space-between"
          >
            <Grid item>
              <Typography variant="subtitle1">{label}</Typography>
            </Grid>
            <Grid item>
              <Grid container direction="row" spacing={1}>
                <Grid item>
                  <HidePop name={name} />
                </Grid>
                <Grid item>
                  <ToggleFullScreen toggleFullScreen={setFullscreenMode} isFullScreenMode={fullscreenMode} />
                </Grid>
                <Grid item>
                  <Dragger />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Box>
      </Grid>
      <WidgetBody name={name} />
    </Dialog>
  )
}

export default ThirdPartyWidget
