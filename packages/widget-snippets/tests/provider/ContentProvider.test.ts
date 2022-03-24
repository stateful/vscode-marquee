import ContentProvider from '../../src/provider/ContentProvider'

test('ContentProvider', () => {
  const provider = new ContentProvider()
  expect(provider.provideTextDocumentContent()).toBe('')

  provider['_onDidChange'] = { dispose: jest.fn(), event: 'foobar' } as any
  provider.dispose()
  expect(provider['_onDidChange'].dispose).toBeCalledTimes(1)
  expect(provider.onDidChange).toBe('foobar')
})
