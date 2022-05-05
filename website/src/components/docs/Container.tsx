import type { MDXRemoteSerializeResult } from 'next-mdx-remote'
import { MDXRemote } from 'next-mdx-remote'

import components from './components'

interface Props {
  source: MDXRemoteSerializeResult<Record<string, unknown>>
}

export const DocsContainer = ({ source }: Props) => {
  return (
    <MDXRemote components={components} {...source} />
  )
}
