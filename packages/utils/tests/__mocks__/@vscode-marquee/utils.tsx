import React from 'react'
import { createTheme } from '@mui/material/styles'
import { EventEmitter } from 'events'

import GlobalContextImport from '../../../src/contexts/Global'
import NetworkErrorImport from '../../../src/components/NetworkError'
import BetterCompleteImport from '../../../src/components/BetterComplete'
import DoubleClickHelperImport from '../../../src/components/DoubleClickHelper'

export const theme = createTheme({
  palette: {
    primary: {
      main: '#000'
    },
  },
})

const eventListener = new EventEmitter()
// @ts-expect-error mock tangle
eventListener.listen = jest.fn((event, cb) => {
  if (event === 'todos') {
    // @ts-expect-error
    cb(window.marqueeStateConfiguration['@vscode-marquee/todo-widget'].state.todos)
  }
  if (event === 'snippets') {
    // @ts-expect-error
    cb(window.marqueeStateConfiguration['@vscode-marquee/snippets-widget'].state.snippets)
  }
  if (event === 'notes') {
    // @ts-expect-error
    cb(window.marqueeStateConfiguration['@vscode-marquee/notes-widget'].state.notes)
  }

  return { unsubscribe: jest.fn() }
})
// @ts-expect-error
eventListener.broadcast = jest.fn()
export const defaultName = 'name here...'
export const getEventListener = () => eventListener

export const providerValues = {
  // @ts-expect-error
  ...Object.values(window.marqueeStateConfiguration).reduce((prev: object, curr: any) => ({
    ...prev,
    ...curr.state,
    ...Object.keys(curr.state).reduce((prev, curr: string) => ({
      ...prev,
      [`set${curr.slice(0, 1).toUpperCase()}${curr.slice(1)}`]: jest.fn()
    }), {}),
    ...curr.configuration,
    ...Object.keys(curr.configuration).reduce((prev, curr: string) => ({
      ...prev,
      [`set${curr.slice(0, 1).toUpperCase()}${curr.slice(1)}`]: jest.fn()
    }), {}),
  }), {})
}
export const connect = jest.fn().mockReturnValue(providerValues)

export const GlobalContext = GlobalContextImport

export const setResetApp = jest.fn()
export const setBackground = jest.fn()
export const setName = jest.fn()
export const setGlobalScope = jest.fn()
export const setThemeColor = jest.fn()

export const GlobalProvider = ({ children }: any) => (
  <GlobalContext.Provider value={{
    background: '4',
    name: 'some name',
    globalScope: false,
    themeColor: { r: 1, g: 2, b: 3, a: 4 },
    resetApp: false,
    setResetApp,
    setBackground,
    setName,
    setGlobalScope,
    setThemeColor
  } as any}>
    {children}
  </GlobalContext.Provider>
)

export const NetworkError = NetworkErrorImport
export const BetterComplete = BetterCompleteImport
export const DoubleClickHelper = DoubleClickHelperImport
