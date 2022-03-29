import React from 'react'
import { render, screen } from '@testing-library/react'

import { Providers, App } from '../src'

declare const window: {
  vscode: any
}

const MockProvider = ({ children, name }: { children: any, name: string }) => {
  return (<div role={name}>{children}</div>)
}

jest.mock('../src/contexts/ModeContext', () => ({
  ModeProvider: ({ children }: any) => (
    <MockProvider name="ModeProvider">{children}</MockProvider>
  )
}))

jest.mock('../src/Container', () => () => (<div>Container</div>))

test('Providers', () => {
  render(<Providers>Foobar</Providers>)
  expect(screen.getByText('Foobar')).toBeInTheDocument()
})

test('App', () => {
  window.vscode = { postMessage: jest.fn() }

  render(<App />)
  expect(screen.getByText('Container')).toBeInTheDocument()
  expect(window.vscode.postMessage).toBeCalledWith({ ready: true })
})
