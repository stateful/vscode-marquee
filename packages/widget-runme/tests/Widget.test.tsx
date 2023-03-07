import React from 'react'
import { render, screen } from '@testing-library/react'
import { GlobalProvider, connect } from '@vscode-marquee/utils'

import Widget from '../src'
import { RunmeProvider } from '../src/Context'

describe('Runme Widget', () => {
  it('should render install view if not installed', () => {
    render(
      <GlobalProvider>
        <RunmeProvider>
          <Widget.component />
        </RunmeProvider>
      </GlobalProvider>
    )
    expect(screen.getByText('Add to VS Code')).toBeInTheDocument()
  })

  it('should render an CTA to start a runme notebook', async () => {
    (connect as jest.Mock).mockReturnValue({ isInstalled: true, notebooks: [] })
    render(
      <GlobalProvider>
        <RunmeProvider>
          <Widget.component />
        </RunmeProvider>
      </GlobalProvider>
    )
    expect(screen.getByText((t) => t.includes('No notebooks found')))
      .toBeInTheDocument()
  })

  it('should render list view if installed', async () => {
    (connect as jest.Mock).mockReturnValue({
      isInstalled: true,
      notebooks: ['file:///foo/bar.md', 'file:///bar/foo.md']
    })
    render(
      <GlobalProvider>
        <RunmeProvider>
          <Widget.component />
        </RunmeProvider>
      </GlobalProvider>
    )
    expect(screen.getByText('bar.md')).toBeInTheDocument()
    expect(screen.getByText('/foo')).toBeInTheDocument()
    expect(screen.getByText('foo.md')).toBeInTheDocument()
    expect(screen.getByText('/bar')).toBeInTheDocument()
  })
})
