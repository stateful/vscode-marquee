import React, { useState, useContext, useCallback } from 'react'
import Popover from '@mui/material/Popover'
import { IconButton, Grid, Divider, Typography, Checkbox } from '@mui/material'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import Tooltip from '@mui/material/Tooltip'
import { HideWidgetContent } from '@vscode-marquee/widget'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import SortByAlphaIcon from '@mui/icons-material/SortByAlpha'
import SortIcon from '@mui/icons-material/Sort'
import TourIcon from '@mui/icons-material/Tour'

import WorkspaceContext from '../Context'
import type { WorkspaceSortOrder } from '../types'

const OpenInNewWindowBox = React.memo(() => {
  const { openProjectInNewWindow, setOpenProjectInNewWindow } = useContext(WorkspaceContext)

  return (
    <Grid
      container
      direction="row"
      spacing={2}
      justifyContent="space-between"
      alignItems="center"
    >
      <Grid item>Open Project in New Window</Grid>
      <Grid item>
        <Checkbox
          color="primary"
          checked={openProjectInNewWindow}
          value={openProjectInNewWindow}
          name="openInNewWindow"
          onChange={(e) => {
            setOpenProjectInNewWindow(Boolean(e.target.checked))
          }}
        />
      </Grid>
    </Grid>
  )
})

const SortOrder = React.memo(() => {
  const { setWorkspaceSortOrder, workspaceSortOrder } = useContext(
    WorkspaceContext
  )

  const handleChange = (event: any, newAlignment: WorkspaceSortOrder | null) => {
    if (newAlignment !== null) {
      setWorkspaceSortOrder(newAlignment)
    }
  }

  return (
    <Grid
      container
      direction="row"
      spacing={2}
      justifyContent="space-between"
      alignItems="center"
    >
      <Grid item>
        <Typography>Sort order</Typography>
      </Grid>
      <Grid item>
        <Grid container item justifyContent="center" alignItems="center">
          <ToggleButtonGroup
            size="small"
            value={workspaceSortOrder}
            exclusive
            onChange={handleChange}
          >
            <ToggleButton value="alphabetical">
              <Tooltip title="Sort alphabetically" placement="top" arrow>
                <SortByAlphaIcon fontSize="small" />
              </Tooltip>
            </ToggleButton>

            <ToggleButton value="usage">
              <Tooltip
                title="Sort by todos, notes and other artifacts"
                placement="top"
                arrow
              >
                <SortIcon fontSize="small" />
              </Tooltip>
            </ToggleButton>

            <ToggleButton value="visits">
              <Tooltip
                title="Sort by amount of visits to that workspace"
                placement="top"
                arrow
              >
                <TourIcon fontSize="small" />
              </Tooltip>
            </ToggleButton>
          </ToggleButtonGroup>
        </Grid>
      </Grid>
    </Grid>
  )
})

const FilterByBox = React.memo(() => {
  return (
    <Grid container direction="column" spacing={1}>
      <Grid item>
        <OpenInNewWindowBox />
      </Grid>
      <Grid item>
        <SortOrder />
      </Grid>
    </Grid>
  )
})

let ProjectPop = () => {
  const [anchorEl, setAnchorEl] = useState<Element | null>(null)

  const handleClick = useCallback((event: React.MouseEvent) => {
    setAnchorEl(event.currentTarget)
  }, [])

  const handleClose = useCallback(() => {
    setAnchorEl(null)
  }, [])

  const open = Boolean(anchorEl)
  const id = open ? 'project-popover' : undefined

  return (
    <div>
      <IconButton aria-label="widget-settings" size="small" onClick={handleClick}>
        <MoreVertIcon fontSize="small" />
      </IconButton>

      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
      >
        <Grid container style={{ padding: '16px' }} direction="column">
          <Grid item>
            <FilterByBox />
          </Grid>

          <Grid item>&nbsp;</Grid>
          <Grid item>
            <Divider />
          </Grid>
          <Grid item>&nbsp;</Grid>
          <Grid item>
            <HideWidgetContent name="projects" />
          </Grid>
        </Grid>
      </Popover>
    </div>
  )
}

export default React.memo(ProjectPop)
