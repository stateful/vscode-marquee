import { PageDecorator, IPageDecorator, BasePage } from 'wdio-vscode-service'

import * as locatorMap from '../locators.js'
import { Select as SelectLocators, MuiAutocomplete as MuiAutocompleteLocators } from '../locators.js'

export interface Select extends IPageDecorator<typeof SelectLocators> { }
@PageDecorator(SelectLocators)
export class Select extends BasePage<typeof SelectLocators, typeof locatorMap> {
  /**
   * @private locator key to identify locator map (see locators.ts)
   */
  public locatorKey = 'Select' as const

  constructor (locators: typeof locatorMap, public id: string) {
    super(locators, 'html')
  }

  get comboBox$ () {
    return this.elem.$(`${this.locators.root}[aria-labelledby="${this.id}"]`)
  }

  get list$ () {
    return this.elem.$(`ul[aria-labelledby="${this.id}"]`)
  }

  public getValue () {
    return this.elem.$(`div[aria-labelledby="${this.id}"]`).getText()
  }

  public async getOptions () {
    await this.comboBox$.click()
    await this.list$.waitForExist()
    const options = await this.list$.$$('li').map((li) => li.getText())
    await browser.keys(['Escape'])
    return options
  }

  public async selectByValue (value: string) {
    await this.comboBox$.click()
    await this.list$.waitForExist()

    // wait for animation to finish
    await browser.pause(500)
    await this.list$.$(`li=${value}`).click()
    // wait for animation to finish
    await browser.pause(500)
  }

  public async selectByIndex (index: number) {
    await this.comboBox$.click()
    const listItems = await this.list$.$$('li')
    await listItems[index].click()
  }
}

export interface MuiAutocomplete extends IPageDecorator<typeof MuiAutocompleteLocators> { }
@PageDecorator(MuiAutocompleteLocators)
export class MuiAutocomplete extends BasePage<typeof MuiAutocompleteLocators, typeof locatorMap> {
  /**
   * @private locator key to identify locator map (see locators.ts)
   */
  public locatorKey = 'MuiAutocomplete' as const

  constructor (locators: typeof locatorMap, public id: string) {
    super(locators, `#${id}`)
  }

  public async clearValue () {
    const clearBtn = await this.elem
      .parentElement()
      .$(this.locators.clearBtn)
    await this.elem.click()
    await clearBtn.click()
  }

  public async setValue (value: string) {
    await this.elem.setValue(value)
    await browser.keys(['ArrowDown', 'Enter'])
  }

  public async getOptions$ (closePopup = false) {
    await this.elem
      .parentElement()
      .$(this.locators.openOptionsBtn)
      .click()
    const elems = await $(`#${this.id}-popup > li`)

    if (closePopup) {
      await browser.keys(['Escape'])
    }

    return elems
  }

  public async selectByIndex (index: number) {
    const options = await this.getOptions$
    await options[index].click()
  }
}
