import React, { ReactChild } from 'react'
import { Box, Grid } from '@mui/material'

let HeaderWrapper = ({ children }: { children: ReactChild }) => {
  return (
    <Grid item style={{ maxWidth: '100%' }}>
      <Box
        sx={{
          borderBottom: '1px solid var(--vscode-editorGroup-border)',
          padding: '8px 8px 4px'
        }}
      >
        <Grid
          container
          direction="row"
          wrap="nowrap"
          alignContent="stretch"
          alignItems="center"
          justifyContent="space-between"
        >
          {children}
        </Grid>
      </Box>
    </Grid>
  )
}

export default HeaderWrapper