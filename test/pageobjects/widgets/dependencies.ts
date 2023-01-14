import { PageDecorator, IPageDecorator, BasePage } from 'wdio-vscode-service'
import * as locatorMap from '../locators'
import {
  dependenciesWidget as dependenciesWidgetLocators,
  dependenciesEntry as dependenciesEntryLocators
} from '../locators'

export interface DependenciesWidget extends IPageDecorator<typeof dependenciesWidgetLocators> { }
@PageDecorator(dependenciesWidgetLocators)
export class DependenciesWidget extends BasePage<typeof dependenciesEntryLocators, typeof locatorMap> {
  /**
 * @private locator key to identify locator map (see locators.ts)
 */
  public locatorKey = 'dependenciesWidget' as const

  public async refresh () {
    await this.refreshButton$.waitForClickable()
    await this.refreshButton$.click()

    await this.refreshButton$.waitForEnabled({ reverse: true })
    await this.refreshButton$.waitForEnabled()
  }

  public async getDependencies () {
    await this.dependencies$.waitForExist()
    const dependencies = await this.dependencies$$
    return dependencies.map((d) => new DependencyEntry(this.locatorMap, d as any))
  }
}

export interface DependencyEntry extends IPageDecorator<typeof dependenciesEntryLocators> { }
@PageDecorator(dependenciesEntryLocators)
export class DependencyEntry extends BasePage<typeof dependenciesEntryLocators, typeof locatorMap> {
  public locatorKey = 'dependenciesEntry' as const
}