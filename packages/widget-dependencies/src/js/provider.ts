import vscode from 'vscode'
import { pullRemoteRegistry } from './registry'
import { findWorkspaces, packageManagerCmdOutdated, tryGetJsProject } from './packageManager'
import type { JsPackageManager, LocalJsPackage } from './types'
import type { Configuration, DependencyProvider, DisplayedDependency, TerminalProvider } from '../types'
import { Logger } from '@vscode-marquee/utils/build/logger'

declare const IS_WEB_BUNDLE: boolean

export class JsDependencyProvider implements DependencyProvider {
  private packageManager: JsPackageManager = 'npm'
  private disposables: vscode.Disposable[] = []
  private cwd: vscode.Uri|undefined

  constructor (
    private readonly config: Configuration,
    private terminalProvider: TerminalProvider,
    refreshDependencies: () => void,
  ) {
    const watcher = vscode.workspace.createFileSystemWatcher(
      '**/package.json'
    )

    this.disposables.push(
      watcher
    )

    this.disposables.push(
      watcher.onDidChange(() => {
        refreshDependencies()
      })
    )
  }

  async loadDependencies (): Promise<DisplayedDependency[]|undefined> {
    const pkg = await this.getPackageInfo()
    if(!pkg) { return undefined }

    const projects = await findWorkspaces(pkg)

    if (!IS_WEB_BUNDLE) {
      const data = await packageManagerCmdOutdated(pkg) ?? []

      const upgradeableDepMemo: Record<string, Set<string>|undefined> = {}

      const upgradeableDeps: DisplayedDependency[] = await Promise.all(data.map(
        async ({
          packageId,
          current,
          wanted,
          latest,
          workspace,
          packageType,
          url
        }) => {
          const workspaceId = workspace ?? pkg.name

          if(!upgradeableDepMemo[workspaceId]) {
            upgradeableDepMemo[workspaceId] = new Set()
          }

          upgradeableDepMemo[workspaceId]?.add(packageId)

          const hasWorkspaces = (pkg.workspaces?.length ?? 0) > 0

          return ({
            name: packageId,
            versions: {
              current,
              wanted,
              latest,
              query: pkg.dependencies[packageId]?.packageVersion
            },
            dependencyType: packageType === 'dependencies' ? 'normal'
              : packageType === 'devDependencies' ? 'dev'
                : undefined,
            project: workspace,
            url,
            needsUpgrade: true,
            isRootWorkspace: hasWorkspaces && (!workspace || workspace === pkg.name)
          })
        }
      ))

      const upToDateDeps = this.config.showUpToDate && Object.values(projects)
        .flatMap(repo =>
          Object.values(repo.dependencies)
            .filter(dep => !upgradeableDepMemo[repo.name]?.has(dep.name))
            .map(dep => {
              const hasWorkspaces = (repo.workspaces?.length ?? 0) > 0

              return ({
                name: dep.name,
                versions: {
                  current: dep.actualVersion,
                  query: dep.packageVersion,
                  latest: dep.actualVersion,
                },
                ...repo.isWorkspace && { project: repo.name },
                dependencyType: dep.dependencyType,
                url: dep.homepage ?? dep.repository,
                isRootWorkspace: hasWorkspaces
              })
            })
        )

      return [
        ...upgradeableDeps,
        ...upToDateDeps || []
      ]
    } else {
      const remoteRegistry = await pullRemoteRegistry(projects, this.config.jsRegistry)

      return Object.values(projects)
        .flatMap(
          repo =>
            Object.values(repo.dependencies)
              .filter(dep => dep.name in remoteRegistry)
              .map(dep => {
                const remoteDep = remoteRegistry[dep.name]!

                const hasWorkspaces = (repo.workspaces?.length ?? 0) > 0

                return ({
                  name: dep.name,
                  versions: {
                    current: dep.actualVersion,
                    query: dep.packageVersion,
                    latest: remoteDep.latestVersion ?? undefined,
                  },
                  ...repo.isWorkspace && { project: repo.name },
                  dependencyType: dep.dependencyType,
                  url: remoteDep.homepage ?? remoteDep.repository,
                  isRootWorkspace: hasWorkspaces
                })
              })
        )
    }
  }

  async upgradeDependency (
    packageId: string,
    toVersion: string,
    workspace: string|undefined
  ) {
    this.packageManagerCommand(
      ['upgrade', `${packageId}@${toVersion}`],
      workspace
    )
  }

  async upgradeAllDependencies () {
    this.packageManagerCommand(['upgrade'])
  }

  async deleteDependency (
    packageId: string,
    workspace: string|undefined,
    isRootWorkspace: boolean = false
  ) {
    this.packageManagerCommand(
      ['remove', packageId],
      workspace,
      isRootWorkspace
    )
  }

  async explicitNeedsUpgrade () {
    return !IS_WEB_BUNDLE
  }

  async getPackageInfo (): Promise<LocalJsPackage|undefined> {
    const { workspaceFolders } = vscode.workspace

    if(!workspaceFolders || workspaceFolders.length === 0) { return undefined }

    const workspacePath = workspaceFolders[0].uri
    const pkg = await tryGetJsProject(workspacePath, undefined, this.config.prefersPnpm)

    if(!pkg) { return undefined }

    this.packageManager = pkg.manager
    this.cwd = pkg.uri

    return pkg
  }

  packageManagerCommand (
    args: string[],
    workspace?: string,
    rootWorkspaceFlag = false
  ) {
    if(!this.cwd) {
      Logger.error('Cwd not set by JS provider!')
      return
    }

    args = [
      ...rootWorkspaceFlag ? ['-W'] : [],
      ...(workspace && !rootWorkspaceFlag) ? ['workspace', workspace] : [],
      ...args
    ]

    const terminal = this.terminalProvider.getOrCreateTerminal(this.cwd)

    terminal.sendText(
      [
        this.packageManager, ...args,
        '--cwd', this.cwd.fsPath
      ].join(' '),
      true
    )

    terminal.show(true)
  }

  dispose () {
    this.disposables.forEach(d => d.dispose())
  }
}
