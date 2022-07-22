import React from 'react'

const MockProvider = ({ children, name }: { children: any, name: string }) => {
  return (<div role={name}>{children}</div>)
}

export const NPMStatsProvider = ({ children }: any) => (
  <MockProvider name="NPMStatsProvider">{children}</MockProvider>
)
export default {
  name: 'npm-stats',
  icon: <div>NPMStatsIcon</div>,
  label: 'NPM Statistics',
  tags: ['package', 'npm', 'stats', 'download', 'statistics'],
  description: 'Widget to show download statistics for NPM package',
  component: () => <div>NPM Stats Widget</div>
}
