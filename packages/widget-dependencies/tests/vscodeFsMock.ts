import nodeFs from 'fs/promises'
import path from 'path'
import glob from 'glob'
import vscodeTypes from 'vscode'

namespace vscode {
  type GlobPattern = string | RelativePattern
  
  export namespace workspace {
    export let workspaceFolders: vscodeTypes.WorkspaceFolder[]|undefined

    export const _fsWatcherChangeDispose = jest.fn()
    export const _fsWatcherChange = jest.fn(() => ({ dispose: _fsWatcherChangeDispose }))

    export const _fsWatcherDispose = jest.fn()

    export const createFileSystemWatcher = jest.fn(() => ({
      onDidChange: _fsWatcherChange,
      dispose: _fsWatcherDispose
    }))

    export function _setWorkspaceFolder (uri: vscodeTypes.Uri) {
      workspaceFolders = [
        {
          index: 0,
          name: '',
          uri
        }
      ]
    }
    
    export namespace fs {
      export async function readFile (uri: Uri) {
        return await nodeFs.readFile(uri.fsPath)
      }

      export async function stat (uri: Uri) {
        const stat = await nodeFs.stat(uri.fsPath)

        const type = stat.isFile() ? FileType.File :
          stat.isSymbolicLink() ? FileType.SymbolicLink :
            stat.isDirectory() ? FileType.Directory :
              FileType.Unknown
          
        return { type }
      }
    }
  
    export async function findFiles (pattern: GlobPattern) {
      const relativePattern = typeof pattern === 'object' ? pattern : new RelativePattern(undefined, pattern)

      return await relativePattern.run()
    }
  }

  export class RelativePattern {
    constructor (private base: Uri|undefined, private pattern: string) { }

    async run (): Promise<vscode.Uri[]> {
      return await new Promise<string[]>(
        (res, rej) => glob(this.pattern, { cwd: this.base?.fsPath }, (err, matches) => {
          if(err) { rej(err) }
          res(matches)
        }))
        .then(results => results.map(filePath => Uri.file(filePath)))
    }
  }

  export class Uri {
    private constructor (private filePath: string) { }

    static file (filePath: string): Uri {
      return new Uri(filePath)
    }

    static joinPath (uri: Uri, ...segments: string[]): Uri {
      return new Uri(path.join(uri.fsPath, ...segments))
    }

    get fsPath () {
      return this.filePath
    }

    toJSON () {
      // relative to root directory
      return path.relative(
        path.join(__dirname, '../../../'),
        this.fsPath
      )
    }
  }

  export enum FileType {
    /**
     * The file type is unknown.
     */
    Unknown = 0,
    /**
     * A regular file.
     */
    File = 1,
    /**
     * A directory.
     */
    Directory = 2,
    /**
     * A symbolic link to a file.
     */
    SymbolicLink = 64
  }
}

export default vscode
