import { activate } from '../src/extension'

test('returns proper interface', () => {
  const context = {
    globalState: {
      get: jest.fn().mockReturnValue({})
    }
  }
  const exp = activate(context as any)
  expect(Object.keys(exp.marquee)).toEqual(
    ['disposable', 'defaultState', 'defaultConfiguration', 'setup']
  )
})

test('should upgrade config from v2 to v3', () => {
  const context = {
    globalState: {
      get: jest.fn().mockReturnValue({
        scale: { name: 'fahrenheit', value: 'fahrenheit' }
      })
    }
  }
  const exp = activate(context as any)
  expect(exp.marquee.disposable.updateConfiguration)
    .toBeCalledWith('scale', 'Fahrenheit')
})
