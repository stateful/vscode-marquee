import { TodoWidget } from '../pageobjects/widgets/todo.js'
import { Webview } from '../pageobjects/webview.js'
import * as locatorMap from '../pageobjects/locators.js'

describe('todo widget', () => {
  const webview = new Webview(locatorMap)
  const todoWidget = new TodoWidget(locatorMap)

  before(async () => {
    const workbench = await browser.getWorkbench()
    await browser.waitUntil(async () => (
      (await workbench.getTitleBar().getTitle()).includes('Marquee')
    ))
    await webview.open()
    await webview.switchMode('Project')
    await todoWidget.elem.waitForExist()
    await todoWidget.elem.scrollIntoView({ block: 'end' })
  })

  it('should have no todos at the beginning', async () => {
    await todoWidget.createTodoBtn$.waitForExist()
  })

  it('can set a workspace todo', async () => {
    await todoWidget.createTodo('test123', ['foo1', 'bar1'], 'workspace')
    await todoWidget.createTodo('test321', ['bar2', 'foo2'], 'global')

    const items = await todoWidget.getTodoItems()
    expect(items).toHaveLength(1)
    expect(await items[0].getText()).toBe('test123')
    expect(await items[0].getTags()).toEqual(['foo1', 'bar1'])

  })

  it('shows all todos if global scope is enabled', async () => {
    await webview.toggleScopeBtn$.click()
    expect(await todoWidget.getTodoItems()).toHaveLength(2)
  })

  it('can search for tags', async () => {
    await todoWidget.setFilter('bar2')
    const items = await todoWidget.getTodoItems()
    expect(items).toHaveLength(1)
    expect(await items[0].getText()).toBe('test321')
  })

  it('can edit todo', async () => {
    const items = await todoWidget.getTodoItems()
    await items[0].edit({
      todo: 'updates test321',
      tags: ['bar2', 'foo2', 'updated']
    })
    expect(await items[0].getText()).toBe('updates test321')
    expect(await items[0].getTags()).toEqual(['bar2', 'foo2', 'updated'])
  })

  it('it can hide complete todos', async () => {
    await todoWidget.clearFilter()
    const items = await todoWidget.getTodoItems()
    expect(items).toHaveLength(2)

    await items[0].completeItemCheckbox$.click()
    await items[1].completeItemCheckbox$.click()
    await todoWidget.selectOptions({ hideComplete: true })
    expect(await todoWidget.items$$).toHaveLength(0)
  })
})
