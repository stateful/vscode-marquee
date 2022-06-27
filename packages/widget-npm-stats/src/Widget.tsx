import React, { useContext, useRef, useState } from 'react'
import { Grid, Typography } from '@mui/material'
import {
  XYPlot,
  XAxis,
  YAxis,
  Hint,
  DiscreteColorLegend,
  LineSeries,
  makeWidthFlexible
} from 'react-vis'
import styled from '@emotion/styled'
// @ts-expect-error
import { toHumanString } from 'human-readable-numbers'
import 'react-vis/dist/style.css'

import wrapper, { Dragger, HeaderWrapper } from '@vscode-marquee/widget'
import { NetworkError } from '@vscode-marquee/utils'
import type { MarqueeWidgetProps } from '@vscode-marquee/widget'

import NPMStatsContext, { NPMStatsProvider } from './Context'

interface HoveredCell {
  x: number
  y: number
  index: number
}

const LEGEND_HEIGHT = 80
const MIN_HEIGHT = 300
const TEXT_COLOR = 'var(--vscode-editor-foreground)'
const CENTER_STYLES = {
  overflow: 'auto',
  height: '100%',
  width: '100%',
  padding: '24px',
}
const AXIS_STYLE = {
  line: { stroke: TEXT_COLOR },
  ticks: { stroke: TEXT_COLOR },
  text: {
    stroke: 'none',
    fill: TEXT_COLOR,
    fontWeight: 600
  }
}
const X_TICK_FORMAT = (v: number) => {
  const [date] = (new Date(v)).toISOString().split('T')
  const [y, m] = date.split('-')
  return `${m}/${y}`
}
const Y_TICK_FORMAT = (v: number) => {
  return toHumanString(v)
}

const Root = styled(Grid)(() => ({
  ['.rv-discrete-color-legend-item__title']: {
    color: TEXT_COLOR
  },
  ['.rv-discrete-color-legend.horizontal']: {
    textAlign: 'center'
  },
  b: {
    fontWeight: 'bold'
  }
}))
const tipStyle = {
  color: TEXT_COLOR,
  background: '#000',
  padding: '5px'
}

const FlexibleXYPlot = makeWidthFlexible(XYPlot)

const WidgetBody = () => {
  const ref = useRef<HTMLDivElement>(null)
  const { error, isLoading, stats } = useContext(NPMStatsContext)
  const [ hoveredCell, setHoveredCell ] = useState<HoveredCell | null>(null)
  const hasStats = Object.keys(stats).length !== 0
  const graphHeight = ref.current
    ? ref.current.clientHeight - LEGEND_HEIGHT
    : MIN_HEIGHT

  return (
    <Grid item xs ref={ref}>
      <Grid
        container
        wrap="nowrap"
        direction="column"
        style={{ height: '100%' }}
      >
        {isLoading && (
          <Grid item xs style={CENTER_STYLES}>
            Loading
          </Grid>
        )}
        {error && !isLoading && (
          <Grid item xs style={CENTER_STYLES}>
            <NetworkError message={error.message} />
          </Grid>
        )}
        {!error && !isLoading && !hasStats && (
          <Grid item xs style={{ ...CENTER_STYLES, textAlign: 'center' }}>
            No package defined in Marquee configuration!<br />
            Please check the
            {' '}<pre style={{ display: 'inline-block' }}>marquee.widgets.npm-stats.packageNames</pre>
            {' '}VSCode configuration.
          </Grid>
        )}
        {!error && !isLoading && hasStats && (
          <Grid
            item
            xs
            style={{
              overflow: 'auto',
              paddingTop: '16px',
              paddingRight: '16px',
              paddingLeft: '16px',
              paddingBottom: '8px',
            }}
          >
            <Grid
              container
              style={{
                height: '100%',
                width: '100%',
              }}
              direction="column"
              wrap="nowrap"
            >
              <Root item xs={1} style={{ maxWidth: '100%' }}>
                <FlexibleXYPlot
                  margin={{left: 50}}
                  height={graphHeight}
                  yType={'linear'}
                  onNearestX
                >
                  <XAxis tickTotal={8} tickFormat={X_TICK_FORMAT} style={AXIS_STYLE} />
                  <YAxis tickFormat={Y_TICK_FORMAT} style={AXIS_STYLE} title="Downloads" />
                  <DiscreteColorLegend
                    orientation="horizontal"
                    items={Object.keys(stats)}
                  />
                  {hoveredCell ? (
                    <Hint value={hoveredCell}>
                      <div style={tipStyle}>
                        {(new Date(hoveredCell.x)).toUTCString().split(' ').slice(0, 4).join(' ')}
                        <hr style={{ borderBottom: 0 }} />
                        {Object.entries(stats).map(([packageName, stat], i) => (
                          <div key={i}>
                            <b>{packageName}:</b> {toHumanString(Object.values(stat)[hoveredCell.index])}<br />
                          </div>
                        ))}
                      </div>
                    </Hint>
                  ) : null}
                  {Object.entries(stats).map(([packageName, stat]) => (
                    <LineSeries
                      key={packageName}
                      className="first-series"
                      xType="time"
                      data={Object.entries(stat).map(([date, count]) => (
                        { x: (new Date(date)).getTime(), y: count }
                      ))}
                      onNearestXY={
                        (value, { event, index }) => {
                          console.log('SET IT', event)
                          setHoveredCell({ ...value, index })
                        }
                      }
                    />
                  ))}
                </FlexibleXYPlot>
              </Root>
            </Grid>
          </Grid>
        )}
      </Grid>
    </Grid>
  )
}

let Welcome = ({ ToggleFullScreen }: MarqueeWidgetProps) => {
  return (
    <>
      <HeaderWrapper>
        <Grid item>
          <Typography variant="subtitle1">NPM Statistics</Typography>
        </Grid>
        <Grid item>
          <Grid container direction="row" spacing={1}>
            <Grid item>
              <ToggleFullScreen />
            </Grid>
            <Grid item>
              <Dragger />
            </Grid>
          </Grid>
        </Grid>
      </HeaderWrapper>
      <WidgetBody />
    </>
  )
}

const Widget = (props: any) => (
  <NPMStatsProvider>
    <Welcome {...props} />
  </NPMStatsProvider>
)
export default wrapper(Widget, 'welcome')
