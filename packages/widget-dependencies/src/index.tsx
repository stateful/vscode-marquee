import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faShareNodes } from '@fortawesome/free-solid-svg-icons/faShareNodes'

import DependenciesWidget from './Widget'

export default {
  name: 'dependencies',
  icon: <FontAwesomeIcon icon={faShareNodes} />,
  label: 'Dependencies',
  tags: ['workspace', 'projects', 'productivity'],
  description: 'Dependencies for your current project.',
  component: DependenciesWidget
}
