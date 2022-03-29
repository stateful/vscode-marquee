import React, { MouseEventHandler } from 'react'

import MuiDialogTitle from '@mui/material/DialogTitle'
import CloseIcon from '@mui/icons-material/Close'
import { Theme } from '@mui/material/styles'

import { Styles, ClassNameMap } from '@mui/styles'
import withStyles from '@mui/styles/withStyles'

import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'

import { theme } from '@vscode-marquee/utils'

const styles = (theme: Theme): Styles<Theme, {}> => ({
  root: {
    margin: 0,
    padding: theme.spacing(2),
  },
  closeButton: {
    position: 'absolute',
    right: theme.spacing(1),
    top: theme.spacing(1),
    color: theme.palette.grey[500],
  },
})

interface Props extends React.PropsWithChildren<{ classes: ClassNameMap<string> }> {
  onClose?: MouseEventHandler<HTMLButtonElement>
}

const DialogTitle = withStyles(styles(theme))((props: Props) => {
  const { children, classes, onClose, ...other } = props
  return (
    <MuiDialogTitle className={classes.root} {...other}>
      <Typography variant="h6" component="span">{children}</Typography>
      {onClose ? (
        <IconButton
          aria-label="close"
          className={classes.closeButton}
          onClick={onClose}
          size="large">
          <CloseIcon />
        </IconButton>
      ) : null}
    </MuiDialogTitle>
  )
})

export default DialogTitle
