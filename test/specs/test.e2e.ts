import { Key } from 'webdriverio'

import { WeatherWidget } from '../pageobjects/widgets/weather.js'
import { NewsWidget } from '../pageobjects/widgets/news.js'
import { GithubWidget } from '../pageobjects/widgets/github.js'
import { Webview } from '../pageobjects/webview.js'
import * as locatorMap from '../pageobjects/locators.js'

const WIDGETS = ['welcome', 'weather', 'news', 'github', 'runme']

describe('Marquee', () => {
  before('should open by default', async () => {
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

    beforeEach(async () => {
      await browser.keys(Key.Escape)
    })

    it('should load all widgets', async () => {
      await expect(webview.widgets$$).toBeElementsArrayOfSize(WIDGETS.length)
    })

    /**
     * it seems that tricks don't get properly propagated into the UI
     * when run in CI
     */
    describe.skip('mailbox widget', () => {
      it('should display message', async () => {
        await expect($('div[aria-label="welcome-widget"]'))
          .toHaveTextContaining('you are using a pre-release version of Marquee.')
      })
    })

    describe('Runme widget', () => {
      it('should be in the default view', async () => {
        await expect($('div[aria-label="runme-widget"] h6')).toHaveText('Runme Markdowns')
      })
    })

    describe('weather widget', () => {
      const weatherWidget = new WeatherWidget(locatorMap)

      before(async () => {
        await weatherWidget.elem.scrollIntoView()
      })

      it('should display weather forecast', async () => {
        await expect(weatherWidget.currentTemperature$)
          .toHaveTextContaining('°F')
      })

      it('should be able to update to Celsius', async () => {
        await weatherWidget.selectScale('Celsius')
        await expect(weatherWidget.currentTemperature$)
          .toHaveTextContaining('°C')
      })

      it('should be able to select a different city', async () => {
        await weatherWidget.selectCity('San Francisco CA')
        await expect(weatherWidget.title$).toHaveText(
          'Weather in SF')
      })
    })

    describe('news widget @skipWeb', () => {
      const newsWidget = new NewsWidget(locatorMap)

      before(async () => {
        await newsWidget.elem.scrollIntoView({ block: 'end' })
      })

      it('should display articles', async () => {
        await browser.waitUntil(
          (async () => (await newsWidget.articles$$.length) > 0),
          { timeout: 60 * 1000 }
        )
        await expect(newsWidget.articles$$)
          .toBeElementsArrayOfSize({ gte: 5 })
      })

      it('should be able to switch news channels', async () => {
        const firstArticle = await newsWidget.getArticle(0)
        const firstArticleText = await firstArticle.getText()
        expect(typeof firstArticleText).toBe('string')

        await newsWidget.switchChannel()

        const newFirstArticle = await newsWidget.getArticle(0)
        const newFirstArticleText = await newFirstArticle.getText()

        expect(typeof newFirstArticleText).toBe('string')
        expect(firstArticleText).not.toBe(newFirstArticleText)
      })
    })

    describe('github widget', () => {
      const githubWidget = new GithubWidget(locatorMap)

      before(async () => {
        await githubWidget.elem.scrollIntoView({ block: 'end' })
      })

      it('should display trends', async () => {
        await expect(githubWidget.articles$$)
          .toBeElementsArrayOfSize({ gte: 10 })
      })

      it('should filter articles', async () => {
        await githubWidget.setFilter('a crazy filter that won\'t match anything')
        await expect(githubWidget.articles$$).toBeElementsArrayOfSize(0)
      })

      it('should be able to clear the filter', async () => {
        await githubWidget.clearFilter()
        await expect(githubWidget.articles$$)
          .toBeElementsArrayOfSize({ gte: 10 })
      })

      it('should be able to select a programming language', async () => {
        await githubWidget.setFilterOption({ language: 'TypeScript' })
        const trends = await githubWidget.getProjects()
        expect(await trends[0].getProjectLanguage()).toBe('TypeScript')
      })

      it('should be able to select spoken language', async () => {
        await githubWidget.setFilterOption({ spoken: 'Yoruba' })
        await expect(githubWidget.articles$$).toBeElementsArrayOfSize(0)
      })
    })
  })

  describe('fullscreen feature', () => {
    /**
     * remove sticky header otherwise it might overlay the widget header
     */
    before(() => {
      browser.execute(() => document.querySelector('.marqueeNavigation').remove())
    })

    for (const widget of WIDGETS) {
      it(`${widget} widget`, async () => {
        const modalSelector = `.MuiModal-root div[aria-labelledby="${widget}Fullscreen"]`
        await $(`button[aria-label="Toggle ${widget} widget to fullscreen"]`).click()
        await expect($(modalSelector)).toBeExisting()
        await browser.keys(['Escape'])
        await expect($(modalSelector)).not.toBeExisting()
      })
    }
  })
})

