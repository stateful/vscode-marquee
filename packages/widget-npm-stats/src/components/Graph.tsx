import React, { useState } from 'react'
import {
  XYPlot,
  XAxis,
  YAxis,
  Hint,
  DiscreteColorLegend,
  LineSeries,
  makeWidthFlexible
} from 'react-vis'
// @ts-expect-error
import { toHumanString } from 'human-readable-numbers'

import { TEXT_COLOR } from '../constants'
import type { StatResponse } from '../types'

interface HoveredCell {
  x: number
  y: number
  index: number
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
const MARK_STYLE = {
  width: 5,
  height: 5,
  backgroundColor: 'white',
  borderRadius: 5,
  position: 'relative' as const,
  right: 2,
  top: 2
}
const TIP_STYLE = {
  color: TEXT_COLOR,
  background: '#000',
  padding: 5,
  margin: 10
}
const X_TICK_FORMAT = (v: number) => {
  const [date] = (new Date(v)).toISOString().split('T')
  const [y, m] = date.split('-')
  return `${m}/${y}`
}
const Y_TICK_FORMAT = (v: number) => {
  return toHumanString(v)
}
const FlexibleXYPlot = makeWidthFlexible(XYPlot)

interface NPMGraphProps {
  height: number
  stats: StatResponse
}

const NPMGraph = ({ height, stats }: NPMGraphProps) => {
  const [ hoveredCell, setHoveredCell ] = useState<HoveredCell | null>(null)
  const [ markSeriesData, setMarkSeriesData ] = useState<number | null>(null)

  return (
    <FlexibleXYPlot
      margin={{left: 50}}
      height={height}
      yType={'linear'}
      onMouseLeave={() => {
        setHoveredCell(null)
        setMarkSeriesData(null)
      }}
    >
      <XAxis tickTotal={8} tickFormat={X_TICK_FORMAT} style={AXIS_STYLE} />
      <YAxis tickFormat={Y_TICK_FORMAT} style={AXIS_STYLE} title="Downloads" />
      <DiscreteColorLegend
        orientation="horizontal"
        items={Object.keys(stats)}
      />
      {hoveredCell ? (
        <Hint value={{
          ...hoveredCell,
          y: Object.values(stats)
            .map((s) => Object.values(s)[hoveredCell.index])
            .reduce((a, b) => a + b, 0) / 2
        }}>
          <div style={TIP_STYLE}>
            {(new Date(hoveredCell.x)).toDateString()}
            <hr style={{ borderBottom: 0 }} />
            {Object.entries(stats).map(([packageName, stat], i) => (
              <div key={i}>
                <b>{packageName}:</b> {toHumanString(Object.values(stat)[hoveredCell.index])}<br />
              </div>
            ))}
          </div>
        </Hint>
      ) : null}
      {markSeriesData ? Object.values(stats).map((s, i) => {
        const [x, y] = Object.entries(s)[markSeriesData]
        return (
          <Hint
            key={i}
            value={{ x: (new Date(x)).getTime(), y }}
            align={{ horizontal: 'right', vertical: 'top' }}
          >
            <div style={MARK_STYLE}>&nbsp;</div>
          </Hint>
        )
      }) : null}
      {Object.entries(stats).map(([packageName, stat]) => (
        <LineSeries
          key={packageName}
          className="first-series"
          xType="time"
          data={Object.entries(stat).map(([date, count]) => (
            { x: (new Date(date)).getTime(), y: count }
          ))}
          onNearestXY={(value, { index }) => {
            setHoveredCell({ ...value, index })
            setMarkSeriesData(index)
          }}
        />
      ))}
    </FlexibleXYPlot>
  )
}

export default React.memo(NPMGraph)
