import React, { useContext } from 'react'
import { act } from 'react-dom/test-utils'
import { render } from '@testing-library/react'
// @ts-expect-error
import { MarqueeWindow, getEventListener, providerValues } from '@vscode-marquee/utils'
import { faBrain } from '@fortawesome/free-solid-svg-icons/faBrain'

import ModeContext, { ModeProvider } from '../../src/contexts/ModeContext'

declare const window: MarqueeWindow

let _thirdPartyWidgets: any
let _modes: any
let __addMode: any
let __removeMode: any
let __resetModes: any
let __setModeName: any

test('WidgetLayout filters non display widgets', () => {
  expect(window.marqueeExtension).not.toBeTruthy()
  const TestComponent = () => {
    const { thirdPartyWidgets, modes, _resetModes, _removeMode, _addMode, _setModeName } = useContext(ModeContext)
    _thirdPartyWidgets = thirdPartyWidgets
    _modes = modes
    __addMode = _addMode
    __removeMode = _removeMode
    __resetModes = _resetModes
    __setModeName = _setModeName
    return (<div>Hello World</div>)
  }

  render(<ModeProvider><TestComponent /></ModeProvider>)
  expect(window.marqueeExtension).toBeTruthy()
  expect(typeof window.marqueeExtension.defineWidget).toBe('function')

  expect(_thirdPartyWidgets).toHaveLength(0)
  act(() => {
    window.marqueeExtension.defineWidget({
      name: 'foo-bar',
      icon: faBrain,
      label: 'some label',
      tags: ['some', 'tags'],
      description: 'some description'
    }, class Foobar extends HTMLElement {})
  })
  expect(_thirdPartyWidgets).toHaveLength(1)

  act(() => { __setModeName('work') })
  const listener = getEventListener()
  expect(listener.broadcast).toBeCalledWith({
    modeName: 'work',
    modes: expect.any(Object)
  })

  act(() => { __addMode('foobar', null) })
  expect(_modes).toMatchSnapshot()

  act(() => { __removeMode('foobar') })
  expect(providerValues.setModes).toBeCalledTimes(1)

  listener.emit = jest.fn()
  act(() => { __resetModes() })
  expect(listener.emit).toBeCalledWith('clear', undefined)
})
