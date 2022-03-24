import React from 'react'
import { render, screen } from '@testing-library/react'
import { GlobalProvider } from '@vscode-marquee/utils'

import ThirdPartyWidget from '../src/ThirdPartyWidget'

jest.mock('../../utils/src/contexts/Global')

const template = document.createElement('template')
template.innerHTML = /*html*/`
  <div>Hello World</div>
`

// class CustomWidget extends HTMLElement {
//   constructor () {
//     super();
//     this.attachShadow({ mode: 'open' });
//   }

//   connectedCallback() {
//     this.shadowRoot?.appendChild(template.content.cloneNode(true));
//   }
// }
// customElements.define('some-custom-widget', CustomWidget);

// TODO: this test needs to be fixed. It passes without the CustomWidget defined
// Either the test isnt testing anything meaningful or the Widget is not needed
xtest('should display custom widget', () => {
  const { container } = render(
    <GlobalProvider>
      <ThirdPartyWidget name="some-custom-widget" label="Some custom Widget" />
    </GlobalProvider>
  )
  expect(screen.getByText('Some custom Widget')).toBeInTheDocument()
  // eslint-disable-next-line testing-library/no-node-access, testing-library/no-container
  expect(container.querySelector('some-custom-widget')).toBeInTheDocument()
})
