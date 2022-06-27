import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBarChart } from '@fortawesome/free-solid-svg-icons/faBarChart'

import Widget from './Widget'
import { NPMStatsProvider } from './Context'

export default {
  name: 'npm-stats',
  icon: <FontAwesomeIcon icon={faBarChart} />,
  label: 'NPM Statistics',
  tags: ['package', 'npm', 'stats', 'download', 'statistics'],
  description: 'Widget to show download statistics for NPM package',
  component: Widget,
}
export { Widget, NPMStatsProvider }
