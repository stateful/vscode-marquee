import React, { useContext, useEffect, useMemo, useState } from 'react'

import { Grid, CircularProgress } from '@mui/material'
import { WidthProvider, Responsive } from 'react-grid-layout'
import './css/react-grid-layout.css'
import 'react-resizable/css/styles.css'

import { getEventListener, MarqueeEvents, GlobalContext, MarqueeWindow } from '@vscode-marquee/utils'

import ModeContext from './contexts/ModeContext'
import Navigation from './components/Navigation'
import SettingsDialog from './dialogs/SettingsDialog'
import backgrounds from './utils/backgrounds'
import { themes, widgetConfig, NO_BACKGROUND_STYLE, BACKGROUND_STYLE } from './constants'
import type { WidgetMap, WidgetConfig } from './types'

declare const window: MarqueeWindow
const ResponsiveReactGridLayout = WidthProvider(Responsive)
const sizes = ['lg', 'md', 'sm', 'xs', 'xxs'] as const

/**
 * the `onLayoutChange` handler is triggered more often than desired
 * which can cause side effects as we have to update the modes
 * configuration
 */
let allowedToChange = true

export const WidgetLayout = React.memo(() => {
  const { resetApp } = useContext(GlobalContext)
  const { modeName, modes, _setCurrentModeLayout, thirdPartyWidgets } = useContext(ModeContext)

  const mode = modes[modeName]
  const widgets: Record<string, WidgetMap> = useMemo(() => {
    const newMap: Record<string, WidgetMap> = {};
    [...widgetConfig, ...thirdPartyWidgets].map((widgetObj: WidgetConfig) => {
      newMap[widgetObj.name] = {
        label: widgetObj.label || 'Unknown Widget',
        element: widgetObj.component
      }
    })
    return newMap
  }, [thirdPartyWidgets])

  //if a new widget is introduced that doesn't exist in their current
  //stored layout, we patch the layout so that it displays properly
  //to encourage them to integrate or hide it
  //this finds the missing entries and patches them
  const layoutConfig = useMemo(() => {
    if (!modeName || !modes[modeName]) {
      return null
    }

    if (
      Object.entries(mode).length !== 0 &&
      Object.entries(modes).length !== 0 &&
      Object.entries(mode.layouts).length !== 0
    ) {
      const newLayouts = mode.layouts
      let modified = false

      sizes.forEach((size) => {
        const sizeArr = newLayouts[size]
        Object.keys(widgets).forEach((widget) => {
          const found = sizeArr.findIndex((entry) => entry.i === widget)
          if (found === -1) {
            const widgetObject = {
              minW: 3,
              minH: 12,
              static: false,
              moved: false,
              x: 0,
              y: 0,
              h: 12,
              w: 4,
              i: widget,
            }

            newLayouts[size].push(widgetObject)
            modified = true
          }
        })
      })

      /**
       * in case a widget got removed and added back to the dashboard
       * the values for width and height are auto set to `1`. This little
       * logic ensures that we have a minimal width and height for widgets.
       */
      const layout = modified ? newLayouts : mode.layouts
      for (const [, l] of Object.entries(layout)) {
        for (const w of l) {
          if (w.w === 1 && w.h === 1) {
            w.w = 3
            w.h = 12
            w.minW = 3,
            w.minH = 12
          }
        }
      }
      return layout
    }
    return null
  }, [mode, modes, modeName])

  let generateWidgets = () => {
    return Object.keys(widgets)
      .filter((widget) => modes[modeName] && modes[modeName].widgets[widget])
      .map((widget) => {
        const Widget = widgets[widget].element
        return React.cloneElement(<Widget />, {
          name: widget,
          label: widgets[widget].label,
          key: widget
        })
      }
      )
  }

  if (!layoutConfig || resetApp || thirdPartyWidgets.length !== window.marqueeThirdPartyWidgets) {
    return (
      <Grid
        container
        style={{ height: '100%' }}
        alignItems="center"
        justifyContent="center"
        direction="column"
      >
        <Grid item>
          <CircularProgress color="secondary" />
        </Grid>
      </Grid>
    )
  }

  return (
    <ResponsiveReactGridLayout
      cols={{ lg: 12, md: 9, sm: 6, xs: 4, xxs: 3 }}
      rowHeight={20}
      onLayoutChange={(_, newLayouts) => {
        if (!allowedToChange) {
          return
        }
        allowedToChange = false
        _setCurrentModeLayout(newLayouts)
        setTimeout(() => (allowedToChange = true), 100)
      }}
      layouts={layoutConfig}
      draggableHandle=".drag-handle"
      draggableCancel=".draggableCancel"
      containerPadding={[10, 10]}
      margin={[10, 10]}
      // only when running unit tests
      measureBeforeMount={!Boolean(globalThis['process'])}
    >
      {generateWidgets()}
    </ResponsiveReactGridLayout>
  )
})

const Container = () => {
  const { background, themeColor } = useContext(GlobalContext)
  const { _removeModeWidget } = useContext(ModeContext)
  const [showSettings, setShowSettings] = useState(false)

  const backgroundStyle = useMemo(() => {
    /**
     * if `background` is not a number we can't fetch provided background
     * ToDo(Christian): implement importing Unsplash images
     */
    if (isNaN(+background)) {
      return NO_BACKGROUND_STYLE
    }

    const theme = themes.find((theme) => {
      return theme.id === parseInt(background, 10)
    })

    if (!theme || (!theme.background && !theme.backgroundColor)) {
      return NO_BACKGROUND_STYLE
    }

    return {
      ...BACKGROUND_STYLE,
      ...(theme.background
        ? { backgroundImage: `url(${backgrounds(theme.background)})` }
        : { backgroundColor: theme.backgroundColor })
    }
  }, [background])

  useEffect(() => {
    const eventListener = getEventListener<MarqueeEvents>()
    eventListener.on('openSettings', () => setShowSettings(true))
    eventListener.on('removeWidget', (name: string) => _removeModeWidget(name))
  }, [])

  return (
    <div className={'appContainer'} style={backgroundStyle}>
      {showSettings && <SettingsDialog close={() => setShowSettings(false)} />}
      <div
        className={'marqueeNavigation'}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100vw',
          zIndex: 1000,
        }}
      >
        <Navigation />
      </div>
      <Grid
        container
        style={{
          height: '100vh',
          width: '100vw',
          overflow: 'auto',
          background: `rgba(${themeColor.r}, ${themeColor.g}, ${themeColor.b}, ${themeColor.a || 1})`,
        }}
        direction="column"
        wrap="nowrap"
      >
        <Grid item style={{ maxWidth: '100%', width: '100%' }}>
          <div style={{ visibility: 'hidden' }}>
            <Navigation />
          </div>
        </Grid>

        <Grid item xs>
          <WidgetLayout />
        </Grid>
      </Grid>
    </div>
  )
}

export default React.memo(Container)
