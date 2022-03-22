import { WeatherWidget } from '../pageobjects/widgets/weather'
import * as locatorMap from '../pageobjects/locators'

describe('Marquee', () => {
  it('should open by default', async () => {
    const workbench = await browser.getWorkbench()
    await browser.waitUntil(async () => (
      (await workbench.getTitleBar().getTitle()).includes('Marquee')
    ))
  })

  it('should load all widgets', async() => {
    const webviewContainer = await browser.findElement('css selector', '.webview.ready')
    await browser.switchToFrame(webviewContainer)
    await $('#active-frame').waitForExist()
    const webviewInner = await browser.findElement('css selector', '#active-frame')
    await browser.switchToFrame(webviewInner)
    await expect($$('.react-grid-layout > div')).toBeElementsArrayOfSize(8)
  })

  describe('mailbox widget', () => {
    it('should display message', async () => {
      await expect($('div[aria-label="welcome-widget"]'))
        .toHaveTextContaining('Hey there 👋 you are using a pre-release version of Marquee.');
    })
  })

  describe('weather widget', () => {
    const weatherWidget = new WeatherWidget(locatorMap)

    it('should display weather forecast', async () => {
      await expect(weatherWidget.currentTemperature$)
        .toHaveTextContaining('°F');
    })

    it('should be able to update to Celsius', async () => {
      await weatherWidget.selectScale('Celsius')
      await expect(weatherWidget.currentTemperature$)
        .toHaveTextContaining('°C');
    })
  })
})

