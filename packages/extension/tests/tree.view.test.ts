import { TreeView } from '../src/tree.view'

const context = {} as any
const stateMgr = {
  todoWidget: { on: jest.fn () },
  snippetsWidget: { on: jest.fn () },
  notesWidget: { on: jest.fn () },
  global: { on: jest.fn (), updateState: jest.fn(), state: { globalScope: true } },
  projectWidget: { getActiveWorkspace: jest.fn().mockReturnValue({ id: '123' })}
} as any

beforeEach(() => {
  context.subscriptions = []
  context.globalState = { get: jest.fn((key: string, defaultParam: any) => defaultParam) }
  context.extensionUri = '/foo/bar'
  stateMgr.handleUpdates = jest.fn()
  stateMgr.recover = jest.fn().mockReturnValue({
    globalScope: true
  })
  stateMgr.getActiveWorkspace = jest.fn()
  stateMgr.save = jest.fn()
})

describe('TreeView', () => {
  test('constructor', () => {
    jest.spyOn(TreeView.prototype, 'update' as any)
      .mockImplementation(() => ({} as any))
    const tree = new TreeView(context as any, stateMgr)
    expect(context.subscriptions).toEqual(['marquee.toggleScope'])
    expect(tree['update']).toBeCalledTimes(1)
  })

  test('clearTree', () => {
    jest.spyOn(TreeView.prototype, 'update' as any)
      .mockImplementation(() => ({} as any))
    const tree = new TreeView(context as any, stateMgr)
    tree.clearTree()
    expect(tree['state']).toMatchSnapshot()
  })

  test('toggleScope', () => {
    jest.spyOn(TreeView.prototype, 'update' as any)
      .mockImplementation(() => ({} as any))
    const tree = new TreeView(context as any, stateMgr)
    tree.toggleScope()
    expect(tree['stateMgr'].global.updateState).toBeCalledWith('globalScope', false)
    expect(tree['update']).toBeCalledTimes(2)
  })

  test('_updateTodos', () => {
    jest.spyOn(TreeView.prototype, 'update' as any)
      .mockImplementation(() => ({} as any))
    const tree = new TreeView(context as any, stateMgr)
    tree['_updateTodos']({} as any, true)
    expect(tree['state'].todos).toHaveLength(0)

    context.globalState.get.mockReturnValue({
      todos: [{ workspaceId: '123' }, { workspaceId: '321' }]
    })
    tree['_updateTodos']({ id: '321' } as any, true)
    expect(tree['toplevel']).toMatchSnapshot()
    expect(tree['state'].todos).toMatchSnapshot()
  })

  test('_updateNotes', () => {
    jest.spyOn(TreeView.prototype, 'update' as any)
      .mockImplementation(() => ({} as any))
    const tree = new TreeView(context as any, stateMgr)
    tree['_updateNotes']({} as any, true)
    expect(tree['state'].notes).toHaveLength(0)

    context.globalState.get.mockReturnValue({
      notes: [{ workspaceId: '123' }, { workspaceId: '321' }]
    })
    tree['_updateNotes']({ id: '321' } as any, true)
    expect(tree['toplevel']).toMatchSnapshot()
    expect(tree['state'].notes).toMatchSnapshot()
  })

  test('_updateSnippets', () => {
    jest.spyOn(TreeView.prototype, 'update' as any)
      .mockImplementation(() => ({} as any))
    const tree = new TreeView(context as any, stateMgr)
    tree['_updateSnippets']({} as any, true)
    expect(tree['state'].snippets).toHaveLength(0)

    context.globalState.get.mockReturnValue({
      snippets: [{ workspaceId: '123' }, { workspaceId: '321' }]
    })
    tree['_updateSnippets']({ id: '321' } as any, true)
    expect(tree['toplevel']).toMatchSnapshot()
    expect(tree['state'].snippets).toMatchSnapshot()
  })

  test('update', () => {
    jest.spyOn(TreeView.prototype, 'refresh' as any)
      .mockImplementation(() => ({} as any))
    const tree = new TreeView(context as any, stateMgr)
    context.globalState.get.mockReturnValue({
      globalScope: true
    })
    tree['_updateTodos'] = jest.fn()
    tree['_updateNotes'] = jest.fn()
    tree['_updateSnippets'] = jest.fn()
    tree['refresh'] = jest.fn()

    tree['update']()
    expect(tree['_updateTodos']).toBeCalledWith({ id: '123' }, true)
    expect(tree['_updateNotes']).toBeCalledWith({ id: '123' }, true)
    expect(tree['_updateSnippets']).toBeCalledWith({ id: '123' }, true)
    expect(tree['refresh']).toBeCalledTimes(1)
  })

  test('refresh', () => {
    jest.spyOn(TreeView.prototype, 'update' as any)
      .mockImplementation(() => ({} as any))
    const tree = new TreeView(context as any, stateMgr)
    // @ts-expect-error
    tree['_onDidChangeTreeData'] = { fire: jest.fn() } as any
    tree.refresh()
    expect(tree['_onDidChangeTreeData'].fire).toBeCalledWith(undefined)
  })

  test('getChildren', async () => {
    jest.spyOn(TreeView.prototype, 'update' as any)
      .mockImplementation(() => ({} as any))
    const tree = new TreeView(context as any, stateMgr)
    tree['refresh'] = jest.fn()
    tree['update']()

    const elems = await tree.getChildren()
    expect(elems).toMatchSnapshot()

    const todos = await tree.getChildren(elems[0])
    expect(todos).toMatchSnapshot()

    const snippets = await tree.getChildren(elems[1])
    expect(snippets).toMatchSnapshot()

    const notes = await tree.getChildren(elems[2])
    expect(notes).toMatchSnapshot()
  })

  test('getTreeItem', () => {
    jest.spyOn(TreeView.prototype, 'update' as any)
      .mockImplementation(() => ({} as any))
    const tree = new TreeView(context as any, stateMgr)
    expect(tree.getTreeItem('foo' as any)).toBe('foo')
  })

  test('getParent', () => {
    jest.spyOn(TreeView.prototype, 'update' as any)
      .mockImplementation(() => ({} as any))
    const tree = new TreeView(context as any, stateMgr)
    expect(tree.getParent()).toBe(null)
  })
})