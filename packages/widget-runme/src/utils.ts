import path from 'path'
import vscode from 'vscode'
import { Logger }  from '@vscode-marquee/utils/extension'
import type { Workspace } from '@vscode-marquee/utils'

export function mapGitIgnoreToGlobFolders (gitignoreContents: string[]): Array<string | undefined> {
  const entries = gitignoreContents
    .filter((entry: string) => entry)
    .map((entry: string) => entry.replace(/\s/g, ''))
    .map((entry: string) => {
      if (entry) {
        let firstChar = entry.charAt(0)
        if (firstChar === '!' || firstChar === '/') {
          entry = entry.substring(1, entry.length)
          firstChar = entry.charAt(0)
        }
        const hasExtension = path.extname(entry)
        const slashPlacement = entry.charAt(entry.length - 1)
        if (slashPlacement === '/') {
          return `**/${entry}**`
        }
        if (hasExtension || ['.', '*', '#'].includes(firstChar)) {
          return
        }
        return `**/${entry}/**`
      }
    }).filter((entry: string | undefined) => entry)

  return [...new Set(entries)]
}

export async function getExcludePattern (aws: Workspace | null) {
  let excludePatterns = ''

  if (!aws) {
    return excludePatterns
  }

  const gitIgnoreUri = vscode.Uri.joinPath(vscode.Uri.parse(aws.path), '.gitignore')
  try {
    const gitignoreStat = await vscode.workspace.fs.stat(gitIgnoreUri)
    if (gitignoreStat.type === vscode.FileType.File) {
      const ignoreList = await vscode.workspace.openTextDocument(gitIgnoreUri)
      const patterns = mapGitIgnoreToGlobFolders(ignoreList.getText().split('\n'))
      excludePatterns = patterns.join(',')
    }
  } catch (err: unknown) {
    Logger.warn(`Failed to detect or load .gitignore file: ${(err as Error).message}`)
  }

  return excludePatterns
}
