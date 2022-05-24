import React from 'react'

const originalModule = jest.requireActual('react-virtualized')

export const List = originalModule.List
export const AutoSizer = ({
  children,
}: {
  children: (size: { height: number; width: number }) => React.ReactNode;
}) => children({ height: 100, width: 100 })
