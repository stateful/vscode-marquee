import { PluginDecorator, IPluginDecorator, BasePage } from 'wdio-vscode-service'
import * as locatorMap from '../locators'
import { weatherWidget as weatherWidgetLocators } from '../locators'

export interface WeatherWidget extends IPluginDecorator<typeof weatherWidgetLocators> { }
@PluginDecorator(weatherWidgetLocators)
export class WeatherWidget extends BasePage<typeof weatherWidgetLocators, typeof locatorMap> {
  /**
   * @private locator key to identify locator map (see locators.ts)
   */
  public locatorKey = 'weatherWidget' as const

  public async selectScale(scale: 'Fahrenheit' | 'Celsius') {
    await this.btnWeatherSettings$.click()
    await this.comboBox$.click()
    await $(`li=${scale}`).click()
    await $('.MuiDialog-root').$('span=Close').click()
  }

  public getCurrentTemperatur () {
    return this.currentTemperature$.getText()
  }
}
