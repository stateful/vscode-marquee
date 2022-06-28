import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCode } from '@fortawesome/free-solid-svg-icons/faCode'

import Snippets from './Widget'

export default {
  name: 'snippets',
  icon: <FontAwesomeIcon icon={faCode} />,
  tags: ['productivity', 'workflow', 'search', 'organize'],
  label: 'Clipboard',
  description:
    'Create or extract clipboard items then edit, organize and insert them directly into code.',
  component: Snippets,
}
export { Snippets }
