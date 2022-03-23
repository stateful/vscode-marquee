import { PluginDecorator, IPluginDecorator, BasePage } from 'wdio-vscode-service'
import * as locatorMap from '../locators'
import { Select as SelectLocators } from '../locators'

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
    await this.list$.$(`li=${value}`).click()
  }

  public async selectByIndex (index: number) {
    const listItems = await this.list$.$$('li')
    await listItems[index].click()
  }
}
