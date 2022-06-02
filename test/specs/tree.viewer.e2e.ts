import type { ViewControl } from 'wdio-vscode-service'
import { TodoWidget } from '../pageobjects/widgets/todo'
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
})
