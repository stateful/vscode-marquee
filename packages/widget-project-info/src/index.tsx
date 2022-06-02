import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleInfo } from '@fortawesome/free-solid-svg-icons/faCircleInfo'

import ProjectInfo from './Widget'

export default {
  name: 'project-info',
  icon: <FontAwesomeIcon icon={faCircleInfo} />,
  tags: ['github'],
  label: 'Project Info',
  description: 'Shows basic information about a project',
  component: ProjectInfo,
}
export { ProjectInfo }
