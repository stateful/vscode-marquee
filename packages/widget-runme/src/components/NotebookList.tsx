import React, { useContext } from 'react'
import { Grid, Link, List, ListItem, ListItemText, Typography, CircularProgress } from '@mui/material'
import type { MarqueeWindow } from '@vscode-marquee/utils'

import RunmeContext from '../Context'

declare const window: MarqueeWindow

export default function NotebookList () {
  const { notebooks } = useContext(RunmeContext)
  console.log('notebooks', notebooks)

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
      <List dense={true} style={{ width: '100%' }}>
        {notebooks?.map((notebook, key) => (
          <ListItem
            dense
            button
            disableRipple
            disableTouchRipple
            key={key}
            style={{ width: '100%' }}
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
              width={40}
              style={{marginRight: 15}}
            />
            <ListItemText
              primary={
                <Typography variant="caption" style={{ fontWeight: 'bold' }}>
                  {notebook.split('/').pop()}
                </Typography>
              }
              secondary={
                <Typography variant="subtitle2" noWrap style={{ display: 'block', opacity: '.7', fontSize: '.8em' }}>
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
