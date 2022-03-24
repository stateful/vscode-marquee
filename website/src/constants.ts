export const IS_PROD = process.env.NODE_ENV === 'production'
export const TITLE = 'Marquee • VS Code Extension'
export const DESCRIPTION = 'Marquee is a VS Code extension designed to naturally integrate with your development flow, so that you will no longer lose track of your thoughts while you\'re coding.'
export const CANONICAL = IS_PROD
  ? 'https://marquee.stateful.com'
  : 'localhost:3000'
export const GOOGLE_ANALYTICS_ID = 'UA-170174976-2'
export const INTERCOM_APP_ID = process.env.NODE_ENV === "development"
  ? "ehnvut86"
  : "b6aajb4w"

export const MAIN_COLOR = '#db2051'
export const BG_COLOR = { light: 'gray.150', dark: 'gray.800' }
export const HERO_BG_COLOR = { light: 'gray.200', dark: 'gray.900' }
export const COLOR = { light: 'black', dark: 'white' }

export type Navigation = {
  [title: string]: {
    href: string
    children?: Navigation
    content?: string
  }
}

export const DOCS_CONTENT: Navigation = {
  'Getting Started': {
    href: '/docs/start',
    content: 'README.md'
  },
  'Core Widgets': {
    href: '/docs/coreWidgets',
    content: 'docs/CoreWidgets.md'
  },
  'Custom Widgets': {
    href: '/docs/customWidgets',
    content: 'docs/CustomWidgets.md'
  },
  'Contributing': {
    href: '/docs/contributing',
    content: 'CONTRIBUTING.md'
  }
}

export const NAVIGATION: Navigation = {
  'Start': {
    href: '/'
  },
  'Docs': {
    href: '/docs/start',
    children: DOCS_CONTENT
  },
  'Marketplace': {
    href: 'https://marketplace.visualstudio.com/items?itemName=stateful.marquee'
  }
}
