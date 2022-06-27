import vscode from 'vscode'
import { activate } from '../src/extension'

test('should test something', async () => {
  // Todo(Christian): write tests
  activate({} as any, {} as any)
  expect(vscode).toBe(false)
})
