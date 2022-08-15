import { GitProvider } from '../../src/provider/git'

describe('GitProvider', () => {
  it('can init', async () => {
    const git = new GitProvider({} as any)
    git.getBranch = jest.fn().mockReturnValue('some branch')
    git.getCommit = jest.fn().mockResolvedValue('some commit')
    git.getGitUri = jest.fn().mockResolvedValue('some git uri')

    await git.init()
    await new Promise((resolve) => setTimeout(resolve, 100))
    expect(git.branch).toBe('some branch')
    expect(git.commit).toBe('some commit')
    expect(git.gitUri).toBe('some git uri')
  })

  it('can get branch', async () => {
    const git = new GitProvider({} as any)
    expect(git.getBranch()).toBe(undefined)
    await git.init()
    await new Promise((resolve) => setTimeout(resolve, 100))
    expect(git.getBranch()).toBe('some name')
  })

  it('can get commit', async () => {
    const git = new GitProvider({} as any)
    expect(await git.getCommit()).toBe(undefined)
    await git.init()
    await new Promise((resolve) => setTimeout(resolve, 100))
    expect(await git.getCommit()).toBe('some hash')
  })

  it('can get git uri', async () => {
    const git = new GitProvider({} as any)
    expect(await git.getGitUri()).toBe(undefined)
    await git.init()
    await new Promise((resolve) => setTimeout(resolve, 100))
    expect(await git.getGitUri()).toBe('git@github.com:stateful/vscode-marquee.git')
  })
})
