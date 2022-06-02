import { PageDecorator, IPageDecorator, BasePage } from 'wdio-vscode-service'
import * as locatorMap from '../locators'
import { MuiAutocomplete } from '../components/inputs'
import {
  githubWidget as githubWidgetLocators,
  githubTrendItem as githubTrendItemLocators
} from '../locators'

export interface GithubWidget extends IPageDecorator<typeof githubWidgetLocators> { }
@PageDecorator(githubWidgetLocators)
export class GithubWidget extends BasePage<typeof githubWidgetLocators, typeof locatorMap> {
  /**
   * @private locator key to identify locator map (see locators.ts)
   */
  public locatorKey = 'githubWidget' as const

  public async getTrend (index: number) {
    await this.articles$.waitForExist()
    const articles = await this.articles$$

    if (!articles[index]) {
      throw new Error(`Article with index ${index} not found, only ${articles.length} available`)
    }

    return articles[index]
  }

  public async setFilter (filter: string) {
    await this.filterBtn$.click()
    await this.parent.$(this.locators.filterInput).setValue(filter)
    await browser.keys(['Enter', 'Escape'])
  }

  public async clearFilter () {
    const filterInput = await this.parent.$(this.locators.filterInput)

    if (!(await filterInput.isExisting())) {
      await this.filterBtn$.click()
    }

    await filterInput.waitForExist()
    await filterInput.parentElement().$('svg').click()
  }

  public async getProjects () {
    await this.articles$.waitForExist()
    const articles = await this.articles$$
    return articles.map((a) => new GithubTrendItem(this.locatorMap, a as any))
  }

  public async setFilterOption (options: { language?: string, spoken?: string, since?: string }) {
    if (!options.language && !options.spoken && !options.since) {
      return
    }

    await this.filterSettingsBtn$.click()

    if (options.language) {
      const programmingFilter = new MuiAutocomplete(this.locatorMap, 'github-language-filter')
      await programmingFilter.setValue(options.language)
    }
    if (options.spoken) {
      const programmingFilter = new MuiAutocomplete(this.locatorMap, 'github-spoken-filter')
      await programmingFilter.setValue(options.spoken)
    }
    if (options.since) {
      const programmingFilter = new MuiAutocomplete(this.locatorMap, 'github-since-filter')
      await programmingFilter.setValue(options.since)
    }

    await browser.keys(['Escape'])
  }
}

export interface GithubTrendItem extends IPageDecorator<typeof githubTrendItemLocators> { }
@PageDecorator(githubTrendItemLocators)
export class GithubTrendItem extends BasePage<typeof githubTrendItemLocators, typeof locatorMap> {
  /**
   * @private locator key to identify locator map (see locators.ts)
   */
  public locatorKey = 'githubTrendItem' as const

  public getProjectLanguage () {
    return this.language$.getText()
  }

  public getProjectForks () {
    return this.forks$.getText()
  }

  public getProjectStars () {
    return this.stars$.getText()
  }
}
