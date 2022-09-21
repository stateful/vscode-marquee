import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faClock } from '@fortawesome/free-solid-svg-icons/faClock'

import StatefulWidget from './Widget'

export default {
  name: 'stateful',
  icon: <FontAwesomeIcon icon={faClock} />,
  label: 'Stateful Widget',
  tags: [],
  description: '...',
  component: StatefulWidget,
}

