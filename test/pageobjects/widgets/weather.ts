import { PageDecorator, IPageDecorator, BasePage } from 'wdio-vscode-service'

import * as locatorMap from '../locators.js'
import { MuiDialog } from '../components/dialog.js'
import { weatherWidget as weatherWidgetLocators } from '../locators.js'

export interface WeatherWidget extends IPageDecorator<typeof weatherWidgetLocators> { }
@PageDecorator(weatherWidgetLocators)
export class WeatherWidget extends BasePage<typeof weatherWidgetLocators, typeof locatorMap> {
  /**
   * @private locator key to identify locator map (see locators.ts)
   */
  public locatorKey = 'weatherWidget' as const

  public async openSettings () {
    const dialog = new MuiDialog(this.locatorMap)
    await this.btnWeatherSettings$.click()
    return dialog
  }

  public async selectScale (scale: 'Fahrenheit' | 'Celsius') {
    const dialog = await this.openSettings()
    await dialog.select('weather-widget-scale', scale)
    await dialog.close()
  }

  public async selectCity (city: string) {
    const dialog = await this.openSettings()
    await dialog.setInputValue('city', city)
    await dialog.close()
  }

  public getCurrentTemperatur () {
    return this.currentTemperature$.getText()
  }

  public getTitle () {
    return this.title$.getText()
  }
}
