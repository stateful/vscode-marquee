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
    await this.outerFrame$.waitForExist()
    await browser.switchToFrame(await this.outerFrame$)
    await this.innerFrame$.waitForExist()
    const webviewInner = await browser.findElement('css selector', this.locators.innerFrame)
    await browser.switchToFrame(webviewInner)
  }

  public async close () {
    await browser.switchToFrame(null)
    await browser.switchToFrame(null)
  }

  public async switchMode (mode: string) {
    await this.toggleModeBtn$.click()
    const projectMode = await $(`p=${mode}`)
    await projectMode.waitForExist()
    await projectMode.click()
  }
}
