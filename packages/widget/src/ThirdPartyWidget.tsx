import React from 'react'
import { Box, Grid, Typography } from '@mui/material'

import HidePop from './HidePop'
import Dragger from './Dragger'

interface Props {
  name: string;
  label: string;
}

const ThirdPartyWidget = ({ name, label }: Props) => {
  const WidgetTag = name

  return (
    <>
      <Grid item xs={1} style={{ maxWidth: '100%' }}>
        <Box sx={{
          borderBottom: '1px solid var(--vscode-foreground)',
          padding: '8px',
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
                  <Dragger />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Box>
      </Grid>
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
    </>
  )
}

export default ThirdPartyWidget
