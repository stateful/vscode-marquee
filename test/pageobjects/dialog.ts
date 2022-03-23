import { PluginDecorator, IPluginDecorator, BasePage } from 'wdio-vscode-service'
import * as locatorMap from '../locators'
import { dialog as dialogLocators } from '../locators'

export interface Dialog extends IPluginDecorator<typeof dialogLocators> { }
@PluginDecorator(dialogLocators)
export class Dialog extends BasePage<typeof dialogLocators, typeof locatorMap> {
  /**
   * @private locator key to identify locator map (see locators.ts)
   */
  public locatorKey = 'dialog' as const

  public async select (value: string) {
    await this.comboBox$.click()
    await (await this.elem.parent).$(`li=${value}`).click()
  }

  public async setInputValue (inputName: string, value: string) {
    await this.input$(inputName).setValue(value)
    await browser.keys(['Enter'])
  }

  public close () {
    return this.closeBtn$.click()
  }
}
