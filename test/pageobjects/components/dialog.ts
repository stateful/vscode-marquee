import { PluginDecorator, IPluginDecorator, BasePage } from 'wdio-vscode-service'

import * as locatorMap from '../locators'
import { MuiAutocomplete } from './inputs'
import { MuiDialog as MuiDialogLocators } from '../locators'

export interface MuiDialog extends IPluginDecorator<typeof MuiDialogLocators> { }
@PluginDecorator(MuiDialogLocators)
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

  public async setInputValue (inputName: string, value: string) {
    await this.input$(inputName).setValue(value)
    await browser.keys(['Enter'])
  }

  public close () {
    return this.closeBtn$.click()
  }
}
