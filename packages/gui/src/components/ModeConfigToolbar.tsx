import React, { useState } from 'react'
import Toolbar from '@mui/material/Toolbar'
import { Grid, Button } from '@mui/material'
import makeStyles from '@mui/styles/makeStyles'

import ModeMorePop from './ModeMorePop'
import ModeAddDialog from '../dialogs/ModeAddDialog'

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  toolbar: {
    borderBottom: '1px solid var(--vscode-foreground)',
  },
  vert: {
    position: 'relative',
    marginLeft: 0,
    width: '100%',
    [theme.breakpoints.up('sm')]: {
      marginLeft: theme.spacing(1),
      width: 'auto',
    },
  },
}))

const ModeConfigToolbar = () => {
  const classes = useStyles()
  const [showModeAddDialog, setShowModeAddDialog] = useState(false)

  return (
    <div className={classes.root}>
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
    </div>
  )
}

export default ModeConfigToolbar
