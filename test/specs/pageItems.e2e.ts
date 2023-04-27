import fs from 'node:fs/promises'
import url from 'node:url'
import path from 'node:path'
import vscodeType from 'vscode'
import { TextEditor } from 'wdio-vscode-service'
import { browser, $ } from '@wdio/globals'

import { Webview } from '../pageobjects/webview.js'
import { TodoWidget } from '../pageobjects/widgets/todo.js'
import { NoteWidget } from '../pageobjects/widgets/note.js'
import { ClipboardWidget } from '../pageobjects/widgets/clipboard.js'
import * as locatorMap from '../pageobjects/locators.js'

const FIXTURE_CONTENT = `
This file is auto-generate from e2e tests and can be removed

Add me as Todo

Add me as Clipboard Item

Add me as Note
`

const setup = async () => fs.writeFile(file, FIXTURE_CONTENT)

const teardown = async () => {
  await fs.unlink(file)
  const workbench = await browser.getWorkbench()
  const editorView = await workbench.getEditorView()
  await editorView.closeAllEditors()
}

const openMarquee = async () => {
  await browser.pause(500)
  await $('ul[aria-label="Editor actions"] li').click()
  await browser.pause(1500)
}

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

const __dirname = url.fileURLToPath(new URL('.', import.meta.url))
const file = path.join(__dirname, '..', 'deleteMe.md')
const webview = new Webview(locatorMap)
const todoWidget = new TodoWidget(locatorMap)
const notesWidget = new NoteWidget(locatorMap)
const clipboardWidget = new ClipboardWidget(locatorMap)

describe('page items @skipWeb', () => {
  before(async () => {
    const workbench = await browser.getWorkbench()
    await browser.waitUntil(async () => (
      (await workbench.getTitleBar().getTitle()).includes('Marquee')
    ))
    await webview.open()
    await webview.switchMode('Project')
    await todoWidget.elem.waitForExist()
    await webview.close()
  })

  describe('todo', () => {
    before(setup)
    after(teardown)

    it('should be able to store item with reference', async () => {
      await browser.executeWorkbench(openFile, file, 3)

      const workbench = await browser.getWorkbench()
      await workbench.executeCommand('Marquee: Marquee: Add to Todos')
    })

    it('validates if item was added and opens link', async () => {
      await openMarquee()
      await webview.open()
      await todoWidget.elem.scrollIntoView()

      const items = await todoWidget.getTodoItems()
      expect(items).toHaveLength(1)
      expect(await items[0].getText()).toBe('Add me as Todo')
      await items[0].elem.scrollIntoView()
      await items[0].clickLink()
      await webview.close(true)
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

      await openMarquee()
      await webview.open()
      await todoWidget.elem.scrollIntoView()
      const items = await todoWidget.getTodoItems()
      await items[0].elem.scrollIntoView()
      await items[0].clickLink()
      await webview.close(true)

      expect(await editor.getSelectedText()).toBe('Add me as Todo')
    })
  })

  describe('clipboard', () => {
    before(setup)
    after(teardown)

    it('should be able to store item with reference', async () => {
      // wait until file got updated
      await browser.pause(1000)
      await browser.executeWorkbench(openFile, file, 5)

      const workbench = await browser.getWorkbench()
      await workbench.executeCommand('Marquee: Marquee: Add Selection to Clipboard')
    })

    it('validates if item was added and opens link', async () => {
      await openMarquee()
      await webview.open()
      await clipboardWidget.elem.scrollIntoView({ block: 'center' })

      await browser.waitUntil(async () => (await clipboardWidget.clipboardItems$$).length === 1)
      const items = await clipboardWidget.getClipboardItems()
      expect(items[0]).toBe(path.basename(file))

      await clipboardWidget.selectItem(items[0])
      await clipboardWidget.clickLink()
      await webview.close(true)
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

      await openMarquee()
      await webview.open()
      await clipboardWidget.elem.scrollIntoView({ block: 'center' })
      await clipboardWidget.clickLink()
      await webview.close(true)

      expect(await editor.getSelectedText()).toBe('Add me as Clipboard Item')
    })
  })

  describe('notes', () => {
    before(setup)
    after(teardown)

    it('should be able to store item with reference', async () => {
      // wait until file got updated
      await browser.pause(1000)
      await browser.executeWorkbench(openFile, file, 7)

      const workbench = await browser.getWorkbench()
      await workbench.executeCommand('Marquee: Marquee: Add Selection to Notes')
    })

    it('validates if item was added and opens link', async () => {
      await openMarquee()
      await webview.open()
      await notesWidget.elem.scrollIntoView({ block: 'center' })

      await browser.waitUntil(async () => (await notesWidget.noteItems$$).length === 1)
      const items = await notesWidget.getNotes()
      expect(items[0]).toBe(path.basename(file))

      await notesWidget.selectNote(items[0])
      await notesWidget.clickLink()
      await webview.close(true)
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

      await openMarquee()
      await webview.open()
      await notesWidget.elem.scrollIntoView({ block: 'center' })
      await notesWidget.clickLink()
      await webview.close(true)

      expect(await editor.getSelectedText()).toBe('Add me as Note')
    })
  })
})
