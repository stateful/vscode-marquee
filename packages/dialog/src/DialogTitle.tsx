import React, { MouseEventHandler } from 'react'

import MuiDialogTitle from '@mui/material/DialogTitle'
import CloseIcon from '@mui/icons-material/Close'

import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'

interface Props {
  children: React.ReactNode,
  onClose?: MouseEventHandler<HTMLButtonElement>
}

const DialogTitle = (({ children, onClose, ...other }: Props) => {
  return (
    <MuiDialogTitle sx={{
      margin: 0,
      padding: theme => theme.spacing(2),
    }} {...other}>
      <Typography variant="h6" component="span">{children}</Typography>
      {onClose ? (
        <IconButton
          aria-label="close"
          sx={{
            position: 'absolute',
            right: theme => theme.spacing(1),
            top: theme => theme.spacing(1),
            color: theme => theme.palette.grey[500],
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
