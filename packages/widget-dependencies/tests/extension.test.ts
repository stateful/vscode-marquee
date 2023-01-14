import { DependenciesExtensionManager } from '../src/extension'
import { DependencyProvider, DisplayedDependency } from '../src/types'
import * as constants from '../src/constants'

const loadDeps = jest.fn()
const updateDep = jest.fn()
const deleteDep = jest.fn()
const upgradeDeps = jest.fn()

class TestDependencyProvider1 implements DependencyProvider {
  async loadDependencies (): Promise<DisplayedDependency[] | undefined> {
    loadDeps()
    return []
  }

  async upgradeDependency (
    packageId: string,
    toVersion: string,
    workspace: string|undefined
  ) {
    updateDep(packageId, toVersion, workspace)
  }

  async deleteDependency (
    packageId: string, 
    workspace: string|undefined,
    isRootWorkspace?: boolean
  ) {
    deleteDep(packageId, workspace, isRootWorkspace)
  }

  async upgradeAllDependencies () {
    upgradeDeps()
  }

  dispose () { }
}

beforeEach(() => {
  loadDeps.mockClear()
  updateDep.mockClear()
  deleteDep.mockClear()
  upgradeDeps.mockClear()
})

class TestDependencyProvider2 implements DependencyProvider {
  async loadDependencies (): Promise<DisplayedDependency[] | undefined> {
    loadDeps()
    return []
  }

  dispose () { }
}

;(constants as any).DependencyProviders = [
  TestDependencyProvider1,
  TestDependencyProvider2
]

test('loadDependencies', withManager(async (manager) => {
  await manager.loadDependencies()

  expect(manager.updateState).toBeCalledWith('dependencies', [])

  expect(loadDeps).toBeCalledTimes(1)
}))

describe('events', () => {
  test('updateDependency', withManager(async (manager) => {
    await manager.handleEvent({
      type: 'updateDependency',
      payload: {
        packageId: 'package',
        toVersion: 'latest',
        workspace: 'root'
      }
    })
  
    expect(updateDep).toBeCalledTimes(1)
    expect(updateDep).toBeCalledWith('package', 'latest', 'root')
  }, true))

  test('deleteDependency', withManager(async (manager) => {
    await manager.handleEvent({
      type: 'removeDependency',
      payload: {
        packageId: 'package',
        workspace: 'root',
        isRootWorkspace: true
      }
    })
  
    expect(deleteDep).toBeCalledTimes(1)
    expect(deleteDep).toBeCalledWith('package', 'root', true)

    deleteDep.mockClear()
  }, true))

  test('upgradeAllDependencies', withManager(async (manager) => {
    await manager.handleEvent({
      type: 'updateAllDependencies',
      payload: { }
    })
  
    expect(upgradeDeps).toBeCalledTimes(1)
    expect(upgradeDeps).toBeCalledWith()

    upgradeDeps.mockClear()
  }, true))
})

function withManager (cb: (manager: DependenciesExtensionManager) => Promise<void>, loadDeps = false) {
  return async function () {
    const context = {
      globalState: {
        get: jest.fn().mockReturnValue({})
      }
    }
  
    const manager = new DependenciesExtensionManager(context as any)

    if(loadDeps) { await manager.loadDependencies() }

    await cb(manager)
  }
}