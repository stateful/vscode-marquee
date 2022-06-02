import { PageDecorator, IPageDecorator, BasePage } from 'wdio-vscode-service'
import * as locatorMap from '../locators'
import { Select } from '../components/inputs'
import { newsWidget as newsWidgetLocators } from '../locators'

type NewsChannels = 'News' | 'Newest' | 'Ask' | 'Show' | 'Jobs' | 'Best'

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
      throw new Error(`Article with index ${index} not found, only ${articles.length} available`)
    }

    return articles[index]
  }

  public async switchChannel (channel: NewsChannels) {
    await this.settingsBtn$.click()

    const channelSelect = new Select(this.locatorMap, 'marquee-news-channel')
    await channelSelect.wait()
    await channelSelect.selectByValue(channel)
  }
}
