import React from 'react'
import { IconButton } from '@mui/material'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faExpand } from '@fortawesome/free-solid-svg-icons/faExpand'
import { faClose } from '@fortawesome/free-solid-svg-icons'

interface ToggleFullScreenProps {
  widgetName: string
  isFullScreenMode: boolean
  toggleFullScreen: React.Dispatch<React.SetStateAction<boolean>>
}
export const ToggleFullScreen = ({ widgetName, isFullScreenMode, toggleFullScreen }: ToggleFullScreenProps) => {
  return (
    <IconButton
      aria-label={`Toggle ${widgetName} widget to fullscreen`}
      focusRipple={false}
      onClick={() => toggleFullScreen(!isFullScreenMode)}
    >
      {!isFullScreenMode && <FontAwesomeIcon icon={faExpand} fontSize='small' />}
      {isFullScreenMode && <FontAwesomeIcon icon={faClose} fontSize='small' />}
    </IconButton>
  )
}
