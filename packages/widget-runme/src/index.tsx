import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlay } from '@fortawesome/free-solid-svg-icons/faPlay'

import RunmeWidget from './Widget'

export default {
  name: 'runme',
  icon: <FontAwesomeIcon icon={faPlay} />,
  label: 'Runme',
  tags: ['workspace', 'projects', 'productivity'],
  description: 'Use dev-native markdown to craft interactive runbooks for VS Code.',
  component: RunmeWidget
}
