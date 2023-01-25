import type { ContextProperties } from '@vscode-marquee/utils'
import type vscode from 'vscode'
export type { RawPackument } from 'query-registry'

export interface State {
  dependencies: DisplayedDependency[]
  loading: boolean
  capabilities: DependencyProviderCapabilities
  event: (EventsObj & { id: EventId }) | {}
}

export interface Configuration {
  /* General */
  showUpToDate: boolean
  autoRefresh: boolean

  /* JS */
  jsRegistry: string
  prefersPnpm: boolean
}

export interface Events {
  refreshDependencies: {}
  updateDependency: { packageId: string, toVersion: string, workspace?: string }
  updateAllDependencies: {}
  removeDependency: { packageId: string, workspace?: string, isRootWorkspace: boolean }
}

export interface Context extends ContextProperties<Configuration & State> {
  _refreshDependencies(): void
  _updateDependency(dep: DisplayedDependency, toVersion: string): void
  _updateAllDependencies(): void
  _removeDependency(dep: DisplayedDependency): void
}

export interface DependencyProvider extends vscode.Disposable {
  loadDependencies(): Promise<DisplayedDependency[]|undefined>

  upgradeDependency?: (
    packageId: string,
    upgradeTo: string,
    workspace: string|undefined
  ) => Promise<void>

  upgradeAllDependencies?: () => Promise<void>

  deleteDependency?: (
    packageId: string,
    workspace: string|undefined,
    isRootWorkspace: boolean
  ) => Promise<void>

  /**
   * Whether or not this provider explicitly sets if this dependency needs
   * an upgrade via the `needsUpgrade` prop of `DisplayedDependency`
   *
   * If this is false, the client determines whether a package needs an update
   * by comparing the current and latest semantic versions
   */
  explicitNeedsUpgrade?: () => Promise<boolean>
}

export interface TerminalProvider extends vscode.Disposable {
  getOrCreateTerminal(cwd: vscode.Uri): vscode.Terminal
}

export type DependencyType = 'normal'|'dev'

export interface DisplayedDependency {
  name: string

  versions: {
    current?: string
    wanted?: string
    latest?: string
    query?: string
  },

  project?: string

  isRootWorkspace: boolean

  dependencyType?: DependencyType

  url?: string

  needsUpgrade?: boolean
}

export interface DependencyProviderCapabilities {
  deleteDependency: boolean
  upgradeDependency: boolean
  upgradeAllDependencies: boolean
  explicitNeedsUpgrade: boolean
}

export type EventsObj<K extends keyof Events = keyof Events>
  = K extends string ? { type: K, payload: Events[K] } : never

export type EventId = number
