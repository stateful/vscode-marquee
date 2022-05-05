import React, { ReactNode } from 'react'

export const DialogContainer = ({ children }: { children: ReactNode }) => {
  return <div role="DialogContainer">{children}</div>
}
export const DialogTitle = ({ children }: { children: ReactNode }) => {
  return <div role="DialogTitle">{children}</div>
}
