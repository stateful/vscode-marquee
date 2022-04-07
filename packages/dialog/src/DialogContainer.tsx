import React, { ReactNode, MouseEventHandler } from 'react'
import { Dialog } from '@mui/material'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTheme } from '@mui/material/styles'

interface Props {
  children?: ReactNode | undefined,
  fullScreen?: boolean
  fullWidth?: boolean
  onClose?: MouseEventHandler<HTMLButtonElement>
}

const DialogContainer = ({ children, fullScreen, ...props }: Props) => {
  const materialTheme = useTheme()
  const isFullScreen = useMediaQuery(materialTheme.breakpoints.down('sm'))
  return (
    <Dialog
      open={true}
      fullScreen={fullScreen ? true : isFullScreen}
      {...props}
    >
      {children}
    </Dialog>
  )
}

export default React.memo(DialogContainer)
