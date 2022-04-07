import React, { useState } from 'react'
import Toolbar from '@mui/material/Toolbar'
import { Grid, Button, Box } from '@mui/material'

import ModeMorePop from './ModeMorePop'
import ModeAddDialog from '../dialogs/ModeAddDialog'

const ModeConfigToolbar = () => {
  const [showModeAddDialog, setShowModeAddDialog] = useState(false)

  return (
    <Box sx={{
      flexGrow: 1,
    }}>
      {showModeAddDialog && <ModeAddDialog close={() => setShowModeAddDialog(false)} />}
      <Toolbar variant="dense" sx={{
        borderBottom: '1px solid var(--vscode-foreground)',
      }}>
        <Grid container justifyContent="space-between" alignItems="center">
          <Grid item>
            <Button
              variant="contained"
              size="small"
              color="primary"
              onClick={() => setShowModeAddDialog(true)}
            >
              Add new mode
            </Button>
          </Grid>
          <Grid item>
            <ModeMorePop />
          </Grid>
        </Grid>
      </Toolbar>
    </Box>
  )
}

export default ModeConfigToolbar
