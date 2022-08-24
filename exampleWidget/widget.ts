import Channel from 'tangle/webviews'
import { faBrain } from '@fortawesome/free-solid-svg-icons/faBrain'

import type { MarqueeWindow } from '../packages/utils'
declare const window: MarqueeWindow

const ch = new Channel<{ counter: number, changeName: string }>('stateful.marquee')
const client = ch.attach(window.vscode)

const template = document.createElement('template')
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
`

class StatefulMarqueeWidget extends HTMLElement {
  static get is () {
    return 'stateful-marquee-widget'
  }

  constructor () {
    super()
    this.attachShadow({ mode: 'open' })
    client.on('counter', (cnt) => {
      this.shadowRoot!.querySelector('div')!.innerHTML = (
        'Hello World' +
        [...new Array(cnt)].map(() => '!').join('')
      )
    })
  }

  connectedCallback () {
    this.shadowRoot?.appendChild(template.content.cloneNode(true))
  }
}

const widget2Template = document.createElement('template')
widget2Template.innerHTML = /*html*/`
  <style>
  :host {
    margin: 10px;
    display: block;
  }
  button {
    cursor: pointer;
    padding: 10px 15px;
    border: none;
    background-color: #F62458;
    color: #ffffff
  }
  </style>
  <section>
    <div>Name: </div>
    <button>Change Name</button>
  </section>
`
class StatefulMarqueeWidget2 extends HTMLElement {
  static get is () {
    return 'stateful-marquee-updatename'
  }
  constructor () {
    super()
    this.attachShadow({ mode: 'open' })
    client.on('changeName', (name) => {
      this.shadowRoot!.querySelector('div')!.innerHTML = `<h1>Name: ${name}</h1>`
    })
  }

  connectedCallback () {
    this.shadowRoot?.appendChild(widget2Template.content.cloneNode(true))    
    const button = this.shadowRoot!.querySelector('button')
    button?.addEventListener('click', () => {
      client.emit('changeName', 'Bar')
    })
  }
}

window.marqueeExtension.defineWidget({
  name: StatefulMarqueeWidget.is,
  icon: faBrain,
  label: 'Marquee Example Widget - Counter',
  tags: ['productivity'],
  description: 'An example widget that shows how other extensions can add Marquee widgets.'
}, StatefulMarqueeWidget)

window.marqueeExtension.defineWidget({
  name: StatefulMarqueeWidget2.is,
  icon: faBrain,
  label: 'Marquee Example - Change Name',
  tags: ['productivity'],
  description: 'An example widget that shows how other extensions can add Marquee widgets.'
}, StatefulMarqueeWidget2)

export default StatefulMarqueeWidget
