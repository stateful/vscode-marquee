import { jumpTo } from '../../src/components/utils'

test('jumpTo', () => {
  const window = { vscode: { postMessage: jest.fn() } }
  jumpTo({ foo: 'bar' }, window as any)
  expect(window.vscode.postMessage.mock.calls).toMatchSnapshot()
})
