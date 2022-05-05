import React from 'react'
import { IconButton, Tooltip } from '@mui/material'

import HelpIcon from '@mui/icons-material/Help'

export interface DoubleClickHelperParams {
  content?: string
}

let DoubleClickHelper = (props: DoubleClickHelperParams) => {
  const content = props.content || 'Double-click item titles to edit'
  return (
    <Tooltip title={content}>
      <IconButton size="small">
        <HelpIcon fontSize="small" />
      </IconButton>
    </Tooltip>
  )
}

export default React.memo(DoubleClickHelper)
