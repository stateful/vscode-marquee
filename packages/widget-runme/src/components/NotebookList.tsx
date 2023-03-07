import React, { useContext } from 'react'
import { Grid, Link, List, ListItem, ListItemText, Typography, CircularProgress } from '@mui/material'
import { styled } from '@mui/material/styles'
import type { MarqueeWindow } from '@vscode-marquee/utils'

import RunmeContext from '../Context'

declare const window: MarqueeWindow

const PREFIX = 'RunmeListItem'
const classes = {
  primary: `${PREFIX}-primary`,
  secondary: `${PREFIX}-secondary`
}

const RunmeItem = styled(ListItemText)(() => ({
  [`.${classes.primary}`]: {
    fontWeight: 'bold',
    fontSize: '0.8em !important',
    lineHeight: 0
  },

  [`.${classes.secondary}`]: {
    display: 'block',
    opacity: '.7',
    fontSize: '.7em !important',
    lineHeight: '1.5em'
  }
}))

export default function NotebookList () {
  const { notebooks } = useContext(RunmeContext)

  if (!notebooks) {
    return (
      <Grid
        container
        style={{ height: '100%' }}
        alignItems="center"
        justifyContent="center"
        direction="column"
      >
        <Grid item>
          <CircularProgress color="secondary" />
        </Grid>
      </Grid>
    )
  }

  if (notebooks?.length === 0) {
    return (
      <Grid
        container
        style={{ height: '100%' }}
        alignItems="center"
        justifyContent="center"
        direction="column"
      >
        <Grid item>
          No notebooks found, you can&nbsp;
          <Link
            style={{ cursor: 'pointer' }}
            onClick={() => window.vscode.postMessage({
              west: { execCommands: [{ command: 'runme.new' }] }
            })}
          >
            create one
          </Link>!
        </Grid>
      </Grid>
    )
  }

  return (
    <Grid
      aria-label="notebook-list"
      container
      alignItems="center"
    >
      <List dense={true} style={{ width: '100%', paddingTop: 0, paddingBottom: 0, lineHeight: '0.9em' }}>
        {notebooks?.map((notebook, key) => (
          <ListItem
            dense
            button
            disableRipple
            disableTouchRipple
            key={key}
            style={{ width: '100%', paddingTop: 0, paddingBottom: 0 }}
            onClick={() => window.vscode.postMessage({
              west: {
                execCommands: [
                  {
                    command: 'runme.openAsRunmeNotebook',
                    args: [notebook]
                  },
                ],
              },
            })}
          >
            <img
              src={'../packages/widget-runme/src/img/runme.png'}
              alt="Runme"
              width={25}
              style={{marginRight: 15}}
            />
            <RunmeItem
              primary={
                <Typography variant="caption" className={classes.primary}>
                  {notebook.split('/').pop()}
                </Typography>
              }
              secondary={
                <Typography noWrap className={classes.secondary}>
                  {notebook.split('/')
                    .slice(2, notebook.split('/').length - 1).join('/')
                    .replace(window.activeWorkspace?.path || '', '') || '/'
                  }
                </Typography>
              }
            />
          </ListItem>
        ))}
      </List>
    </Grid>
  )
}
