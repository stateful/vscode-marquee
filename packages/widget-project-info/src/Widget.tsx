import React, { useState } from 'react'
import { Box, Grid, TextField, Typography } from '@material-ui/core'

import wrapper, { Dragger, HidePop } from '@vscode-marquee/widget'
import SplitterLayout from 'react-splitter-layout'
import ClearIcon from '@material-ui/icons/Clear'
import { ProjectInfoProvider } from './Context'

const ProjectInfo = () => {
  const [splitterSize, setSplitterSize] = useState(80)
  const [filter, setFilter] = useState('')

  return (
    <>
      <Grid item style={{ maxWidth: '100%' }}>
        <Box
          sx={{
            borderBottom: '1px solid var(--vscode-foreground)',
            padding: '8px',
          }}
        >
          <Grid
            container
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Grid item>
              <Grid container direction="row" spacing={1} alignItems="center">
                <Grid item>
                  <Typography variant="subtitle1">ProjectInfo</Typography>
                </Grid>
              </Grid>
            </Grid>
            <Grid item>
              <Grid container direction="row" spacing={1} alignItems="center">
                <Grid item>
                  <HidePop name="markdown" />
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
          <Grid item xs style={{ overflow: 'hidden' }}>
            <SplitterLayout
              percentage={true}
              primaryIndex={0}
              secondaryMinSize={10}
              primaryMinSize={10}
              secondaryInitialSize={splitterSize}
              onSecondaryPaneSizeChange={setSplitterSize}
            >
              <div
                style={{
                  height: '100%',
                  overflow: 'hidden',
                }}
              >
                <Grid
                  container
                  wrap="nowrap"
                  direction="column"
                  style={{
                    height: '100%',
                    overflow: 'hidden',
                  }}
                >
                  <Grid item style={{ maxWidth: '100%', padding: '8px' }}>
                    <TextField
                      margin="dense"
                      placeholder="Filter..."
                      fullWidth
                      size="small"
                      value={filter}
                      onChange={(e) => setFilter(e.target.value)}
                      InputProps={{
                        endAdornment: (
                          <ClearIcon
                            fontSize="small"
                            style={{ cursor: 'pointer' }}
                            onClick={() => setFilter('')}
                          />
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs style={{ maxWidth: '100%' }}>
                    YOOO
                  </Grid>
                </Grid>
              </div>
              <div style={{ height: '100%', padding: '16px' }}>EHIIIIIII</div>
            </SplitterLayout>
          </Grid>
        </Grid>
      </Grid>
    </>
  )
}

export default wrapper(
  () => (
    <ProjectInfoProvider>
      <ProjectInfo />
    </ProjectInfoProvider>
  ),
  'project-info'
)
