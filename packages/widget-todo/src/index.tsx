import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTasks } from '@fortawesome/free-solid-svg-icons/faTasks'

import Todo from './Widget'

export default {
  name: 'todo',
  icon: <FontAwesomeIcon icon={faTasks} />,
  tags: ['todo', 'organization', 'productivity'],
  label: 'Todo',
  description: 'The Todo widget for simplifying priorities.',
  component: Todo,
}
export { Todo }
