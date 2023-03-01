import { PageDecorator, IPageDecorator, BasePage } from 'wdio-vscode-service'

import * as locatorMap from '../locators.js'
import { clipboardWidget as clipboardWidgetLocators } from '../locators.js'

export interface ClipboardWidget extends IPageDecorator<typeof clipboardWidgetLocators> { }
@PageDecorator(clipboardWidgetLocators)
export class ClipboardWidget extends BasePage<typeof clipboardWidgetLocators, typeof locatorMap> {
  /**
   * @private locator key to identify locator map (see locators.ts)
   */
  public locatorKey = 'clipboardWidget' as const

  public getClipboardItems () {
    return this.clipboardItems$$.map((clipboardElem) => clipboardElem.getText())
  }

  public async selectItem (name: string)  {
    await this.elem.$(`p=${name}`).click()
  }

  public async getClipboardText (name: string) {
    if (name) {
      await this.selectItem(name)
    }

    return this.editor$.getText()
  }

  public async clickLink () {
    await this.link$.scrollIntoView({ block: 'center' })
    return this.link$.click()
  }
}
