import Welcome from '@vscode-marquee/widget-welcome'
import Github from '@vscode-marquee/widget-github'
import News from '@vscode-marquee/widget-news'
import Weather from '@vscode-marquee/widget-weather'
import Todo from '@vscode-marquee/widget-todo'
import Notes from '@vscode-marquee/widget-notes'
import NPMStats from '@vscode-marquee/widget-npm-stats'
import Markdown from '@vscode-marquee/widget-markdown'
import Snippets from '@vscode-marquee/widget-snippets'
import Projects from '@vscode-marquee/widget-projects'
import Stateful from '@vscode-marquee/widget-stateful'

import { WidgetConfig, Theme, State, Configuration, LayoutType } from './types'

export const DEFAULT_STATE: State = {
  modeName: 'default'
}

export const DEFAULT_CONFIGURATION: Configuration = {
  modes: {}
}

export const widgetConfig: WidgetConfig[] = [
  Welcome,
  News,
  Github,
  Todo,
  Weather,
  Projects,
  Snippets,
  Notes,
  NPMStats,
  Markdown,
  Stateful
] as WidgetConfig[]
export const SENTRY_DNS = 'https://6e86226331e84bd9885554fdac788ce7@o481102.ingest.sentry.io/5543775'
export const themes: Theme[] = [
  {
    id: 1,
    background: './1.jpg',
    title: 'Stockholm, Sweden',
    description: 'Midsummer',
    author: 'Archibald Kingsley',
  },
  {
    id: 2,
    background: './2.jpg',
    title: 'Seattle, WA',
    description: 'The City of Flowers',
    author: 'Felipe Galvan',
  },
  {
    id: 3,
    background: './3.jpg',
    title: 'Boston, MA',
    description: 'Featuring Fenway',
    author: 'Todd Kent',
  },
  {
    id: 4,
    background: './4.jpg',
    title: 'Lago di Garda, Italy',
    description: 'Bellissima',
    author: 'Jan Delay',
  },
  {
    id: 5,
    background: './5.jpg',
    title: 'Dubrovnik, Croatia',
    description: 'aka King\'s Landing',
    author: 'Archibald Kingsley',
  },
  {
    id: 6,
    background: './6.jpg',
    title: 'Tegernsee, Bavaria, Germany',
    description: 'Schnappszeit',
    author: 'Archibald Kingsley',
  },
  {
    id: 7,
    background: './7.jpg',
    title: 'New York, NY',
    description: 'Central Park',
    author: 'Jermaine Ee',
  },
  {
    id: 8,
    background: './8.jpg',
    title: 'Arizona, USA',
    description: 'Desert Tranquility',
    author: 'Jan Delay',
  },
  {
    id: 9,
    background: './9.jpg',
    title: 'Golden Gate, San Francisco',
    description: 'Purely iconic',
    author: 'Archibald Kingsley',
  },
  {
    id: 10,
    background: './10.jpg',
    title: 'Coffee, Canada',
    description: 'The comfort of a cup of joe',
    author: 'Archibald Kingsley',
  },
  {
    id: 11,
    background: './11.jpg',
    title: 'The force',
    description: 'May the code be with you',
    author: 'Archibald Kingsley',
  },
  {
    id: 12,
    background: './12.jpg',
    title: 'A snowy tree',
    description: 'Winter magic',
    author: 'Archibald Kingsley',
  },
  {
    id: 13,
    backgroundColor: '#000000',
    title: 'Dark',
    description: 'Simply dark',
    author: 'Archibald Kingsley',
  },
  {
    id: 14,
    backgroundColor: '#FFFFFF',
    title: 'Light',
    description: 'Simply light',
    author: 'Archibald Kingsley',
  },
]

export const NO_BACKGROUND_STYLE = {
  position: 'fixed' as 'fixed',
  width: '100%',
  height: '100%'
}

export const BACKGROUND_STYLE = {
  ...NO_BACKGROUND_STYLE,
  backgroundSize: 'cover',
  backgroundRepeat: 'no-repeat',
}

