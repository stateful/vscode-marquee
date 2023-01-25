import { JsDependencyProvider } from '../../src/js/provider'
import type { Configuration, DisplayedDependency, TerminalProvider } from '../../src/types'
import { NPMOutdatedInfo, RemoteRegistry } from '../../src/js/types'
import * as registry from '../../src/js/registry'
import vscode from 'vscode'
import vscodeMock from '../vscodeFsMock'
import projects from './projects'
import path from 'path'
import * as packageManager from '../../src/js/packageManager'

const terminal = {
  dispose: () => {},
  sendText: jest.fn(),
  show: jest.fn()
}

const terminalProvider = {
  dispose: () => {},
  getOrCreateTerminal: () => terminal
}

const refreshDependencies = jest.fn()

const remoteRegistry: RemoteRegistry = {
  '@types/node': {
    latestVersion: '18.11.18'
  },
  '@types/react': {
    latestVersion: '18.0.26'
  },
  '@emotion/react': {
    latestVersion: '11.10.5'
  },
  '@mui/material': {
    latestVersion: '5.11.4'
  },
  'typescript': {
    latestVersion: '4.9.4'
  },
  '@emotion/styled': {
    latestVersion: '11.10.5'
  },
  '@types/mocha': {
    latestVersion: '10.0.1'
  }
}

const packageManagerCmdOutdated = jest.fn<NPMOutdatedInfo[], any>(() => [])

const {
  _fsWatcherChangeDispose,
  _fsWatcherDispose
} = (vscode as unknown as typeof vscodeMock).workspace

const disposables = [
  _fsWatcherChangeDispose,
  _fsWatcherDispose
]

;(registry as any).pullRemoteRegistry = () => remoteRegistry
;(packageManager as any).packageManagerCmdOutdated = packageManagerCmdOutdated

jest.mock('vscode', () => jest.requireActual('../vscodeFsMock.ts'))

type ProviderConfig = Pick<Configuration, 'showUpToDate'> & { _webMode?: boolean }

describe('loadDependencies', () => {
  test('root project', providerTest(
    vscode.Uri.file(path.join(__dirname, '../../../../')),
    async (provider) => {
      const deps = await provider.loadDependencies()

      expect(deps).toBeTruthy()
      expect(deps).not.toHaveLength(0)
    }
  ))

  test('yarn project', providerTest(
    'yarn',
    async (provider) => {
      packageManagerCmdOutdated.mockImplementationOnce(() => [
        {
          packageId: '@mui/material',
          current: '5.10.13',
          latest: '5.11.4',
          wanted: '5.11.4',
          packageType: 'devDependencies',
          url: 'https://mui.com/material-ui/getting-started/overview/'
        },
        {
          packageId: '@types/react',
          current: '18.0.25',
          latest: '18.0.26',
          wanted: '18.0.26',
          packageType: 'devDependencies',
          url: 'https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/react'
        }
      ])
      const deps = await provider.loadDependencies()

      expect(deps).toBeTruthy()
      expect(deps).toHaveLength(5)

      normalizeDependencyList(deps!)
      expect(deps).toMatchSnapshot()
    }
  ))

  test('yarn project with workspaces', providerTest(
    'yarnWorkspaces',
    async (provider) => {
      packageManagerCmdOutdated.mockImplementationOnce(() => [
        {
          packageId: '@types/node',
          current: '16.18.9',
          latest: '18.11.18',
          packageType: 'devDependencies',
          url: 'https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/node',
          wanted: '16.18.9',
          workspace: 'yarn-project-workspace'
        }
      ])

      const deps = await provider.loadDependencies()

      expect(deps).toBeTruthy()
      expect(deps).toHaveLength(4)

      normalizeDependencyList(deps!)
      expect(deps).toMatchSnapshot()
    }
  ))
})

