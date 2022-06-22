import { MouseEvent } from 'react'

export interface MarqueeWidgetProps {
  fullscreenMode: boolean
  ToggleFullScreen: () => JSX.Element
  minimizeNavIcon?: boolean,
  open?: boolean,
  id?: 'todo-nav-popover' | undefined,
  anchorEl?: HTMLButtonElement | null,
  handleClose?: () => void,
  handleClick?: (event: MouseEvent<HTMLButtonElement>) => void
}
