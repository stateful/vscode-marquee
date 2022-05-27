import React, { useState } from 'react'
import { styled } from '@mui/material/styles'
import Toolbar from '@mui/material/Toolbar'
import { Grid, Button } from '@mui/material'

import ModeMorePop from './ModeMorePop'
import ModeAddDialog from '../dialogs/ModeAddDialog'

const PREFIX = 'ModeConfigToolbar'

const classes = {
  root: `${PREFIX}-root`,
  toolbar: `${PREFIX}-toolbar`,
  vert: `${PREFIX}-vert`
}

const Root = styled('div')((
  {
    theme
  }
) => ({
  [`&.${classes.root}`]: {
    flexGrow: 1,
  },

  [`& .${classes.toolbar}`]: {
    borderBottom: '1px solid var(--vscode-editorGroup-border)',
  },

  [`& .${classes.vert}`]: {
    position: 'relative',
    marginLeft: 0,
    width: '100%',
    [theme.breakpoints.up('sm')]: {
      marginLeft: theme.spacing(1),
      width: 'auto',
    },
  }
}))

const ModeConfigToolbar = () => {

  const [showModeAddDialog, setShowModeAddDialog] = useState(false)

  return (
    <Root className={classes.root}>
      {showModeAddDialog && <ModeAddDialog close={() => setShowModeAddDialog(false)} />}
      <Toolbar variant="dense" className={classes.toolbar}>
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
    </Root>
  )
}

export default ModeConfigToolbar
