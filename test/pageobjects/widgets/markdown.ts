import { PageDecorator, IPageDecorator, BasePage } from 'wdio-vscode-service'
import * as locatorMap from '../locators'
import { markdownWidget as markdownWidgetLocators } from '../locators'

export interface MarkdownWidget extends IPageDecorator<typeof markdownWidgetLocators> { }
@PageDecorator(markdownWidgetLocators)
export class MarkdownWidget extends BasePage<typeof markdownWidgetLocators, typeof locatorMap> {
  /**
   * @private locator key to identify locator map (see locators.ts)
   */
  public locatorKey = 'markdownWidget' as const

  public getItems () {
    return this.items$$
  }

  public async selectItem (name: string) {
    const itemToSelect = await this.getItems().find(async (elem) => {
      return (await elem.getText()).trim() === name
    }) as WebdriverIO.Element | undefined

    if (!itemToSelect) {
      const availableItems = await this.getItems().map((item) => item.getText())
      throw new Error(`Could not find item with name "${name}", available: ${availableItems.join(', ')}`)
    }

    return itemToSelect.click()
  }
}
