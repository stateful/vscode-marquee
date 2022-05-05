import React, { useContext, useState, useCallback } from 'react'

import ClearIcon from '@mui/icons-material/Clear'
import SearchIcon from '@mui/icons-material/Search'
import Popover from '@mui/material/Popover'
import { IconButton, Grid, TextField, Badge } from '@mui/material'
import { DebounceInput } from 'react-debounce-input'

import WorkspaceContext from '../Context'

let ProjectsFilterBox = () => {
  const { setWorkspaceFilter, workspaceFilter } = useContext(WorkspaceContext)
  let filterInput: HTMLInputElement | null = null

  return (
    <DebounceInput
      autoFocus
      inputProps={{ ref: (input: HTMLInputElement) => (filterInput = input) }}
      element={TextField}
      minLength={2}
      debounceTimeout={500}
      InputLabelProps={{
        shrink: true,
      }}
      label={'Filter'}
      variant="filled"
      placeholder="Type here..."
      onChange={(e) => {
        setWorkspaceFilter(e.target.value)
      }}
      // margin="none"
      size="small"
      name="github-filter"
      value={workspaceFilter}
      InputProps={{
        endAdornment: (
          <ClearIcon
            fontSize="small"
            style={{ cursor: 'pointer' }}
            onClick={() => {
              setWorkspaceFilter('')
              filterInput!.focus()
            }}
          />
        ),
      }}
    />
  )
}

let ProjectsFilter = () => {
  const [anchorEl, setAnchorEl] = useState(null)
  const { workspaceFilter } = useContext(WorkspaceContext)

  const handleClick = useCallback((event) => {
    setAnchorEl(event.currentTarget)
  }, [])

  const handleClose = useCallback(() => {
    setAnchorEl(null)
  }, [])

  const open = Boolean(anchorEl)
  const id = open ? 'project-filter-popover' : undefined

  return (
    <div>
      <IconButton aria-label="Open Filter Search" size="small" onClick={handleClick}>
        <Badge
          color="secondary"
          variant="dot"
          overlap="circular"
          badgeContent={Boolean(workspaceFilter?.length)}
        >
          <SearchIcon fontSize="small" />
        </Badge>
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
        <Grid container>
          <Grid item>
            <ProjectsFilterBox />
          </Grid>
        </Grid>
      </Popover>
    </div>
  )
}

export default React.memo(ProjectsFilter)
