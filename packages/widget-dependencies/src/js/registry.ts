import { getFetch, urlJoin } from '../util'
import { RawPackument } from '../types'
import { DEFAULT_JS_REGISTRY } from '../constants'
import { LocalJsProjects, RemoteRegistry } from './types'
import { Logger } from '@vscode-marquee/utils/build/logger'

/**
 * Go through project/workspaces and pull package metadata for each dependency
 * from npm/remote registry provided by `registryUrl`
 */
export async function pullRemoteRegistry (
  projects: LocalJsProjects,
  registryUrl?: string
): Promise<RemoteRegistry> {
  const registry: RemoteRegistry = {}
  
  await Promise.all(
    Object.values(projects)
      .flatMap(repo => Object.values(repo.dependencies).map(async dep => {
        if(!projects[dep.name]) {
          const packument = await getRawPackument(dep.name, registryUrl)
          if(!packument) { return } // package does not exist
          
          const { versions, homepage, repository } = packument

          const version = packument['dist-tags'].latest

          const latest = versions[version]
          if(!latest) { return } // package has no releases

          const repositoryUrl = typeof repository === 'string' && repository

          registry[dep.name] = { 
            latestVersion: latest.version,
            homepage,
            repository: repositoryUrl || undefined
          }
        } else {
          registry[dep.name] = projects[dep.name]
        }
      }))
  )

  return registry
}

export async function getRawPackument (
  packageId: string, 
  registry: string|undefined
): Promise<RawPackument|undefined> {
  registry ||= DEFAULT_JS_REGISTRY
  const url = urlJoin(registry, packageId)

  const fetch = getFetch()

  return await fetch(url)
    .then(res => res.json() as Promise<RawPackument>)
    .catch((e) => { 
      Logger.error('Failed to fetch package', e)
      return undefined
    })
}