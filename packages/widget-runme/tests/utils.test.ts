import vscode from 'vscode'
import { mapGitIgnoreToGlobFolders, getExcludePattern } from '../src/utils'

const gitignore = `dist
out
node_modules
.vscode-test/
*.vsix
.DS_Store
*.log
packages/**/build
website/public/*.js
website/public/*.js.map`

test('mapGitIgnoreToGlobFolders', () => {
  expect(mapGitIgnoreToGlobFolders([
    'dist',
    'out',
    'node_modules',
    '.vscode-test/',
    '*.vsix',
    '.DS_Store',
    '*.log',
    'packages/**/build',
    'website/public/*.js',
    'website/public/*.js.map'
  ])).toMatchSnapshot()
})

test('getExcludePattern', async () => {
  expect(await getExcludePattern(null)).toBe('')
  expect(await getExcludePattern({ path: '/foo/bar' } as any)).toEqual('')
  ;(vscode.workspace.fs.stat as jest.Mock).mockResolvedValue({ type: 3 })
  ;(vscode.workspace.openTextDocument as jest.Mock).mockResolvedValue({
    getText: jest.fn().mockReturnValue(gitignore)
  })
  expect(await getExcludePattern({ path: '/foo/bar' } as any)).toEqual('')
  ;(vscode.workspace.fs.stat as jest.Mock).mockResolvedValue({ type: '1' })
  expect(await getExcludePattern({ path: '/foo/bar' } as any)).toMatchSnapshot()
})
