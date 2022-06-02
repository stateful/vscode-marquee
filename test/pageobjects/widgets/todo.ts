import { PageDecorator, IPageDecorator, BasePage } from 'wdio-vscode-service'
import * as locatorMap from '../locators'
import { MuiDialog } from '../components/dialog'
import { todoWidget as todoWidgetLocators, todoItem as todoItemLocators } from '../locators'
import { SplitButton } from '../components/button'

interface WidgetOptions {
  autoDetect?: boolean
  hideComplete?: boolean
  showArchived?: boolean
}

export interface TodoWidget extends IPageDecorator<typeof todoWidgetLocators> { }
@PageDecorator(todoWidgetLocators)
export class TodoWidget extends BasePage<typeof todoWidgetLocators, typeof locatorMap> {
  /**
   * @private locator key to identify locator map (see locators.ts)
   */
  public locatorKey = 'todoWidget' as const

  public async createTodo (todo: string, tags: string[], scope: 'workspace' | 'global') {
    const dialog = new MuiDialog(this.locatorMap)
    if (!await dialog.isOpen()) {
      await this.addTodoBtn$.click()
    }

    await dialog.setTextareaValue('body', todo)
    for (const tag of tags) {
      await dialog.setInputValue('todo-tags', tag)
    }

    const btnLabel = scope === 'workspace'
      ? 'Add to Workspace'
      : 'Add as Global Todo'
    const submitBtn = new SplitButton(this.locatorMap, dialog.elem)
    await submitBtn.selectByValue(btnLabel)
  }

  public async getTodoItems () {
    await this.items$.waitForExist()
    return this.items$$.map(
      (item) => new TodoItem(this.locatorMap, item as any))
  }

  public async setFilter (filter: string) {
    await this.filterBtn$.click()
    await this.parent.$(this.locators.filterInput).setValue(filter)
    await browser.keys(['Enter', 'Escape'])
  }

  public async clearFilter () {
    await this.filterBtn$.click()
    await browser.pause(100)

    const filterInput = await this.parent.$(this.locators.filterInput)
    const svg = await filterInput.parentElement().$('svg')
    await svg.click()
    await browser.pause(100)

    await browser.keys(['Escape'])
    await browser.pause(100)
  }

  public async selectOptions (options: WidgetOptions) {
    await this.settingsBtn$.click()

    const checkbox = $(this.locators.autoDetectCheckbox)
    await checkbox.waitForExist()

    const isAutoDetectEnabled = Boolean(
      await $(this.locators.autoDetectCheckbox).$('input[type="checkbox"]').getValue()
    )
    if (typeof options.autoDetect === 'boolean' && isAutoDetectEnabled !== !options.autoDetect) {
      await $(this.locators.autoDetectCheckbox).click()
    }

    const isHideCompleted = Boolean(
      await $(this.locators.hideCompleteCheckbox).$('input[type="checkbox"]').getValue()
    )
    if (typeof options.hideComplete === 'boolean' && isHideCompleted !== !options.hideComplete) {
      await $(this.locators.hideCompleteCheckbox).click()
    }

    const showArchived = Boolean(
      await $(this.locators.showArchivedCheckbox).$('input[type="checkbox"]').getValue()
    )
    if (typeof options.showArchived === 'boolean' && showArchived !== !options.showArchived) {
      await $(this.locators.showArchivedCheckbox).click()
    }

    await browser.keys(['Escape'])
    await checkbox.waitForExist({ reverse: true })
  }
}

export interface TodoItem extends IPageDecorator<typeof todoItemLocators> { }
@PageDecorator(todoItemLocators)
export class TodoItem extends BasePage<typeof todoItemLocators, typeof locatorMap> {
  /**
   * @private locator key to identify locator map (see locators.ts)
   */
  public locatorKey = 'todoItem' as const

  public clickCheckbox () {
    return this.completeItemCheckbox$.click()
  }

  public getText () {
    return this.label$.getText()
  }

  public getTags () {
    return this.tags$$.map((tag) => tag.getText())
  }

  public async edit (option: { todo: string, tags: string[] }, isDialogOpen = false) {
    if (!isDialogOpen) {
      await this.optionsBtn$.click()
      await $('p=Edit').click()
    }

    const dialog = new MuiDialog(this.locatorMap)
    if (option.todo) {
      await dialog.setTextareaValue('body', option.todo)
    }

    if (Array.isArray(option.tags) && option.tags.length) {
      const adornments = await dialog
        .input$('todo-tags')
        .parentElement()
        .$$(dialog.locators.adornment)
      for (const adornment of adornments) {
        await adornment.click()
      }
      for (const tag of option.tags) {
        await dialog.setInputValue('todo-tags', tag)
      }
    }

    await dialog.save()
  }
}
