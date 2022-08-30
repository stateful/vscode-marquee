import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import vscode from 'vscode'

export default class Snippet implements vscode.FileStat {
  type: vscode.FileType = vscode.FileType.File
  size: number
  storagePath: string
  path?: string
  origin?: string
  ctime: number
  mtime: number

  constructor (
    public workspaceId: string | null = null,
    public title = 'New Clipboard Item',
    public body = '',
    public archived = false,
    public createdAt = Date.now(),
    public id = uuidv4(),
    public branch?: string,
    public commit?: string,
    public gitUri?: string,
    snippetPath?: string
  ) {
    this.type = vscode.FileType.File
    this.size = body.length
    this.storagePath = path.join(`/${id}`, snippetPath ? path.basename(snippetPath) : title)
    this.path = snippetPath
    this.origin = snippetPath
    this.ctime = this.createdAt
    this.mtime = this.createdAt
  }

  static fromObject (s: Partial<Snippet>) {
    const snippet = new Snippet(s.workspaceId, s.title, s.body, s.archived, s.createdAt, s.id, s.origin)
    return snippet
  }

  get data () {
    const enc = new TextEncoder()
    return enc.encode(this.body)
  }
}
