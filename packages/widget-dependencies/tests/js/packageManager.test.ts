import vscode from 'vscode'
import projects from './projects'

import { 
  tryGetJsProject,
  tryGetPackageJson,
  findWorkspaces,
} from '../../src/js/packageManager'

jest.mock('vscode', () => jest.requireActual('../vscodeFsMock.ts'))

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