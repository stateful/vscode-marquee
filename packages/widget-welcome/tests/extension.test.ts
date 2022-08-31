import Axios from 'axios'
import vscode from 'vscode'
import { activate } from '../src/extension'

jest.mock('axios-retry', () => jest.fn().mockReturnValue(Promise.resolve(Axios)))

jest.mock('axios', () => ({
  get: jest.fn().mockResolvedValue({ data: [] }),
  post: jest.fn().mockResolvedValue({ data: [] })
}))

test('should return expected interface', async () => {
  const tangle: any = {
    on: jest.fn(),
    emit: jest.fn(),
    broadcast: jest.fn(),
    listen: jest.fn().mockReturnValue({ unsubscribe: jest.fn() }),
    whenReady: jest.fn().mockReturnValue(Promise.resolve()),
    removeAllListeners: jest.fn()
  }
  const context = { globalState: new Map() }
  // @ts-expect-error
  context.globalState.setKeysForSync = jest.fn()
  context.globalState.set('persistence', {})
  const result = activate(context as any)

  expect(result.marquee).toBeTruthy()
  result.marquee.setup(tangle)

  expect(Axios.get).toBeCalledWith('http://test/getTricks', {})
  expect(tangle.on).toBeCalledWith('upvote', expect.any(Function))

  const upvoteTrick = tangle.on.mock.calls.pop().pop()
  const config = vscode.workspace.getConfiguration()
  config.set('configuration', { proxy: 'http://someproxy:8080' })
  upvoteTrick(100)
  expect(Axios.post).toBeCalledWith('http://test/voteTrick', {
    id: 100,
    op: 'upvote'
  }, {
    proxy: {
      protocol: 'http:',
      host: 'someproxy',
      port: 8080,
      auth: { username: '', password: '' }
    }
  });

  (Axios.post as jest.Mock).mockRejectedValue(new Error('ups'))
  upvoteTrick(100)
  await new Promise((resolve) => setTimeout(resolve, 100))
  expect(vscode.window.showErrorMessage)
    .toBeCalledWith('Failed to upvote trick!', 'ups')

  result.marquee.disposable.emit = jest.fn();
  (Axios.get as jest.Mock).mockResolvedValue({
    data: [{
      notify: true,
      active: true,
      title: 'foobar'
    }]
  })
  result.marquee.disposable.fetchData()
  await new Promise((resolve) => setTimeout(resolve, 100))
  expect(vscode.window.showInformationMessage).toBeCalledWith('foobar', 'Learn more')
  expect(result.marquee.disposable.emit).toBeCalledWith('gui.open');

  (Axios.get as jest.Mock).mockRejectedValue(new Error('ups'))
  result.marquee.disposable.fetchData()
  await new Promise((resolve) => setTimeout(resolve, 100))
  expect((result.marquee.disposable.broadcast as jest.Mock).mock.calls)
    .toMatchSnapshot()
})
