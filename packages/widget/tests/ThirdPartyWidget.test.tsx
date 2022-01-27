import React from 'react';
import { render } from '@testing-library/react';
import { PrefProvider } from '@vscode-marquee/utils';

import { ThirdPartyWidget } from '../src';

const template = document.createElement('template');
template.innerHTML = /*html*/`
  <div>Hello World</div>
`;

class CustomWidget extends HTMLElement {
  constructor () {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.shadowRoot?.appendChild(template.content.cloneNode(true));
  }
}
customElements.define('some-custom-widget', CustomWidget);

test('should display custom widget', () => {
  const { getByText, container } = render(
    <PrefProvider>
      {/* @ts-expect-error */}
      <ThirdPartyWidget name="some-custom-widget" label="Some custom Widget" />
    </PrefProvider>
  );
  expect(getByText('Some custom Widget')).toBeTruthy();
  expect(container.querySelector('some-custom-widget')).toBeTruthy();
});
