import { PageDecorator, IPageDecorator, BasePage } from 'wdio-vscode-service'

import * as locatorMap from '../locators.js'
import { Select } from '../components/inputs.js'
import { newsWidget as newsWidgetLocators } from '../locators.js'

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

  public async switchChannel (channel?: string | number) {
    await this.settingsBtn$.click()

    const channelSelect = new Select(this.locatorMap, 'marquee-news-channel')
    await channelSelect.wait()

    /**
     * pick channel by string
     */
    if (typeof channel === 'string') {
      return channelSelect.selectByValue(channel)
    }

    /**
     * pick channel by index
     */
    if (typeof channel === 'number') {
      return channelSelect.selectByIndex(channel)
    }

    /**
     * pick random other channel
     */
    const currentValue = await channelSelect.getValue()
    const otherValues = (await channelSelect.getOptions()).filter(
      (option) => option !== currentValue)
    const randomChannel = otherValues[Math.floor(Math.random() * otherValues.length)]
    return channelSelect.selectByValue(randomChannel)
  }
}
