import type { ViewControl } from 'wdio-vscode-service'
import { TodoWidget } from '../pageobjects/widgets/todo'
import { NoteWidget } from '../pageobjects/widgets/note'
import { TreeView } from '../pageobjects/components/treeview'
import { Webview } from '../pageobjects/webview'
import * as locatorMap from '../pageobjects/locators'

describe('Marquee Tree Viewer', () => {
  let marqueeItem: ViewControl

  before(async () => {
    const workbench = await browser.getWorkbench()
    const activityBar = await workbench.getActivityBar()
    await browser.waitUntil(async () => (
      Boolean(await activityBar.getViewControl('Marquee')))
    )
    marqueeItem = await activityBar.getViewControl('Marquee')
  })

  it('should show Marquee Icon in Activity Bar', async () => {
    expect(await marqueeItem.getTitle()).toBe('Marquee')
  })

  it('should be able to open the tree view', async () => {
    const treeView = new TreeView(locatorMap, marqueeItem)
    expect(await treeView.getItemLabels()).toEqual([
      'Todo [workspace] (0 open / 0 closed)',
      'Add new todo',
      'Snippets',
      'Add New Snippet',
      'Notes',
      'Add new note'
    ])
  })

  it('should open Marquee webview if clicking on adding a new todo', async () => {
    const treeView = new TreeView(locatorMap, marqueeItem)
    const treeItems = await treeView.getItems()
    await treeItems[1].select()

    const workbench = await browser.getWorkbench()
    await browser.waitUntil(async () => (
      (await workbench.getTitleBar().getTitle()).includes('Marquee')
    ))
  })

  describe('todo', () => {
    it('should fill out the form and submit', async () => {
      const webview = new Webview(locatorMap)
      await webview.open()

      const todo = new TodoWidget(locatorMap)
      await todo.createTodo('Hello World!', ['foo', 'bar'], 'workspace')

      await webview.close()
    })

    it('should have successfully added the todo', async () => {
      const treeView = new TreeView(locatorMap, marqueeItem)
      expect(await treeView.getItemLabels()).toEqual([
        'Todo [workspace] (1 open / 0 closed)',
        'Hello World!',
        'Snippets',
        'Add New Snippet',
        'Notes',
        'Add new note'
      ])
    })

    it('should be able to mark todo as done', async () => {
      const treeView = new TreeView(locatorMap, marqueeItem)
      const items = await treeView.getItems()

      const checkbox = await items[1].elem.$('.custom-view-tree-node-item-icon')
      await expect(checkbox).toHaveAttributeContaining('style', 'checked-border-light.svg')

      await checkbox.click()

      await expect(checkbox).toHaveAttributeContaining('style', 'checked-light.svg')
      await browser.pause(3000)
    })

    it('should propagate changes from tree view to webview', async () => {
      const webview = new Webview(locatorMap)
      await webview.open()

      const todo = new TodoWidget(locatorMap)
      const items = await todo.getTodoItems()

      expect(items.length).toBe(1)
      expect(await items[0].getText()).toBe('Hello World!')

      await webview.close()
    })
  })

  describe('snippet', () => {
    it('can open new snippet editor', async () => {
      const treeView = new TreeView(locatorMap, marqueeItem)
      const addSnippetBtn = await treeView.getItem('Add New Snippet')
      expect(addSnippetBtn).toBeTruthy()

      await addSnippetBtn.select()
      await browser.pause(500)
      const editorLabel = await browser.executeWorkbench((vscode) => {
        return vscode.window.activeTextEditor?.document.fileName
      })
      expect(editorLabel).toBe('/New Snippet')
    })

    it('should enter text and save snippet', async () => {
      // write snippet content
      await browser.keys('This is a snippet')
      // save
      await browser.keys(['Command', 's'])
      await browser.pause(100)
      // enter name of snippet into the prompt
      await browser.keys('My new snippet')
      // save
      await browser.keys(['Enter'])

      const treeView = new TreeView(locatorMap, marqueeItem)
      const newSnippet = await treeView.getItem('My new snippet')
      expect(newSnippet).toBeTruthy()
    })
  })

  describe('notes', () => {
    it('should open new note modal in webview', async () => {
      const treeView = new TreeView(locatorMap, marqueeItem)
      const addNoteBtn = await treeView.getItem('Add new note')
      await addNoteBtn.select()

      const webview = new Webview(locatorMap)
      await webview.open()

      const note = new NoteWidget(locatorMap)
      await note.createNote('My lovely Note', 'Here I am', 'workspace')

      await webview.close()
    })

    it('new note should be now visibile in the tree viewer', async () => {
      const treeView = new TreeView(locatorMap, marqueeItem)
      const newNote = await treeView.getItem('My lovely Note')
      expect(newNote).toBeTruthy()
    })

    it('can update a created note', async () => {
      const treeView = new TreeView(locatorMap, marqueeItem)
      const note = await treeView.getItem('My lovely Note')
      await note.select()

      const webview = new Webview(locatorMap)
      await webview.open()

      const oldNote = new NoteWidget(locatorMap)
      await oldNote.editNote({
        title: 'I changed my mind',
        noteText: 'Bye Bye'
      })

      await webview.close()
    })

    it('should have applied changes in the webview', async () => {
      const treeView = new TreeView(locatorMap, marqueeItem)
      const oldNote = await treeView.getItem('My lovely Note')
      expect(oldNote).not.toBeTruthy()
      const newNote = await treeView.getItem('I changed my mind')
      expect(newNote).toBeTruthy()
    })
  })
})
