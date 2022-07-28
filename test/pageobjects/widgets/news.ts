import { PageDecorator, IPageDecorator, BasePage } from 'wdio-vscode-service'
import * as locatorMap from '../locators'
import { Select } from '../components/inputs'
import { newsWidget as newsWidgetLocators } from '../locators'

export interface NewsWidget extends IPageDecorator<typeof newsWidgetLocators> { }
@PageDecorator(newsWidgetLocators)
export class NewsWidget extends BasePage<typeof newsWidgetLocators, typeof locatorMap> {
  /**
   * @private locator key to identify locator map (see locators.ts)
   */
  public locatorKey = 'newsWidget' as const

  public async getArticle (index: number) {
    await this.articles$.waitForExist()
    const articles = await this.articles$$

    if (!articles[index]) {
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      throw new Error(`Article with index ${index} not found, only ${articles.length} available`)
    }

    return articles[index]
  }

  public async switchChannel (channel: string | number, retries = 5) {
    await this.settingsBtn$.click()

    const channelSelect = new Select(this.locatorMap, 'marquee-news-channel')
    await channelSelect.wait()
    if (typeof channel === 'string') {
      await channelSelect.selectByValue(channel)
    } else if (typeof channel === 'number') {
      await channelSelect.selectByIndex(channel)
    } else {
      throw new Error(`Invalid type of channel: "${typeof channel}", only string and number allowed`)
    }

    /**
     * check if widget has an error
     * ToDo(Christian): remove if rss feeds are not failing due to rate limiting
     */
    await browser.pause(1000)
    const error = await this.elem.$('div[aria-label="widget-error"]')
    if (await error.isExisting()) {
      await this.switchChannel(0)
      return this.switchChannel(channel, --retries)
    }
  }
}
