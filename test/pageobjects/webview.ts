import { PageDecorator, IPageDecorator, BasePage } from 'wdio-vscode-service'

import * as locatorMap from './locators.js'
import { webview as webviewLocators } from './locators.js'

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

  public async close (closeTab?: boolean) {
    await browser.switchToFrame(null)
    await browser.switchToFrame(null)

    if (closeTab) {
      const workbench = await browser.getWorkbench()
      const editorView = await workbench.getEditorView()
      await editorView.closeEditor('Marquee')
    }
  }

  public async switchMode (mode: string, retry = false) {
    await this.toggleModeBtn$.click()
    const projectMode = await $(`p=${mode}`)
    try {
      await projectMode.waitForExist()
      await projectMode.click()
    } catch (err) {
      /**
       * it seems that the popup does not show up in CI
       * every once in a while, retry in this case once
       */
      if (!retry) {
        return this.switchMode(mode, true)
      }

      throw err
    }

    await this.toggleModeBtn$.click()
  }
}
