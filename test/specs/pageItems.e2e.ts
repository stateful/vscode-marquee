import path from 'node:path'
import vscodeType from 'vscode'
import { TextEditor } from 'wdio-vscode-service'

import { Webview } from '../pageobjects/webview'
import { TodoWidget } from '../pageobjects/widgets/todo'
import { NoteWidget } from '../pageobjects/widgets/note'
import * as locatorMap from '../pageobjects/locators'

describe('page items', () => {
  describe('todo', () => {
    const webview = new Webview(locatorMap)
    const todoWidget = new TodoWidget(locatorMap)

    it('should be able to store item with reference', async () => {
      await browser.pause(3000)
      await browser.executeWorkbench(
        async (vscode: typeof vscodeType, file: string) => {
          const rpath = vscode.Uri.parse(file).fsPath
          const doc = await vscode.workspace.openTextDocument(rpath)
          const editor = await vscode.window.showTextDocument(doc)
          const range = {
            start: { line: 3, character: 0 },
            end: { line: 3, character: 10e10 }
          } as vscodeType.Range
          editor.revealRange(range, vscode.TextEditorRevealType.InCenter)
          editor.selection = new vscode.Selection(range.start, range.end)
        },
        // @ts-expect-error https://github.com/webdriverio-community/wdio-vscode-service/issues/34
        path.join(__dirname, '..', 'fixtures', 'exampleDoc.md')
      )

      const workbench = await browser.getWorkbench()
      await workbench.executeCommand('Marquee: Marquee: Add to Todos')
    })

    it('validates if item was added and opens link', async () => {
      const workbench = await browser.getWorkbench()
      await workbench.executeCommand('Marquee: Open Marquee')
      await webview.open()
      await todoWidget.elem.scrollIntoView({ block: 'center' })

      const items = await todoWidget.getTodoItems()
      expect(items).toHaveLength(1)
      expect(await items[0].getText()).toBe('Add me as Todo')

      await items[0].clickLink()
      await webview.close()
    })

    it('should have a button to go back to its origin', async () => {
      const workbench = await browser.getWorkbench()
      const editorView = await workbench.getEditorView()
      const editor = await editorView.openEditor('exampleDoc.md') as TextEditor
      expect(await editor.getSelectedText()).toBe('Add me as Todo')
    })
  })

  describe('clipboard', () => {
    const webview = new Webview(locatorMap)
    const notesWidget = new NoteWidget(locatorMap)

    it('should be able to store item with reference', async () => {
      await browser.executeWorkbench(
        async (vscode: typeof vscodeType, file: string) => {
          const rpath = vscode.Uri.parse(file).fsPath
          const doc = await vscode.workspace.openTextDocument(rpath)
          const editor = await vscode.window.showTextDocument(doc)
          const range = {
            start: { line: 7, character: 0 },
            end: { line: 7, character: 10e10 }
          } as vscodeType.Range
          editor.revealRange(range, vscode.TextEditorRevealType.InCenter)
          editor.selection = new vscode.Selection(range.start, range.end)
        },
        // @ts-expect-error https://github.com/webdriverio-community/wdio-vscode-service/issues/34
        path.join(__dirname, '..', 'fixtures', 'exampleDoc.md')
      )

      const workbench = await browser.getWorkbench()
      await workbench.executeCommand('Marquee: Marquee: Add Selection to Notes')
    })

    it('validates if item was added and opens link', async () => {
      const workbench = await browser.getWorkbench()
      await workbench.executeCommand('Marquee: Open Marquee')
      await webview.open()
      await notesWidget.elem.scrollIntoView({ block: 'center' })

      await browser.waitUntil(async () => (await notesWidget.noteItems$$).length === 1)
      const items = await notesWidget.getNotes()
      expect(items[0]).toBe('exampleDoc.md')

      await notesWidget.selectNote(items[0])
      await notesWidget.clickLink()
      await webview.close()
    })

    it('should have a button to go back to its origin', async () => {
      const workbench = await browser.getWorkbench()
      const editorView = await workbench.getEditorView()
      const editor = await editorView.openEditor('exampleDoc.md') as TextEditor
      expect(await editor.getSelectedText()).toBe('Add me as Note')
    })
  })
})
