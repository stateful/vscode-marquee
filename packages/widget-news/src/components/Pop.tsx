import React, { useState, useCallback, useContext } from 'react'
import Popover from '@mui/material/Popover'
import { IconButton, Grid, FormControl, InputLabel, Select, MenuItem } from '@mui/material'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import { HideWidgetContent } from '@vscode-marquee/widget'

import NewsContext from '../Context'

const PopMenu = () => {
  const { feeds, channel, setChannel, setIsFetching } = useContext(NewsContext)
  const [anchorEl, setAnchorEl] = useState<Element | null>(null)

  const handleClick = useCallback((event: React.MouseEvent) => {
    setAnchorEl(event.currentTarget)
  }, [])

  const handleClose = useCallback(() => {
    setAnchorEl(null)
  }, [])

  const open = Boolean(anchorEl)
  const id = open ? 'hide-popover' : undefined

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
        <Grid container direction="column" style={{ minHeight: '80px', padding: '16px' }}>
          <Grid item>
            <FormControl fullWidth>
              <InputLabel id="marquee-news-channel">Channel</InputLabel>
              <Select
                labelId="marquee-news-channel"
                value={channel}
                label="Age"
                onChange={(e) => {
                  setIsFetching(true)
                  setChannel(e.target.value)
                  handleClose()
                }}
              >
                {Object.keys(feeds).map(([first, ...rest], i) => (
                  <MenuItem
                    key={i}
                    value={[first, ...rest].join('')}
                  >
                    {`${first.toLocaleUpperCase()}${rest.join('')}`}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item>&nbsp;</Grid>
          <Grid item>
            <HideWidgetContent name="news" />
          </Grid>
        </Grid>
      </Popover>
    </div>
  )
}

export default React.memo(PopMenu)