export const defaultLayout: LayoutType = {
  lg: [
    { minW: 3, minH: 12, w: 4, h: 12, x: 0, y: 0, i: 'welcome', moved: false, static: false },
    { minW: 3, minH: 12, w: 4, h: 12, x: 8, y: 12, i: 'todo', moved: false, static: false },
    { minW: 3, minH: 12, w: 4, h: 12, x: 8, y: 0, i: 'weather', moved: false, static: false },
    { minW: 3, minH: 12, w: 4, h: 12, x: 4, y: 12, i: 'github', moved: false, static: false },
    { minW: 3, minH: 12, w: 4, h: 12, x: 0, y: 12, i: 'news', moved: false, static: false },
    { minW: 3, minH: 12, w: 6, h: 13, x: 0, y: 24, i: 'snippets', moved: false, static: false },
    { minW: 3, minH: 12, w: 6, h: 13, x: 6, y: 24, i: 'notes', moved: false, static: false },
    { minW: 3, minH: 12, w: 6, h: 13, x: 6, y: 24, i: 'npm-stats', moved: false, static: false },
    { minW: 3, minH: 12, w: 6, h: 13, x: 6, y: 24, i: 'markdown', moved: false, static: false },
    { minW: 3, minH: 12, w: 4, h: 12, x: 4, y: 0, i: 'projects', moved: false, static: false },
  ],
  md: [
    { minW: 3, minH: 12, w: 3, h: 12, x: 0, y: 0, i: 'welcome', moved: false, static: false },
    { minW: 3, minH: 12, w: 4, h: 12, x: 6, y: 12, i: 'todo', moved: false, static: false },
    { minW: 3, minH: 12, w: 3, h: 12, x: 7, y: 0, i: 'weather', moved: false, static: false },
    { minW: 3, minH: 12, w: 3, h: 12, x: 3, y: 12, i: 'github', moved: false, static: false },
    { minW: 3, minH: 12, w: 3, h: 12, x: 0, y: 12, i: 'news', moved: false, static: false },
    { minW: 3, minH: 12, w: 5, h: 12, x: 0, y: 24, i: 'snippets', moved: false, static: false },
    { minW: 3, minH: 12, w: 5, h: 13, x: 5, y: 24, i: 'notes', moved: false, static: false },
    { minW: 3, minH: 12, w: 5, h: 13, x: 5, y: 24, i: 'markdown', moved: false, static: false },
    { minW: 3, minH: 12, w: 5, h: 13, x: 5, y: 24, i: 'npm-stats', moved: false, static: false },
    { minW: 3, minH: 12, w: 6, h: 12, x: 3, y: 0, i: 'projects', moved: false, static: false },
  ],
  sm: [
    { minW: 3, minH: 12, w: 3, h: 12, x: 0, y: 0, i: 'welcome', moved: false, static: false },
    { minW: 3, minH: 12, w: 3, h: 12, x: 3, y: 24, i: 'todo', moved: false, static: false },
    { minW: 3, minH: 12, w: 3, h: 12, x: 3, y: 12, i: 'weather', moved: false, static: false },
    { minW: 3, minH: 12, w: 3, h: 12, x: 0, y: 24, i: 'github', moved: false, static: false },
    { minW: 3, minH: 12, w: 3, h: 12, x: 0, y: 12, i: 'news', moved: false, static: false },
    { minW: 3, minH: 12, w: 6, h: 13, x: 0, y: 36, i: 'snippets', moved: false, static: false },
    { minW: 3, minH: 12, w: 6, h: 13, x: 0, y: 49, i: 'notes', moved: false, static: false },
    { minW: 3, minH: 12, w: 6, h: 13, x: 0, y: 49, i: 'npm-stats', moved: false, static: false },
    { minW: 3, minH: 12, w: 6, h: 13, x: 0, y: 49, i: 'markdown', moved: false, static: false },
    { minW: 3, minH: 12, w: 3, h: 12, x: 3, y: 0, i: 'projects', moved: false, static: false },
  ],
  xs: [
    { minW: 3, minH: 12, w: 2, h: 11, x: 0, y: 0, i: 'welcome', moved: false, static: false },
    { minW: 3, minH: 12, w: 4, h: 12, x: 0, y: 23, i: 'todo', moved: false, static: false },
    { minW: 3, minH: 12, w: 2, h: 11, x: 2, y: 0, i: 'weather', moved: false, static: false },
    { minW: 3, minH: 12, w: 4, h: 12, x: 0, y: 74, i: 'github', moved: false, static: false },
    { minW: 3, minH: 12, w: 4, h: 13, x: 0, y: 61, i: 'news', moved: false, static: false },
    { minW: 3, minH: 12, w: 4, h: 13, x: 0, y: 35, i: 'snippets', moved: false, static: false },
    { minW: 3, minH: 12, w: 4, h: 13, x: 0, y: 48, i: 'notes', moved: false, static: false },
    { minW: 3, minH: 12, w: 4, h: 13, x: 0, y: 48, i: 'markdown', moved: false, static: false },
    { minW: 3, minH: 12, w: 4, h: 13, x: 0, y: 48, i: 'npm-stats', moved: false, static: false },
    { minW: 3, minH: 12, w: 4, h: 12, x: 0, y: 11, i: 'projects', moved: false, static: false },
  ],
  xxs: [
    { minW: 3, minH: 12, w: 3, h: 11, x: 0, y: 0, i: 'welcome', moved: false, static: false },
    { minW: 3, minH: 12, w: 3, h: 12, x: 0, y: 35, i: 'todo', moved: false, static: false },
    { minW: 3, minH: 12, w: 3, h: 12, x: 0, y: 11, i: 'weather', moved: false, static: false },
    { minW: 3, minH: 12, w: 3, h: 12, x: 0, y: 86, i: 'github', moved: false, static: false },
    { minW: 3, minH: 12, w: 3, h: 13, x: 0, y: 73, i: 'news', moved: false, static: false },
    { minW: 3, minH: 12, w: 3, h: 13, x: 0, y: 47, i: 'snippets', moved: false, static: false },
    { minW: 3, minH: 12, w: 3, h: 13, x: 0, y: 60, i: 'notes', moved: false, static: false },
    { minW: 3, minH: 12, w: 3, h: 13, x: 0, y: 60, i: 'markdown', moved: false, static: false },
    { minW: 3, minH: 12, w: 3, h: 13, x: 0, y: 60, i: 'npm-stats', moved: false, static: false },
    { minW: 3, minH: 12, w: 3, h: 12, x: 0, y: 23, i: 'projects', moved: false, static: false },
  ],
}

export const defaultEnabledWidgets = {
  news: true,
  github: true,
  todo: true,
  weather: true,
  notes: true,
  'npm-stats': true,
  markdown: true,
  welcome: true,
  snippets: true,
  projects: true,
}

export const presetModes = ['default', 'work', 'play'] as string[]
