import React from 'react'
import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/react'

import { ProjectItemLink, MarqueeWindow } from '../../src'

declare const window: MarqueeWindow

test('should render nothing if path is not provided', () => {
  const item = { id: 'foobar', body: 'foobar', workspaceId: null }
  const { container } = render(<ProjectItemLink item={item} />)
  expect(container).toBeEmptyDOMElement()
})

test('with path as icon only', async () => {
  window.vscode = { postMessage: jest.fn() } as any
  const item = { id: 'foobar', body: 'foobar', workspaceId: null, path: '/foo/bar:42' }
  render(<ProjectItemLink item={item} iconOnly={true} />)
  expect(screen.queryByText('bar:42')).not.toBeInTheDocument()
  await userEvent.click(screen.getByTestId('LinkIcon'))
  expect((window.vscode.postMessage as jest.Mock).mock.calls).toMatchSnapshot()
})

test('with path with label', async () => {
  window.vscode = { postMessage: jest.fn() } as any
  const item = { id: 'foobar', body: 'foobar', workspaceId: null, path: '/foo/bar:42' }
  render(<ProjectItemLink item={item} />)
  expect(screen.getByText('bar:43')).toBeInTheDocument()
})

test('without path and no git information', async () => {
  const item = { id: 'foobar', body: 'foobar', workspaceId: null, origin: '/foo/bar:42' }
  const { container } = render(<ProjectItemLink item={item} />)
  expect(container).toBeEmptyDOMElement()
})

test('without path but with git information with label', async () => {
  const item = {
    id: 'foobar',
    body: 'foobar',
    workspaceId: null,
    origin: '/foo/bar:42',
    commit: 'sha123',
    branch: 'main',
    gitUri: 'git@github.com:stateful/marquee#main'
  }
  render(<ProjectItemLink item={item} />)
  expect(screen.getByText('bar:43')).toBeInTheDocument()
  expect((screen.getByLabelText('Project Item Link') as HTMLAnchorElement).href)
    .toBe('https://github.com/stateful/marquee/blob/sha123/foo/bar#L43')
})

test('without path but with git information icon only', async () => {
  const item = {
    id: 'foobar',
    body: 'foobar',
    workspaceId: null,
    origin: '/foo/bar:42',
    commit: 'sha123',
    branch: 'main',
    gitUri: 'git@github.com:stateful/marquee#main'
  }
  render(<ProjectItemLink item={item} iconOnly={true} />)
  expect(screen.queryByText('bar:43')).not.toBeInTheDocument()
})
