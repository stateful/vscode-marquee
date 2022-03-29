import { getVSColor } from '../src/utils'

test('getVSColor', () => {
  expect(getVSColor()).toEqual({ r: 0, g: 0, b: 0, a: 0.8 })
  document.documentElement.style
    .setProperty('--vscode-sideBar-background', '#ff0000')
  process.env.NODE_ENV = '_test_'
  expect(getVSColor()).toEqual({ r: 255, g: 0, b: 0, a: 0.8 })
})

afterEach(() => {
  process.env.NODE_ENV = 'test'
})
