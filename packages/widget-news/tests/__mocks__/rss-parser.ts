export default class RSSParserMock {
  public parseURL = jest.fn().mockResolvedValue({
    title: 'some rss feed',
    items: [
      { title: 'rss item 1' },
      { title: 'rss item 2' }
    ]
  })
}
