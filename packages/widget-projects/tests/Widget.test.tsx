import React from 'react'
import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/react'
import { GlobalProvider, connect, MarqueeWindow } from '@vscode-marquee/utils'

import Widget from '../src'
import { WorkspaceProvider } from '../src/Context'

declare const window: MarqueeWindow

(connect as jest.Mock).mockReset()

const TEST_STATE = {
  lastVisited: 'fa0f7de4-f283-51b2-b4e5-5f47355c0b78',
  visitCount: {
    '86fc84c1-6fee-5479-9930-3094fc498792': 1,
    'f894785a-deec-5197-81bb-975087ae3595': 2,
    'fa0f7de4-f283-51b2-b4e5-5f47355c0b78:': 3
  },
  workspaces: [
    {
      id: 'fa0f7de4-f283-51b2-b4e5-5f47355c0b78',
      name: 'workspaceC',
      type: 'folder',
      path: '/workspaceC'
    }, {
      id: '86fc84c1-6fee-5479-9930-3094fc498792',
      name: 'workspaceA',
      type: 'folder',
      path: '/workspaceA'
    }, {
      id: 'f894785a-deec-5197-81bb-975087ae3595',
      name: 'workspaceB',
      type: 'folder',
      path: '/workspaceB'
    }
  ]
}

beforeEach(() => {
  window.vscode = { postMessage: jest.fn() } as any
})

it('renders component correctly', async () => {
  const setWorkspaceFilter: any = jest.fn()

  ;(connect as jest.Mock).mockReturnValue({
    openProjectInNewWindow: false,
    setWorkspaceFilter,
    workspaces: [
      {
        id: '012c54122a42128fc1b4ec29a7b5609995f41a5c',
        name: 'example',
        type: 'folder',
        path: '/Users/christianbromann/Sites/WebdriverIO/example',
      },
    ],
  })
  render(
    <GlobalProvider>
      <WorkspaceProvider>
        <Widget.component />
      </WorkspaceProvider>
    </GlobalProvider>
  )
  expect(screen.getByText('example')).toBeInTheDocument()
  expect(screen.queryByPlaceholderText('Type here...')).not.toBeInTheDocument()
  await userEvent.click(screen.getByLabelText('Open Filter Search'))
  userEvent.type(screen.getByPlaceholderText('Type here...'), 'f')
  userEvent.type(screen.getByPlaceholderText('Type here...'), 'o')
  userEvent.type(screen.getByPlaceholderText('Type here...'), 'o')
  userEvent.type(screen.getByPlaceholderText('Type here...'), '{enter}')
  await userEvent.click(screen.getByText('Projects'))
  await userEvent.click(screen.getByLabelText('Open Filter Search'))

  expect(window.vscode.postMessage).toBeCalledTimes(0)
  await userEvent.click(screen.getByLabelText('Open Folder'))
  expect(window.vscode.postMessage).toBeCalledTimes(1)
  expect((window.vscode.postMessage as jest.Mock).mock.calls).toMatchSnapshot()
  ;(window.vscode.postMessage as jest.Mock).mockClear()

  await userEvent.click(screen.getByLabelText('Open Recent'))
  expect(window.vscode.postMessage).toBeCalledTimes(1)
  expect((window.vscode.postMessage as jest.Mock).mock.calls).toMatchSnapshot()

  expect(setWorkspaceFilter).toBeCalledWith('foo')
})

it('should render projects alphabetrically', () => {
  (connect as jest.Mock).mockReturnValue(TEST_STATE)
  render(
    <GlobalProvider>
      <WorkspaceProvider>
        <Widget.component />
      </WorkspaceProvider>
    </GlobalProvider>
  )

  const listElems = screen.getAllByTestId('projectPath')
  expect(listElems).toHaveLength(3)
  expect(listElems.map((el) => el.innerHTML)).toEqual([
    '/workspaceA',
    '/workspaceB',
    '/workspaceC'
  ])
})

it('should render projects by usage', () => {
  window.marqueeStateConfiguration['@vscode-marquee/notes-widget'].state.notes = [
    // workspaceC
    { workspaceId: 'fa0f7de4-f283-51b2-b4e5-5f47355c0b78' },
    // workspaceB
    { workspaceId: 'f894785a-deec-5197-81bb-975087ae3595' },
    // workspaceA
    { workspaceId: '86fc84c1-6fee-5479-9930-3094fc498792' }
  ]
  window.marqueeStateConfiguration['@vscode-marquee/todo-widget'].state.todos = [
    // workspaceC
    { workspaceId: 'fa0f7de4-f283-51b2-b4e5-5f47355c0b78' }
  ]
  window.marqueeStateConfiguration['@vscode-marquee/snippets-widget'].state.snippets = [
    // workspaceC
    { workspaceId: 'fa0f7de4-f283-51b2-b4e5-5f47355c0b78' },
    // workspaceB
    { workspaceId: 'f894785a-deec-5197-81bb-975087ae3595' }
  ] as any
  (connect as jest.Mock).mockReturnValue({
    ...TEST_STATE,
    workspaceSortOrder: 'usage',
  })
  render(
    <GlobalProvider>
      <WorkspaceProvider>
        <Widget.component />
      </WorkspaceProvider>
    </GlobalProvider>
  )

  const listElems = screen.getAllByTestId('projectPath')
  expect(listElems).toHaveLength(3)
  expect(listElems.map((el) => el.innerHTML)).toEqual([
    '/workspaceC',
    '/workspaceB',
    '/workspaceA'
  ])
})

it('should render projects by visits', () => {
  (connect as jest.Mock).mockReturnValue({
    ...TEST_STATE,
    workspaceSortOrder: 'visits'
  })
  render(
    <GlobalProvider>
      <WorkspaceProvider>
        <Widget.component />
      </WorkspaceProvider>
    </GlobalProvider>
  )

  const listElems = screen.getAllByTestId('projectPath')
  expect(listElems).toHaveLength(3)
  expect(listElems.map((el) => el.innerHTML)).toEqual([
    '/workspaceB',
    '/workspaceA',
    '/workspaceC'
  ])
})
