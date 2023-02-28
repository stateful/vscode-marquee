import vscode from 'vscode'
import ExtensionManager, { Logger }  from '@vscode-marquee/utils/extension'
import { DEFAULT_CONFIGURATION, DEFAULT_STATE, DependencyProviders } from './constants'
import type {
  Configuration,
  DependencyProvider,
  EventsObj,
  State,
  TerminalProvider
} from './types'
import hash from 'object-hash'
import { NamedTerminalProvider } from './util'

const STATE_KEY = 'widgets.dependencies'

export class DependenciesExtensionManager extends ExtensionManager<State, Configuration> {
  private activeProvider: DependencyProvider|undefined
  private terminalProvider: TerminalProvider

  constructor (context: vscode.ExtensionContext, loadDependencies = true) {
    super(
      context,
      STATE_KEY,
      DEFAULT_CONFIGURATION,
      DEFAULT_STATE
    )

    this.terminalProvider = new NamedTerminalProvider('Marquee Dependencies')
    this._disposables.push(this.terminalProvider)

    this._disposables.push(
      vscode.workspace.onDidChangeWorkspaceFolders(() => {
        this.loadDependencies()
      })
    )

    this.setLoading(false)
      .then(async () => loadDependencies && this.loadDependencies())
  }

  async handleEvent (data: EventsObj) {
    const { type, payload } = data

    if (type === 'refreshDependencies') {
      return this.loadDependencies()
    }

    if (type === 'updateDependency') {
      const { packageId, toVersion, workspace } = payload
      return this.activeProvider?.upgradeDependency?.(
        packageId, toVersion, workspace
      )
    }

    if (type === 'removeDependency') {
      const { packageId, workspace, isRootWorkspace } = payload
      return this.activeProvider?.deleteDependency?.(
        packageId, workspace, isRootWorkspace
      )
    }

    if (type === 'updateAllDependencies') {
      return this.activeProvider?.upgradeAllDependencies?.()
    }

    Logger.warn(`Received unknown event" ${type}`)
  }

  async loadDependencies () {
    await this.withLoading(async () => {
      for (const Provider of DependencyProviders) {
        const provider = new Provider(
          this._configuration,
          this.terminalProvider,
          (autoRefresh = true) => {
            if (this.configuration.autoRefresh || !autoRefresh) {
              this.loadDependencies()
            }
          }
        )

        const deps = await provider.loadDependencies()
        vscode.window.showInformationMessage(JSON.stringify(deps))

        if(!deps) { continue }

        await this.updateState('dependencies', deps)
        await this.setDependencyProvider(provider)

        this.broadcast({
          dependencies: deps,
          capabilities: this._state.capabilities,
        })

        return
      }

      this.updateState('dependencies', [])
      this.broadcast({ dependencies: [] })
    }, 'Unexpected error loading dependencies')
  }

  private async withLoading (
    cb: () => Promise<void>,
    err_msg: string = 'Unexpected error!',
    err_cb?: (err: any) => void,
  ) {
    if(this.state.loading) {
      return
    }

    await this.setLoading(true)
    await cb().catch((e: any) => {
      Logger.error(err_msg, e)
      err_cb?.(e)
    })

    await this.setLoading(false)
  }

  private async setDependencyProvider (provider: DependencyProvider) {
    const capabilities = {
      deleteDependency: !!provider.deleteDependency,
      upgradeDependency: !!provider.upgradeDependency,
      upgradeAllDependencies: !!provider.upgradeAllDependencies,
      explicitNeedsUpgrade: await provider.explicitNeedsUpgrade?.() ?? false
    }

    await this.updateState('capabilities', capabilities)

    this.activeProvider?.dispose()
    this.activeProvider = provider
  }

  private async setLoading (loading: boolean) {
    await this.updateState('loading', loading)
    this.broadcast({ loading })
  }

  async updateState <T extends keyof State = keyof State>(prop: T, val: State[T], broadcastState?: boolean) {
    if (!(
      typeof val !== 'undefined' &&
      typeof this._state[prop] !== 'undefined' &&
      hash(this._state[prop] as any) === hash(val as any)
    )) {
      if(prop === 'event' && val && Object.keys(val).length > 0) {
        this.handleEvent(val as EventsObj)
      }
    }

    super.updateState(prop, val, broadcastState)
  }
}

export function activate (context: vscode.ExtensionContext) {
  const stateManager = new DependenciesExtensionManager(context)

  return {
    marquee: {
      disposable: stateManager,
      defaultState: stateManager.state,
      defaultConfiguration: stateManager.configuration,
      setup: stateManager.setBroadcaster.bind(stateManager)
    }
  }
}