describe('upgradeDependency', () => {
  test('for root package', providerTest(
    'yarn',
    async (provider, uri) => {
      // must call so that package manager is set
      await provider.getPackageInfo()

      await provider.upgradeDependency('package', 'latest', undefined)

      expect(terminal.sendText).toBeCalledTimes(1)
      expect(terminal.sendText).toBeCalledWith(getPkgCmd('yarn upgrade package@latest', uri), true)
      expect(terminal.show).toBeCalledTimes(1)
      expect(terminal.show).toBeCalledWith(true)
    }
  ))

  test('for workspace package', providerTest(
    'yarnWorkspaces',
    async (provider, uri) => {
      // must call so that package manager is set
      await provider.getPackageInfo()

      await provider.upgradeDependency('package', 'latest', 'subspace')

      expect(terminal.sendText).toBeCalledTimes(1)
      expect(terminal.sendText).toBeCalledWith(getPkgCmd('yarn workspace subspace upgrade package@latest', uri), true)
      expect(terminal.show).toBeCalledTimes(1)
      expect(terminal.show).toBeCalledWith(true)
    }
  ))
})

describe('deleteDependency', () => {
  test('for root package', providerTest(
    'yarn',
    async (provider, uri) => {
      // must call so that package manager is set
      await provider.getPackageInfo()

      await provider.deleteDependency('package', undefined)

      expect(terminal.sendText).toBeCalledTimes(1)
      expect(terminal.sendText).toBeCalledWith(getPkgCmd('yarn remove package', uri), true)
      expect(terminal.show).toBeCalledTimes(1)
      expect(terminal.show).toBeCalledWith(true)
    }
  ))

  test('for workspace package', providerTest(
    'yarnWorkspaces',
    async (provider, uri) => {
      // must call so that package manager is set
      await provider.getPackageInfo()

      await provider.deleteDependency('package', 'subspace')

      expect(terminal.sendText).toBeCalledTimes(1)
      expect(terminal.sendText).toBeCalledWith(getPkgCmd('yarn workspace subspace remove package', uri), true)
      expect(terminal.show).toBeCalledTimes(1)
      expect(terminal.show).toBeCalledWith(true)
    }
  ))

  test('for workspace package root', providerTest(
    'yarnWorkspaces',
    async (provider, uri) => {
      // must call so that package manager is set
      await provider.getPackageInfo()

      await provider.deleteDependency('package', 'root', true)

      expect(terminal.sendText).toBeCalledTimes(1)
      expect(terminal.sendText).toBeCalledWith(getPkgCmd('yarn -W remove package', uri), true)
      expect(terminal.show).toBeCalledTimes(1)
      expect(terminal.show).toBeCalledWith(true)
    }
  ))
})

test('upgradeAllDependencies', providerTest(
  'yarn',
    async (provider, uri) => {
    // must call so that package manager is set
    await provider.getPackageInfo()

    await provider.upgradeAllDependencies()

    expect(terminal.sendText).toBeCalledTimes(1)
    expect(terminal.sendText).toBeCalledWith(getPkgCmd('yarn upgrade', uri), true)
    expect(terminal.show).toBeCalledTimes(1)
    expect(terminal.show).toBeCalledWith(true)
  }
))

function getPkgCmd (cmd: string, uri: vscode.Uri): string {
  return `${cmd} --cwd ${uri.fsPath}`
}

function providerTest (
  project: vscode.Uri | keyof typeof projects,
  cb: (provider: JsDependencyProvider, uri: vscode.Uri) => Promise<void>,
  config?: ProviderConfig,
) {
  return async () => {
    const uri = typeof project === 'object' ? project : vscode.Uri.file(projects[project])

    const provider = createProvider(
      uri,
      config
    )

    await cb?.(provider, uri)

    provider.dispose()

    disposables.forEach(d => {
      expect(d).toBeCalledTimes(1)
      d.mockClear()
    })

    terminal.sendText.mockClear()
    terminal.show.mockClear()
  }

  function createProvider (
    uri: vscode.Uri,
    config: ProviderConfig = { showUpToDate: true }
  ) {
    (vscode.workspace as any)._setWorkspaceFolder(uri)

    return new JsDependencyProvider(
      config as Configuration,
      terminalProvider as unknown as TerminalProvider,
      refreshDependencies
    )
  }
}

// Sorts list of `DisplayedDependency`s to ensure consistent appearance across
// test-runners in snapshots
function normalizeDependencyList (
  deps: DisplayedDependency[]
) {
  deps.sort((a, b) => {
    {
      const comp = a.name.localeCompare(b.name)
      if(comp !== 0) { return comp }
    }

    {
      const comp = a.project?.localeCompare(b.project ?? a.project) ?? 0
      return comp
    }
  })
}
