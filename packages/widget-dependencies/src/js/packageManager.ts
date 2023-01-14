import type { PackageJSON } from 'query-registry'
import vscode  from 'vscode'
import type { 
  JsPackageManager, 
  LocalJsPackage, 
  LocalJsProjects, 
  NPMOutdatedColumn, 
  NPMOutdatedData, 
  NPMOutdatedInfo 
} from './types'

declare const IS_WEB_BUNDLE: boolean

export async function tryGetPackageJson (
  uri: vscode.Uri,
): Promise<PackageJSON|undefined> {
  const pkgJsonPath = vscode.Uri.joinPath(uri, 'package.json')
    
  let file: string

  try {
    const rawBytes = (await vscode.workspace.fs.readFile(pkgJsonPath))
    // buffer.toString() not supported on web
    file = IS_WEB_BUNDLE ? new TextDecoder().decode(rawBytes) : rawBytes.toString()
  } catch(e) {
    // no package.json found
    return undefined
  }

  let pkgJson: PackageJSON

  try {
    pkgJson = JSON.parse(file)
  } catch(e) {
    throw new Error('Unable to serialize package.json')
  }

  if (typeof pkgJson !== 'object' 
    || typeof pkgJson.name !== 'string'
    || typeof pkgJson.version !== 'string'
  ) { 
    throw new Error('Invalid package.json')
  }

  return pkgJson
}

export async function tryGetJsProject (
  uri: vscode.Uri,
  parent?: LocalJsPackage,
  prefersPnpm?: boolean,
): Promise<LocalJsPackage|undefined> {
  const pkgJson = await tryGetPackageJson(uri)
  if(!pkgJson) { return undefined }

  const repositoryUrl = typeof pkgJson.repository === 'string' && pkgJson.repository
  const workspaces = pkgJson.workspaces as string[]|{ projects: string[] }|undefined

  const pkg: LocalJsPackage = {
    name: pkgJson.name,
    version: pkgJson.version,
    dependencies: {},
    isWorkspace: !!parent,
    workspaces: Array.isArray(workspaces) ? workspaces : workspaces?.projects,
    uri,
    manager: parent?.manager ?? await getPackageManager(uri, prefersPnpm),
    homepage: pkgJson.homepage,
    repository: repositoryUrl || undefined
  }

  const dependenciesZipped = [
    ...Object.entries(pkgJson.dependencies ?? {}).map(pkg => ([pkg, 'normal'] as const)),
    ...Object.entries(pkgJson.devDependencies ?? {}).map(pkg => ([pkg, 'dev'] as const))
  ]

  await Promise.all(
    dependenciesZipped.map(async ([[name, version], dependencyType]) => {
      const localJson = await tryGetPackageJson(
        vscode.Uri.joinPath(pkg.uri, 'node_modules', ...name.split('/'))
      ) ?? (parent && await tryGetPackageJson(
        vscode.Uri.joinPath(parent.uri, 'node_modules', ...name.split('/'))
      ))

      const repo = typeof localJson?.repository === 'string' ? localJson?.repository : undefined

      pkg.dependencies[name] = {
        name,
        packageVersion: version,
        actualVersion: localJson?.version,
        dependencyType,
        homepage: localJson?.homepage,
        repository: repo
      }
    })
  )

  return pkg

  async function getPackageManager (
    uri: vscode.Uri,
    prefersPnpm?: boolean,
  ): Promise<JsPackageManager> {
    try {
      await vscode.workspace.fs.stat(vscode.Uri.joinPath(uri, 'yarn.lock'))
      return 'yarn'
    } catch(e) { }

    return prefersPnpm ? 'pnpm' : 'npm'
  }
}

export async function findWorkspaces (
  rootProject: LocalJsPackage,
): Promise<LocalJsProjects> {
  const projects: LocalJsProjects = {
    [rootProject.name]: rootProject,
  }

  // apply glob patterns in workspaces
  const candidateUris = (await Promise.all(
    rootProject.workspaces?.map(workspacePath => 
      vscode.workspace.findFiles(
        new vscode.RelativePattern(rootProject.uri, workspacePath)
      )
    ) ?? []
  )).flatMap(x => x)
  
  // filter for only the folders, and add to projects
  await Promise.all(
    candidateUris.map(async (relativeUri) => {
      const uri = vscode.Uri.joinPath(rootProject.uri, relativeUri.fsPath)

      const { type } = await vscode.workspace.fs.stat(uri)

      if(type !== vscode.FileType.Directory) { return }

      const pkg = await tryGetJsProject(uri, rootProject)
      if(!pkg) { return }

      projects[pkg.name] = pkg
    })
  )

  return projects
}

export async function packageManagerCmdOutdated (
  pkg: LocalJsPackage,
): Promise<NPMOutdatedInfo[]|undefined> {
  const output = await packageManagerCmd(
    pkg, 
    'outdated',
    '--json',
  )

  if(!output) { return undefined }

  const lines = output.split('\n')

  const table = lines
    .find((line) => {
      try {
        const json = JSON.parse(line)
        return json.type === 'table'
      } catch(e) {
        return false
      }
    })
  
  if(!table) { return undefined }

  let data: NPMOutdatedData

  try {
    data = JSON.parse(table).data
  } catch(e) {
    return undefined
  }

  // invert header
  const idxMap = data.head.reduce(
    (prev, col, i) => {
      prev[col] = i
      return prev
    }, 
    {} as Record<NPMOutdatedColumn, number>
  )

  // Need packageId
  if(!('Package' in idxMap)) {
    return undefined
  }

  const fromRow = (from: string[], col: NPMOutdatedColumn) => {
    if (col in idxMap) { 
      return from[idxMap[col]] 
    }

    return undefined
  }

  return data.body.map(row => ({
    packageId: fromRow(row, 'Package')!,
    current: fromRow(row, 'Current'),
    latest: fromRow(row, 'Latest'),
    packageType: fromRow(row, 'Package Type') as NPMOutdatedInfo['packageType'],
    url: fromRow(row, 'URL'),
    wanted: fromRow(row, 'Wanted'),
    workspace: fromRow(row, 'Workspace')
  }))
}

export async function packageManagerCmd (
  pkg: LocalJsPackage,
  ...args: string[]
): Promise<string|undefined> {
  if(IS_WEB_BUNDLE) { return undefined }

  const { exec } = require('child_process') as typeof import('node:child_process')
  
  return await new Promise<string|undefined>((res, rej) => {
    const proc = exec(
      [pkg.manager, ...args].join(' '),
      { cwd: pkg.uri.fsPath },
      (err,stdout,stderr) => {
        if(stdout) {
          res(stdout)
        }

        if(err) {
          rej(err)
        }

        if(stderr) {
          rej(stderr)
        }
      }
    )

    proc.on('close', () => res(undefined))
  })
}