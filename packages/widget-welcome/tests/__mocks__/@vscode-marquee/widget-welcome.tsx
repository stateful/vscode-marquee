import React from 'react'

const MockProvider = ({ children, name }: { children: any, name: string }) => {
  return (<div role={name}>{children}</div>)
}

export const TrickProvider = ({ children }: any) => (
  <MockProvider name="TrickProvider">{children}</MockProvider>
)
export default {
  name: 'welcome',
  icon: <div>WelcomeIcon</div>,
  label: 'Mailbox',
  tags: ['news', 'product', 'communication', 'tips', 'tricks'],
  description: 'Where to look for Marquee news, tips and tricks.',
  component: () => <div>Welcome Widget</div>
}
