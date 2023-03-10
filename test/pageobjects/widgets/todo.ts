import { PageDecorator, IPageDecorator, BasePage } from 'wdio-vscode-service'
import { Key, type ChainablePromiseElement } from 'webdriverio'

import * as locatorMap from '../locators.js'
import { MuiDialog } from '../components/dialog.js'
import { todoWidget as todoWidgetLocators, todoItem as todoItemLocators } from '../locators.js'
import { SplitButton } from '../components/button.js'

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
      await this.ensureMenuIsInteractible(this.addTodoBtn$)
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

  public async ensureMenuIsInteractible (menuBtn: ChainablePromiseElement<WebdriverIO.Element>) {
    /**
     * click menu handle if widget is too small
     */
    if (!(await menuBtn.isExisting())) {
      await this.openMenuBtn$.click()
    }
  }

  public async getTodoItems () {
    await this.items$.waitForExist()
    return this.items$$.map(
      (item) => new TodoItem(this.locatorMap, item as any))
  }

  public async setFilter (filter: string) {
    await this.ensureMenuIsInteractible(this.filterBtn$)
    await this.filterBtn$.click()
    await this.parent.$(this.locators.filterInput).setValue(filter)
    await browser.keys(['Enter', 'Escape'])

    /**
     * only needed if widget is too small
     */
    if (!(await this.openMenuBtn$.isExisting())) {
      await this.openMenuBtn$.click()
    }
  }

  public async clearFilter () {
    await this.ensureMenuIsInteractible(this.filterBtn$)
    await this.filterBtn$.click()
    await browser.pause(100)

    const filterInput = await this.parent.$(this.locators.filterInput)
    const svg = await filterInput.parentElement().$('svg')
    await svg.click()
    await browser.pause(100)

    await browser.keys([Key.Escape])
    await browser.pause(100)
  }

  public async selectOptions (options: WidgetOptions) {
    await this.ensureMenuIsInteractible(this.settingsBtn$)
    await this.settingsBtn$.click()

    const checkbox = $(this.locators.autoDetectCheckbox)
    await checkbox.waitForExist()

    await $(this.locators.autoDetectCheckbox).waitForExist()
    const isAutoDetectEnabled = Boolean(
      await $(this.locators.autoDetectCheckbox).$('input[type="checkbox"]').getValue()
    )
    if (typeof options.autoDetect === 'boolean' && isAutoDetectEnabled !== !options.autoDetect) {
      await $(this.locators.autoDetectCheckbox).click()
      /**
       * we have to reopen settings box as it closes for each change
       */
      await this.ensureMenuIsInteractible(this.settingsBtn$)
      await browser.pause(200)
      await this.settingsBtn$.click()
    }

    await $(this.locators.hideCompleteCheckbox).waitForExist()
    const isHideCompleted = Boolean(
      await $(this.locators.hideCompleteCheckbox).$('input[type="checkbox"]').getValue()
    )
    if (typeof options.hideComplete === 'boolean' && isHideCompleted !== !options.hideComplete) {
      await $(this.locators.hideCompleteCheckbox).click()
      /**
       * we have to reopen settings box as it closes for each change
       */
      await this.ensureMenuIsInteractible(this.settingsBtn$)
      await browser.pause(200)
      await this.settingsBtn$.click()
    }

    await $(this.locators.showArchivedCheckbox).waitForExist()
    const showArchived = Boolean(
      await $(this.locators.showArchivedCheckbox).$('input[type="checkbox"]').getValue()
    )
    if (typeof options.showArchived === 'boolean' && showArchived !== !options.showArchived) {
      await $(this.locators.showArchivedCheckbox).click()
      /**
       * we have to reopen settings box as it closes for each change
       */
      await this.ensureMenuIsInteractible(this.settingsBtn$)
      await browser.pause(200)
      await this.settingsBtn$.click()
    }

    await browser.keys([Key.Escape])
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

  public async clickLink () {
    await this.link$.scrollIntoView({ block: 'center' })
    return this.link$.click()
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
