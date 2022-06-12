import { PageDecorator, IPageDecorator, BasePage } from 'wdio-vscode-service'
import * as locatorMap from '../locators'
import { SplitButton as SplitButtonLocators } from '../locators'

export interface SplitButton extends IPageDecorator<typeof SplitButtonLocators> { }
@PageDecorator(SplitButtonLocators)
export class SplitButton extends BasePage<typeof SplitButtonLocators, typeof locatorMap> {
  /**
   * @private locator key to identify locator map (see locators.ts)
   */
  public locatorKey = 'SplitButton' as const

  public async selectByValue (value: string) {
    const popupBtn = await this.popupBtn$
    await popupBtn.waitForExist()
    await popupBtn.click()
    await browser.pause(200)

    const controls = await popupBtn.getAttribute('aria-controls')
    const items = await this.elem.$$(`#${controls} > li`)
    const itemValues = await Promise.all(items.map((i) => i.getText()))

    if (!itemValues.includes(value)) {
      throw new Error(`Option for SplitButton "${value}" not available, options are: ${itemValues.join(', ')}`)
    }

    const index = itemValues.findIndex((p) => p === value)
    await items[index].click()
    await this.button$.$('button').click()
  }
}
