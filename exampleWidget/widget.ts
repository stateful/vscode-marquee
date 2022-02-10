import Channel from 'tangle/webviews';
import { faBrain } from "@fortawesome/free-solid-svg-icons/faBrain";

import type { MarqueeWindow } from '../packages/utils';
declare const window: MarqueeWindow;

const ch = new Channel<{ counter: number }>('stateful.marquee');
const client = ch.attach(window.vscode as any);

const template = document.createElement('template');
template.innerHTML = /*html*/`
  <style>
  :host {
    margin: 10px;
    display: block;
  }
  </style>
  <div>
    Hello World
  </div>
`;

class StatefulMarqueeWidget extends HTMLElement {
  static get is() {
    return 'stateful-marquee-widget';
  }

  constructor () {
    super();
    this.attachShadow({ mode: 'open' });
    client.on('counter', (cnt) => {
      this.shadowRoot!.querySelector('div')!.innerHTML = (
        'Hello World' +
        [...new Array(cnt)].map(() => '!').join('')
      );
    });
  }

  connectedCallback() {
    this.shadowRoot?.appendChild(template.content.cloneNode(true));
  }
}

window.marqueeExtension.defineWidget({
  name: StatefulMarqueeWidget.is,
  icon: faBrain,
  label: 'Marquee Example Widget',
  tags: ['productivity'],
  description: 'An example widget that shows how other extensions can add Marquee widgets.'
}, StatefulMarqueeWidget);

export default StatefulMarqueeWidget;
