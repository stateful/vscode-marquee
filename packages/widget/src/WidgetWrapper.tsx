import React, { useContext, useState } from 'react'
import { Box, Grid, Dialog } from '@mui/material'
import { getEventListener, MarqueeEvents } from '@vscode-marquee/utils'

import { GlobalContext } from '@vscode-marquee/utils'

import { ErrorBoundary } from './ErrorBoundary'
import { ToggleFullScreen } from './ToggleFullScreen'

interface WidgetWrapper {
  dragHandle: React.ReactNode
  name: string
  innerref: React.Ref<any>
  children: React.ReactElement
}

const WidgetWrapper = ({ dragHandle, ...props }: WidgetWrapper) => {
  const { themeColor } = useContext(GlobalContext)
  const [shouldBeDisplayed, setShouldBeDisplayed] = useState(true)

  const eventListener = getEventListener<MarqueeEvents>()
  eventListener.on('updateWidgetDisplay', (widgets) => {
    setShouldBeDisplayed(widgets[props.name])
  })

  if (!shouldBeDisplayed) {
    return <></>
  }

  return (
    <Box {...props} ref={props.innerref}>
      <Grid
        aria-label={`${props.name}-widget`}
        container
        direction="column"
        style={{
          height: '100%',
          background: `rgba(${themeColor.r}, ${themeColor.g}, ${themeColor.b}, ${themeColor.a || 1})`,
        }}
        wrap="nowrap"
      >
        {props.children}
      </Grid>
      {dragHandle}
    </Box>
  )
}

export default (Widget: any, name?: string) => React.memo(React.forwardRef((props: any, ref) => {
  const [fullscreenMode, setFullscreenMode] = useState(false)
  const widgetProps = {
    ...props,
    ToggleFullScreen: () => (
      <ToggleFullScreen
        widgetName={props.name}
        toggleFullScreen={setFullscreenMode}
        isFullScreenMode={fullscreenMode} />
    ),
    fullscreenMode
  }

  return (
    <ErrorBoundary>
      <WidgetWrapper innerref={ref} name={name!} dragHandle={props.children} {...props}>
        {fullscreenMode
          ? (
            <Dialog
              fullScreen
              open={fullscreenMode}
              onClose={() => setFullscreenMode(false)}
              // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
              aria-labelledby={`${props.name}Fullscreen`}
            >
              <Widget {...widgetProps} />
            </Dialog>
          )
          : <Widget {...widgetProps} />
        }

      </WidgetWrapper>
    </ErrorBoundary>
  )
}))
