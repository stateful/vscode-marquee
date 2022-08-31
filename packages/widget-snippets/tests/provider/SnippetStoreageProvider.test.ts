import path from 'path'
import SnippetStorageProvider from '../../src/provider/SnippetStorageProvider'

const enc = new TextEncoder()

describe('SnippetStorageProvider', () => {
  it('should return disposable for watch', () => {
    const provider = new SnippetStorageProvider({} as any)
    expect(typeof provider.watch().dispose).toBe('function')
  })

  it('stat: new Snippet', () => {
    const provider = new SnippetStorageProvider({} as any, 'foobar')
    const s = provider.stat({ path: '/New Clipboard Item'} as any)
    expect(s.workspaceId).toBe('foobar')
  })

  it('stat: throws if snippet can not be found', () => {
    const snippets = [{ path: '/foo/bar' }, { path: '/bar/foo' }]
    const context = { globalState: { get: jest.fn().mockReturnValue({ snippets }) } }
    const provider = new SnippetStorageProvider(context as any)

    expect.assertions(1)
    try {
      provider.stat({ path: '/foobar' } as any)
    } catch (err: any) {
      expect(err.message).toContain('Couldn\'t find snippet')
    }
  })

  it('should be able to also find old snippet types', () => {
    const snippets = [{ path: 'Untitled:1:0', id: '12345' }, { path: '/bar/foo' }]
    const context = { globalState: { get: jest.fn().mockReturnValue({ snippets }) } }
    const provider = new SnippetStorageProvider(context as any)
    const s = provider.stat({ path: '/12345/Untitled:1:0' } as any)
    expect(s.id).toBe('12345')
  })

  it('stat: should return file stat', () => {
    const snippets = [{ path: '/foo/bar' }, { path: '/bar/foo', id: 'foobar' }]
    const context = { globalState: { get: jest.fn().mockReturnValue({ snippets }) } }
    const provider = new SnippetStorageProvider(context as any)
    const s = provider.stat({ path: '/bar/foo' } as any)
    expect(s.id).toBe('foobar')
  })

  it('getDirectory', () => {
    const snippets = [{ title: '/foo/bar' }, { title: '/bar/foo', id: 'foobar' }]
    const context = { globalState: { get: jest.fn().mockReturnValue({ snippets }) } }
    const provider = new SnippetStorageProvider(context as any)
    expect(provider.readDirectory()).toMatchSnapshot()
  })

  it('readFile', () => {
    const snippets = [{ path: '/bar/foo', id: 'foobar', body: 'foobar' }]
    const context = { globalState: { get: jest.fn().mockReturnValue({ snippets }) } }
    const provider = new SnippetStorageProvider(context as any)
    expect(provider.readFile({ path: '/bar/foo' } as any)).toMatchSnapshot()
  })

  it('writeFile: new snippet', async () => {
    const provider = new SnippetStorageProvider({} as any)
    provider.emit = jest.fn()

    await provider.writeFile({ path: '/New Clipboard Item' } as any, enc.encode('some text'))
    await new Promise((resolve) => setTimeout(resolve, 100))

    expect(provider.emit).toBeCalledWith('saveNewSnippet', {
      archived: false,
      body: '115,111,109,101,32,116,101,120,116',
      createdAt: expect.any(Number),
      ctime: expect.any(Number),
      id: '39d2f858-3522-4053-beb8-b75a1defd1d2',
      mtime: expect.any(Number),
      origin: undefined,
      path: undefined,
      storagePath: path.sep + path.join('39d2f858-3522-4053-beb8-b75a1defd1d2', 'some input'),
      size: 34,
      title: 'some input',
      type: '1',
      branch: undefined,
      commit: undefined,
      gitUri: undefined,
      workspaceId: null,
    })
  })

  it('writeFile: update snippet', async () => {
    const snippets = [{ path: '/bar/foo', id: 'foobar', body: 'foobar', title: 'some title' }]
    const context = { globalState: { get: jest.fn().mockReturnValue({ snippets }) } }
    const provider = new SnippetStorageProvider(context as any)

    provider.emit = jest.fn()
    await provider.writeFile({ path: '/bar/foo' } as any, enc.encode('some text'))
    await new Promise((resolve) => setTimeout(resolve, 100))

    expect(provider.emit).toBeCalledWith('updateSnippet', {
      archived: false,
      body: '115,111,109,101,32,116,101,120,116',
      createdAt: expect.any(Number),
      ctime: expect.any(Number),
      id: 'foobar',
      mtime: expect.any(Number),
      origin: undefined,
      path: undefined,
      storagePath: path.sep + path.join('foobar', 'some title'),
      size: 6,
      title: 'some title',
      type: '1',
      branch: undefined,
      commit: undefined,
      gitUri: undefined,
      workspaceId: null,
    })
  })
})
