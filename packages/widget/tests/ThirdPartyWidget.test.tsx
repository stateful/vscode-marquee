import React from 'react'
import { render, screen } from '@testing-library/react'
import { GlobalProvider } from '@vscode-marquee/utils'

import ThirdPartyWidget from '../src/ThirdPartyWidget'

jest.mock('../../utils/src/contexts/Global')

const template = document.createElement('template')
template.innerHTML = /*html*/`
  <div>Hello World</div>
`

class CustomWidget extends HTMLElement {
  constructor () {
    super()
    this.attachShadow({ mode: 'open' })
  }

  connectedCallback () {
    this.shadowRoot?.appendChild(template.content.cloneNode(true))
  }
}
customElements.define('some-custom-widget', CustomWidget)

test('should display custom widget', () => {
  const ToggleFullScreen = () => <div></div>
  const { container } = render(
    <GlobalProvider>
      <ThirdPartyWidget
        ToggleFullScreen={ToggleFullScreen}
        name="some-custom-widget"
        label="Some custom Widget"
        fullscreenMode={false}
        minimizeNavIcon={false}
      />
    </GlobalProvider>
  )
  expect(screen.getByText('Some custom Widget')).toBeInTheDocument()
  // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
  expect(container.querySelector('some-custom-widget')).toBeInTheDocument()
  // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
  expect(container.querySelector('some-custom-widget')!.shadowRoot?.innerHTML)
    .toContain('Hello World')
})
