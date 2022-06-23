import { MouseEvent } from 'react'

export interface MarqueeWidgetProps {
  fullscreenMode: boolean
  ToggleFullScreen: () => JSX.Element
  minimizeNavIcon?: boolean,
  open: boolean,
  anchorEl?: HTMLButtonElement | null,
  handleClose?: () => void,
  handleClick?: (event: MouseEvent<HTMLButtonElement>) => void
}
