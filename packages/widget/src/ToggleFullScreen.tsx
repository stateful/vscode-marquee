import React from 'react'
import { IconButton } from '@mui/material'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faExpand } from '@fortawesome/free-solid-svg-icons/faExpand'
import { faClose } from '@fortawesome/free-solid-svg-icons'

interface ToggleFSProps {
  isFullScreenMode: boolean, 
  toggleFullScreen: React.Dispatch<React.SetStateAction<boolean>>
}
let ToggleFullScreen = ({ isFullScreenMode, toggleFullScreen } : ToggleFSProps) => {
  return (
    <IconButton focusRipple={false} onClick={() => toggleFullScreen(!isFullScreenMode)}>
      {!isFullScreenMode && <FontAwesomeIcon icon={faExpand} fontSize='small' />}
      {isFullScreenMode && <FontAwesomeIcon icon={faClose} fontSize='small' />}
    </IconButton>
  )
}

export default ToggleFullScreen