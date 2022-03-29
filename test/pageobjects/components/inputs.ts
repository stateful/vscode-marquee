import { PluginDecorator, IPluginDecorator, BasePage } from 'wdio-vscode-service'
import * as locatorMap from '../locators'
import { Select as SelectLocators, MuiAutocomplete as MuiAutocompleteLocators } from '../locators'

export interface Select extends IPluginDecorator<typeof SelectLocators> { }
@PluginDecorator(SelectLocators)
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

  public async selectByValue (value: string) {
    await this.comboBox$.click()
    await this.list$.waitForExist()
    await this.list$.$(`li=${value}`).click()
  }

  public async selectByIndex (index: number) {
    const listItems = await this.list$.$$('li')
    await listItems[index].click()
  }
}

export interface MuiAutocomplete extends IPluginDecorator<typeof MuiAutocompleteLocators> { }
@PluginDecorator(MuiAutocompleteLocators)
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
