import vscode from 'vscode'
import { ChildProcess, exec } from 'child_process'
import projects from './projects'

import {
  tryGetJsProject,
  tryGetPackageJson,
  findWorkspaces,
  packageManagerCmd,
} from '../../src/js/packageManager'

jest.mock('vscode', () => jest.requireActual('../vscodeFsMock.ts'))

jest.mock('child_process', () => ({
  exec: jest.fn()
}))

test('tryGetJsProject', async () => {
  const jsProject = await tryGetJsProject(
    vscode.Uri.file(projects.yarn)
  )

  expect(jsProject).toBeTruthy()
  expect(jsProject!.manager).toBe('yarn')
  expect(Object.keys(jsProject!.dependencies)).toHaveLength(5)

  expect(jsProject).toMatchSnapshot()
})

test('tryGetPackageJson', async () => {
  const packageJson = await tryGetPackageJson(
    vscode.Uri.file(projects.yarn)
  )

  expect(packageJson).toBeTruthy()
  expect(packageJson!.version).toBe('1.0.0')

  expect(packageJson).toMatchSnapshot()
})

test('findWorkspaces', async () => {
  const rootProject = await tryGetJsProject(
    vscode.Uri.file(projects.yarnWorkspaces)
  )

  expect(rootProject).toBeTruthy()

  const workspaces = await findWorkspaces(rootProject!)

  expect(workspaces).toBeTruthy()

  const workspaceNames = Object.keys(workspaces)

  expect(workspaceNames).toHaveLength(4)

  expect(workspaceNames.includes('yarn-project-workspace')).toBeTruthy()
  expect(workspaceNames.includes('yarn-project-workspace-package1')).toBeTruthy()
  expect(workspaceNames.includes('yarn-project-workspace-package2')).toBeTruthy()
  expect(workspaceNames.includes('yarn-project-workspace-package3')).toBeTruthy()
})

describe('packageManagerCmd', () => {
  test('caches result', async () => {
    jest.mocked(exec).mockImplementation((command, opts, callback) => {
      callback?.(null, command, '')
      return { on: jest.fn() } as unknown as ChildProcess
    })

    const pkg = await tryGetJsProject(
      vscode.Uri.file(projects.yarn)
    )

    expect(pkg).toBeTruthy()

    expect(await packageManagerCmd(pkg!, 'test', 'command')).toEqual('yarn test command')
    expect(await packageManagerCmd(pkg!, 'test', 'command')).toEqual('yarn test command')

    expect(jest.mocked(exec)).toBeCalledTimes(1)
  })

  test('caches separate packages separately', async () => {
    jest.mocked(exec).mockImplementation((command, opts, callback) => {
      callback?.(null, command, '')
      return { on: jest.fn() } as unknown as ChildProcess
    })

    {
      const pkg = await tryGetJsProject(
        vscode.Uri.file(projects.yarn)
      )

      expect(pkg).toBeTruthy()

      expect(await packageManagerCmd(pkg!, 'test', 'command')).toEqual('yarn test command')
      expect(await packageManagerCmd(pkg!, 'test', 'command')).toEqual('yarn test command')
    }

    {
      const pkg = await tryGetJsProject(
        vscode.Uri.file(projects.yarnWorkspaces)
      )

      expect(pkg).toBeTruthy()

      expect(await packageManagerCmd(pkg!, 'test', 'command')).toEqual('yarn test command')
      expect(await packageManagerCmd(pkg!, 'test', 'command')).toEqual('yarn test command')
    }

    expect(jest.mocked(exec)).toBeCalledTimes(2)
  })
})
