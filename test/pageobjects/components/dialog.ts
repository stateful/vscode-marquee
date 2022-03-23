import { PluginDecorator, IPluginDecorator, BasePage } from 'wdio-vscode-service'
import * as locatorMap from '../locators'
import { MuiDialog as MuiDialogLocators } from '../locators'

export interface MuiDialog extends IPluginDecorator<typeof MuiDialogLocators> { }
@PluginDecorator(MuiDialogLocators)
export class MuiDialog extends BasePage<typeof MuiDialogLocators, typeof locatorMap> {
  /**
   * @private locator key to identify locator map (see locators.ts)
   */
  public locatorKey = 'MuiDialog' as const

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
