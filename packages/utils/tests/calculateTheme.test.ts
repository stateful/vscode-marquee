import calculateTheme from '../src/calculateTheme'

test('calculateTheme', () => {
  expect(calculateTheme()).toMatchSnapshot()
})
