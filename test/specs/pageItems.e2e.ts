import fs from 'node:fs/promises'
import path from 'node:path'
import vscodeType from 'vscode'
import { TextEditor } from 'wdio-vscode-service'

import { Webview } from '../pageobjects/webview'
import { TodoWidget } from '../pageobjects/widgets/todo'
import { NoteWidget } from '../pageobjects/widgets/note'
import { ClipboardWidget } from '../pageobjects/widgets/clipboard'
import * as locatorMap from '../pageobjects/locators'

const FIXTURE_CONTENT = `
This file is auto-generate from e2e tests and can be removed

Add me as Todo

Add me as Clipboard Item

Add me as Note
`

const openFile = async (vscode: typeof vscodeType, file: string, line: number) => {
  const rpath = vscode.Uri.parse(file).fsPath
  const doc = await vscode.workspace.openTextDocument(rpath)
  const editor = await vscode.window.showTextDocument(doc)
  const range = {
    start: { line, character: 0 },
    end: { line, character: 10e10 }
  } as vscodeType.Range
  editor.revealRange(range, vscode.TextEditorRevealType.InCenter)
  editor.selection = new vscode.Selection(range.start, range.end)
}

const file = path.join(__dirname, '..', 'deleteMe.md')

describe('page items', () => {
  before(async () => {
    // wait until Marquee has settled
    await browser.pause(3000)
  })

  beforeEach(async () => {
    await fs.writeFile(file, FIXTURE_CONTENT)
  })

  afterEach(async () => {
    await fs.unlink(file)
  })

  describe('todo', () => {
    const webview = new Webview(locatorMap)
    const todoWidget = new TodoWidget(locatorMap)

    it('should be able to store item with reference', async () => {
      // @ts-expect-error https://github.com/webdriverio-community/wdio-vscode-service/issues/34
      await browser.executeWorkbench(openFile, file, 3)

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
      const editor = await editorView.openEditor(path.basename(file)) as TextEditor
      expect(await editor.getSelectedText()).toBe('Add me as Todo')
    })

    it('should add text and validate that item was updated', async () => {
      const workbench = await browser.getWorkbench()
      const editorView = await workbench.getEditorView()
      const editor = await editorView.openEditor(path.basename(file)) as TextEditor
      await editor.setTextAtLine(1, 'I am new code\n')
      await editor.setTextAtLine(2, 'and me too\n')
      await editor.save()

      await workbench.executeCommand('Marquee: Open Marquee')
      await webview.open()
      await todoWidget.elem.scrollIntoView({ block: 'center' })
      const items = await todoWidget.getTodoItems()
      await items[0].clickLink()
      await webview.close()

      expect(await editor.getSelectedText()).toBe('Add me as Todo')
    })
  })

  describe('notes', () => {
    const webview = new Webview(locatorMap)
    const notesWidget = new NoteWidget(locatorMap)

    it('should be able to store item with reference', async () => {
      // @ts-expect-error https://github.com/webdriverio-community/wdio-vscode-service/issues/34
      await browser.executeWorkbench(openFile, file, 9)

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
      expect(items[0]).toBe(path.basename(file))

      await notesWidget.selectNote(items[0])
      await notesWidget.clickLink()
      await webview.close()
    })

    it('should have a button to go back to its origin', async () => {
      const workbench = await browser.getWorkbench()
      const editorView = await workbench.getEditorView()
      const editor = await editorView.openEditor(path.basename(file)) as TextEditor
      expect(await editor.getSelectedText()).toBe('Add me as Note')
    })

    it('should add text and validate that item was updated', async () => {
      const workbench = await browser.getWorkbench()
      const editorView = await workbench.getEditorView()
      const editor = await editorView.openEditor(path.basename(file)) as TextEditor
      await editor.setTextAtLine(1, 'I am new code\n')
      await editor.setTextAtLine(2, 'and me too\n')
      await editor.save()

      await workbench.executeCommand('Marquee: Open Marquee')
      await webview.open()
      await notesWidget.elem.scrollIntoView({ block: 'center' })
      await notesWidget.clickLink()
      await webview.close()

      expect(await editor.getSelectedText()).toBe('Add me as Note')
    })
  })

  describe('clipboard', () => {
    const webview = new Webview(locatorMap)
    const clipboardWidget = new ClipboardWidget(locatorMap)

    it('should be able to store item with reference', async () => {
      // @ts-expect-error https://github.com/webdriverio-community/wdio-vscode-service/issues/34
      await browser.executeWorkbench(openFile, file, 7)

      const workbench = await browser.getWorkbench()
      await workbench.executeCommand('Marquee: Marquee: Add Selection to Clipboard')
    })

    it('validates if item was added and opens link', async () => {
      const workbench = await browser.getWorkbench()
      await workbench.executeCommand('Marquee: Open Marquee')
      await webview.open()
      await clipboardWidget.elem.scrollIntoView({ block: 'center' })

      await browser.waitUntil(async () => (await clipboardWidget.clipboardItems$$).length === 1)
      const items = await clipboardWidget.getClipboardItems()
      expect(items[0]).toBe(path.basename(file))

      await clipboardWidget.selectItem(items[0])
      await clipboardWidget.clickLink()
      await webview.close()
    })

    it('should have a button to go back to its origin', async () => {
      const workbench = await browser.getWorkbench()
      const editorView = await workbench.getEditorView()
      const editor = await editorView.openEditor(path.basename(file)) as TextEditor
      expect(await editor.getSelectedText()).toBe('Add me as Clipboard Item')
    })

    it('should add text and validate that item was updated', async () => {
      const workbench = await browser.getWorkbench()
      const editorView = await workbench.getEditorView()
      const editor = await editorView.openEditor(path.basename(file)) as TextEditor
      await editor.setTextAtLine(1, 'I am new code\n')
      await editor.setTextAtLine(2, 'and me too\n')
      await editor.save()

      await workbench.executeCommand('Marquee: Open Marquee')
      await webview.open()
      await clipboardWidget.elem.scrollIntoView({ block: 'center' })
      await clipboardWidget.clickLink()
      await webview.close()

      expect(await editor.getSelectedText()).toBe('Add me as Clipboard Item')
    })
  })
})
