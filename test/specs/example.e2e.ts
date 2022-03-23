import { WeatherWidget } from '../pageobjects/widgets/weather'
import { NewsWidget } from '../pageobjects/widgets/news'
import { Webview } from '../pageobjects/webview'
import * as locatorMap from '../pageobjects/locators'

describe('Marquee', () => {
  it('should open by default', async () => {
    const workbench = await browser.getWorkbench()
    await browser.waitUntil(async () => (
      (await workbench.getTitleBar().getTitle()).includes('Marquee')
    ))
  })

  describe('widgets', () => {
    const webview = new Webview(locatorMap)

    before(async () => {
      await webview.open()
    })

    it('should load all widgets', async() => {
      await expect(webview.widgets$$).toBeElementsArrayOfSize(8)
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

      it('should be able to select a different city', async () => {
        await weatherWidget.selectCity('San Francisco')
        await expect(weatherWidget.title$).toHaveText(
          'Weather in SF')
      })
    })

    describe('news widget', () => {
      const newsWidget = new NewsWidget(locatorMap)

      it('should display articles', async () => {
        await expect(newsWidget.articles$$)
          .toBeElementsArrayOfSize({ gte: 10 })
      })

      it('should be able to switch news channels', async () => {
        const firstArticle = await newsWidget.getArticle(0)
        const firstArticleText = await firstArticle.getText()
        expect(typeof firstArticleText).toBe('string')

        await newsWidget.switchChannel('Jobs')

        const newFirstArticle = await newsWidget.getArticle(0)
        const newFirstArticleText = await newFirstArticle.getText()

        expect(typeof newFirstArticleText).toBe('string')
        expect(firstArticleText).not.toBe(newFirstArticleText)
      })
    })
  })
})

