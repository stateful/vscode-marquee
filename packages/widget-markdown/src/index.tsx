import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMarkdown } from '@fortawesome/free-brands-svg-icons/faMarkdown'

import Markdown from './Widget'

export default {
  name: 'markdown',
  icon: <FontAwesomeIcon icon={faMarkdown} />,
  tags: ['productivity'],
  label: 'Markdown',
  description: 'Renders markdown files',
  component: Markdown,
}
export { Markdown }
