import { connect, GlobalProvider, MarqueeWindow } from '@vscode-marquee/utils'
import type { State } from '../src/types'
import { DEFAULT_CONFIGURATION } from '../src/constants'
import { render, screen, within } from '@testing-library/react'
import React from 'react'
import Widget from '../src/index'
import { DependencyProvider } from '../src/Context'
import userEvent from '@testing-library/user-event'

declare const window: MarqueeWindow

(connect as jest.Mock).mockReset()

const TEST_STATE = {
  capabilities: {
    deleteDependency: true,
    explicitNeedsUpgrade: true,
    upgradeAllDependencies: true,
    upgradeDependency: true,
  },
  dependencies: [
    {
      'dependencyType': 'dev',
      'isRootWorkspace': false,
      'name': '@emotion/react',
      'url': undefined,
      'versions': {
        'current': '11.10.5',
        'latest': '11.10.5',
        'query': '^11.10.5',
      },
    },
    {
      'dependencyType': 'dev',
      'isRootWorkspace': false,
      'name': '@mui/material',
      'needsUpgrade': true,
      'project': undefined,
      'url': 'https://mui.com/material-ui/getting-started/overview/',
      'versions': {
        'current': '5.10.13',
        'latest': '5.11.4',
        'query': '^5.10.13',
        'wanted': '5.11.4',
      },
    },
    {
      'dependencyType': 'dev',
      'isRootWorkspace': false,
      'name': '@types/react',
      'needsUpgrade': true,
      'project': undefined,
      'url': 'https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/react',
      'versions': {
        'current': '18.0.25',
        'latest': '18.0.26',
        'query': '^18.0.25',
        'wanted': '18.0.26',
      },
    }
  ],
  event: {},
  loading: false
} satisfies State

beforeEach(() => {
  window.vscode = { postMessage: jest.fn() } as any
})

it('renders component correctly', async () => {
  const setEvent = jest.fn<void, [data: State['event']]>()
  
  ;(connect as jest.Mock).mockReturnValue({
    ...TEST_STATE,
    ...DEFAULT_CONFIGURATION,
    setEvent
  })

  render(
    <GlobalProvider>
      <DependencyProvider>
        <Widget.component />
      </DependencyProvider>
    </GlobalProvider>
  )

  // initial refresh
  expect(setEvent).toBeCalledWith<[State['event']]>({
    id: 0,
    type: 'refreshDependencies',
    payload: {}
  })

  setEvent.mockClear()

  // manual options
  await userEvent.click(screen.getByLabelText('Refresh Dependencies'))
  expect(setEvent).toBeCalledTimes(1)
  await userEvent.click(screen.getByLabelText('Upgrade All Dependencies'))
  expect(setEvent).toBeCalledTimes(2)
  
  setEvent.mockClear()

  const dependencyList = screen.getByLabelText('dependency-list')

  const dependencies = within(dependencyList).getAllByLabelText('dependency-entry')

  expect(dependencies).toHaveLength(TEST_STATE.dependencies.length)

  for (const dependencyContainer of dependencies) {
    const nameContainer = within(dependencyContainer).getByLabelText('dependency-name-text')

    const packageId = nameContainer!.innerHTML
    const dependencyMeta = TEST_STATE.dependencies.find(d => d.name === packageId)

    expect(dependencyMeta).toBeTruthy()

    // currentVersion
    within(dependencyContainer).getByLabelText('dependency-version-info-current')

    const latestVersion = within(dependencyContainer).getByLabelText('dependency-version-info-latest')

    if (dependencyMeta?.needsUpgrade) {
      await userEvent.click(within(latestVersion).getByLabelText('dependency-upgrade-button'))

      const wantedVersion = within(dependencyContainer).getByLabelText('dependency-version-info-wanted')

      await userEvent.click(within(wantedVersion).getByLabelText('dependency-upgrade-button'))

      expect(setEvent).toBeCalledTimes(2)
      setEvent.mockClear()
    }

    const linkButton = within(dependencyContainer).queryByLabelText('dependency-url-button')
    if(dependencyMeta?.url) {
      expect(linkButton).toBeInTheDocument()
    }

    within(dependencyContainer).getByLabelText('dependency-delete-button')
  }
})

it('hides actions if not capable', () => {
  ;(connect as jest.Mock).mockReturnValue({
    ...TEST_STATE,
    ...DEFAULT_CONFIGURATION,
    setEvent: jest.fn(),
    capabilities: {
      deleteDependency: false,
      explicitNeedsUpgrade: false,
      upgradeAllDependencies: false,
      upgradeDependency: false,
    }
  })

  render(
    <GlobalProvider>
      <DependencyProvider>
        <Widget.component />
      </DependencyProvider>
    </GlobalProvider>
  )

  const dependencyList = screen.getByLabelText('dependency-list')

  expect(screen.queryByLabelText('Upgrade All Dependencies')).not.toBeInTheDocument()

  expect(within(dependencyList).queryByLabelText('dependency-upgrade-button')).not.toBeInTheDocument()

  expect(within(dependencyList).queryByLabelText('dependency-delete-button')).not.toBeInTheDocument()
})