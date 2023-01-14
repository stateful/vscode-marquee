import type { Configuration, State } from './types'
import { JsDependencyProvider } from './js/provider'

export const DEFAULT_JS_REGISTRY = 'https://registry.npmjs.com/'

export const DEFAULT_CONFIGURATION: Configuration = {
  autoRefresh: true,
  showUpToDate: true,

  jsRegistry: DEFAULT_JS_REGISTRY,
  prefersPnpm: false
}

export const DEFAULT_STATE: State = {
  dependencies: [],
  capabilities: {
    deleteDependency: false,
    explicitNeedsUpgrade: false,
    upgradeAllDependencies: false,
    upgradeDependency: false
  },

  loading: false,

  event: {}
}

export const DependencyProviders = [
  JsDependencyProvider
]