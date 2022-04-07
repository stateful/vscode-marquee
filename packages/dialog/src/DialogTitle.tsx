import React, { MouseEventHandler, ReactNode } from 'react'

import MuiDialogTitle from '@mui/material/DialogTitle'
import CloseIcon from '@mui/icons-material/Close'

import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'

import { theme } from '@vscode-marquee/utils'

interface Props {
  children: ReactNode,
  onClose?: MouseEventHandler<HTMLButtonElement>
}

const DialogTitle = ((props: Props) => {
  const { children, onClose, ...other } = props
  return (
    <MuiDialogTitle sx={{
      margin: 0,
      padding: theme.spacing(2),
    }} {...other}>
      <Typography variant="h6" component="span">{children}</Typography>
      {onClose ? (
        <IconButton
          aria-label="close"
          sx={{
            position: 'absolute',
            right: theme.spacing(1),
            top: theme.spacing(1),
            color: theme.palette.grey[500],
          }}
          onClick={onClose}
          size="large">
          <CloseIcon />
        </IconButton>
      ) : null}
    </MuiDialogTitle>
  )
})

export default DialogTitle
