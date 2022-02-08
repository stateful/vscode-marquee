import { TreeView } from '../src/tree.view';

const context = {} as any;
const stateMgr = {} as any;

beforeEach(() => {
  context.subscriptions = [];
  context.extensionPath = '/foo/bar';
  stateMgr.handleUpdates = jest.fn();
  stateMgr.recover = jest.fn().mockReturnValue({
    globalScope: true
  });
  stateMgr.getActiveWorkspace = jest.fn();
  stateMgr.save = jest.fn();
});

describe('TreeView', () => {
  test('constructor', () => {
    jest.spyOn(TreeView.prototype, 'update' as any)
      .mockImplementation(() => ({} as any));
    const tree = new TreeView(context as any, {} as any);
    expect(context.subscriptions).toEqual(['marquee.toggleScope']);
    expect(tree['update']).toBeCalledTimes(1);
  });

  test('clearTree', () => {
    jest.spyOn(TreeView.prototype, 'update' as any)
      .mockImplementation(() => ({} as any));
    const tree = new TreeView(context as any, {} as any);
    expect(tree['update']).toBeCalledTimes(1);
    tree.clearTree();
    expect(tree['state']).toMatchSnapshot();
    expect(tree['update']).toBeCalledTimes(2);
  });

  test('update', () => {
    new TreeView(context as any, stateMgr);
    expect(stateMgr.handleUpdates).toBeCalledTimes(1);
  });

  test('handleStateManagerUpdates', () => {
    jest.spyOn(TreeView.prototype, 'update' as any)
      .mockImplementation(() => ({} as any));
    const tree = new TreeView(context as any, stateMgr);
    tree['refresh'] = jest.fn();
    tree['update']();
    expect(tree['state']).toMatchSnapshot();
    expect(tree['toplevel']).toMatchSnapshot();
    expect(tree['refresh']).toBeCalledTimes(1);
  });

  test('toggleScope', () => {
    jest.spyOn(TreeView.prototype, 'update' as any)
      .mockImplementation(() => ({} as any));
    const tree = new TreeView(context as any, stateMgr);
    tree.toggleScope();
    expect(tree['update']).toBeCalledTimes(2);

    const cb = (stateMgr.save as jest.Mock).mock.calls[0][0];
    expect(cb({ globalScope: true }))
      .toEqual({ globalScope: false });
  });

  test('refresh', () => {
    jest.spyOn(TreeView.prototype, 'update' as any)
      .mockImplementation(() => ({} as any));
    const tree = new TreeView(context as any, stateMgr);
    // @ts-expect-error
    tree['_onDidChangeTreeData'] = { fire: jest.fn() } as any;
    tree.refresh();
    expect(tree['_onDidChangeTreeData'].fire).toBeCalledWith(undefined);
  });

  test('getChildren', async () => {
    jest.spyOn(TreeView.prototype, 'update' as any)
      .mockImplementation(() => ({} as any));
    const tree = new TreeView(context as any, stateMgr);
    tree['refresh'] = jest.fn();
    tree['update']();

    const elems = await tree.getChildren();
    expect(elems).toMatchSnapshot();

    const todos = await tree.getChildren(elems[0]);
    expect(todos).toMatchSnapshot();

    const snippets = await tree.getChildren(elems[1]);
    expect(snippets).toMatchSnapshot();

    const notes = await tree.getChildren(elems[2]);
    expect(notes).toMatchSnapshot();
  });

  test('getTreeItem', () => {
    jest.spyOn(TreeView.prototype, 'update' as any)
      .mockImplementation(() => ({} as any));
    const tree = new TreeView(context as any, stateMgr);
    expect(tree.getTreeItem('foo' as any)).toBe('foo');
  });

  test('getParent', () => {
    jest.spyOn(TreeView.prototype, 'update' as any)
      .mockImplementation(() => ({} as any));
    const tree = new TreeView(context as any, stateMgr);
    expect(tree.getParent()).toBe(null);
  });
});
