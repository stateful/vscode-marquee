import type vscode from 'vscode'
import type { DependencyType } from 'src/types'

export type JsPackageManager = 'npm'|'yarn'|'pnpm'

export interface JsPackageDependency {
  name: string
  dependencyType?: DependencyType
  /**
   * Query version in package.json
   */
  packageVersion: string
  /**
   * Version in node_modules
   */
  actualVersion?: string
  homepage?: string
  repository?: string
}

export interface LocalJsPackage extends JsPackageMeta {
  isWorkspace?: boolean
  name: string
  version: string
  dependencies: Record<string, JsPackageDependency>
  uri: vscode.Uri
  workspaces?: string[]
  manager: JsPackageManager
}

export type LocalJsProjects = Record<string, LocalJsPackage>

export type RemoteRegistry = Record<string, JsPackageMeta>

export interface JsPackageMeta {
  latestVersion?: string
  homepage?: string
  repository?: string
}

export interface NPMOutdatedInfo {
  packageId: string
  current?: string
  wanted?: string
  latest?: string
  workspace?: string
  packageType?: 'devDependencies'|'dependencies'
  url?: string
}

export type NPMOutdatedHead = (
  | 'Package'
  | 'Current'
  | 'Wanted'
  | 'Latest'
  | 'Workspace'
  | 'Package Type'
  | 'URL'
)[]

export type NPMOutdatedColumn = NPMOutdatedHead[number]

export interface NPMOutdatedData {
  body: string[][]
  head: NPMOutdatedHead
}