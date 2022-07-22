import React from 'react'
import { Box, Grid, Typography } from '@mui/material'

import HidePop from './HidePop'
import Dragger from './Dragger'

interface Props {
  name: string
  label: string
  ToggleFullScreen: () => JSX.Element
}

const WidgetBody = ({ name }: { name: string }) => {
  const WidgetTag = name
  return (
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

const ThirdPartyWidget = ({ name, label, ToggleFullScreen }: Props) => {
  const WidgetHeader = () => (
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
                <HidePop name={name}/>
              </Grid>
              <Grid item>
                <ToggleFullScreen />
              </Grid>
              <Grid item>
                <Dragger />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Box>
    </Grid>
  )

  return (
    <>
      <WidgetHeader />
      <WidgetBody name={name} />
    </>
  )
}

export default ThirdPartyWidget
