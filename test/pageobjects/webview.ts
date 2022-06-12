import { PageDecorator, IPageDecorator, BasePage } from 'wdio-vscode-service'
import * as locatorMap from './locators'
import { webview as webviewLocators } from './locators'

export interface Webview extends IPageDecorator<typeof webviewLocators> { }
@PageDecorator(webviewLocators)
export class Webview extends BasePage<typeof webviewLocators, typeof locatorMap> {
  /**
   * @private locator key to identify locator map (see locators.ts)
   */
  public locatorKey = 'webview' as const

  public async open () {
    const webviewContainer = await browser.findElement('css selector', this.locators.outerFrame)
    await browser.switchToFrame(webviewContainer)
    await this.innerFrame$.waitForExist()
    const webviewInner = await browser.findElement('css selector', this.locators.innerFrame)
    await browser.switchToFrame(webviewInner)
  }

  public async close () {
    await browser.switchToFrame(null)
    await browser.switchToFrame(null)
  }
}
