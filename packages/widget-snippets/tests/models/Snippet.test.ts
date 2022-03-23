import path from 'path';
import Snippet from '../../src/models/Snippet';

describe('Snippet', () => {
  it('can be created with defaults', () => {
    const s = new Snippet();
    expect(s.workspaceId).toBe(null);
    expect(s.title).toBe('New Snippet');
    expect(s.path).toBe(path.sep + path.join('39d2f858-3522-4053-beb8-b75a1defd1d2', 'New Snippet'));
  });

  it('can be created from snippet object', () => {
    const s = Snippet.fromObject({
      id: 'foobar',
      title: 'title',
      archived: false,
      body: 'some body',
      workspaceId: null,
      createdAt: 123
    });
    delete s.path
    expect(s).toMatchSnapshot();
    expect(s.data).toMatchSnapshot();
  });
});
