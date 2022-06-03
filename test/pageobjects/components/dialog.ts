import { PageDecorator, IPageDecorator, BasePage } from 'wdio-vscode-service'

import * as locatorMap from '../locators'
import { MuiAutocomplete } from './inputs'
import { MuiDialog as MuiDialogLocators } from '../locators'

export interface MuiDialog extends IPageDecorator<typeof MuiDialogLocators> { }
@PageDecorator(MuiDialogLocators)
export class MuiDialog extends BasePage<typeof MuiDialogLocators, typeof locatorMap> {
  /**
   * @private locator key to identify locator map (see locators.ts)
   */
  public locatorKey = 'MuiDialog' as const

  public async select (id: string, value: string) {
    const select = new MuiAutocomplete(this.locatorMap, id)
    await select.clearValue()
    return select.setValue(value)
  }

  public async isOpen () {
    return this.elem.isExisting()
  }

  public async setInputValue (name: string, value: string) {
    await this.input$(name).setValue(value)
    await browser.keys(['Enter'])
  }

  public async setTextareaValue (name: string, value: string) {
    const textarea = await this.textarea$(name)

    // workaround as clearValue doesn't seem to work
    await browser.pause(100)
    await browser.execute((elem: HTMLTextAreaElement) => { elem.value = '' }, textarea as any)

    await this.textarea$(name).setValue(value)
  }

  public async setQuillContainerValue (value: string) {
    await this.quillEditor$.click()
    await browser.keys(value)
  }

  public save () {
    return this.saveBtn$.click()
  }

  public close () {
    return this.closeBtn$.click()
  }
}
