import { WeatherWidget } from '../pageobjects/widgets/weather'
import { NewsWidget } from '../pageobjects/widgets/news'
import { GithubWidget } from '../pageobjects/widgets/github'
import { TodoWidget } from '../pageobjects/widgets/todo'
import { Webview } from '../pageobjects/webview'
import * as locatorMap from '../pageobjects/locators'

const WIDGETS = ['welcome', 'projects', 'weather', 'news', 'github', 'todo', 'snippets', 'notes']

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
      await browser.keys(['Escape'])
    })

    it('should load all widgets', async () => {
      await expect(webview.widgets$$).toBeElementsArrayOfSize(8)
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

    describe('weather widget', () => {
      const weatherWidget = new WeatherWidget(locatorMap)

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
        await weatherWidget.selectCity('San Francisco')
        await expect(weatherWidget.title$).toHaveText(
          'Weather in SF')
      })
    })

    describe('news widget', () => {
      const newsWidget = new NewsWidget(locatorMap)

      before(async () => {
        await newsWidget.elem.scrollIntoView({ block: 'center', inline: 'nearest' })
      })

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

    describe('github widget', () => {
      const githubWidget = new GithubWidget(locatorMap)

      before(async () => {
        await githubWidget.elem.scrollIntoView({ block: 'center', inline: 'nearest' })
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

    describe('todo widget', () => {
      const todoWidget = new TodoWidget(locatorMap)

      before(async () => {
        await todoWidget.elem.scrollIntoView({ block: 'center', inline: 'nearest' })
      })

      it('should have no todos at the beginning', async () => {
        await todoWidget.createTodoBtn$.waitForExist()
      })

      it('can set a workspace todo', async () => {
        await todoWidget.createTodo('test123', ['foo1', 'bar1'], 'workspace')
        await todoWidget.createTodo('test321', ['bar2', 'foo2'], 'global')

        const items = await todoWidget.getTodoItems()
        expect(items).toHaveLength(1)
        expect(await items[0].getText()).toBe('test123')
        expect(await items[0].getTags()).toEqual(['foo1', 'bar1'])

      })

      it('shows all todos if global scope is enabled', async () => {
        await webview.toggleScopeBtn$.click()
        expect(await todoWidget.getTodoItems()).toHaveLength(2)
      })

      it('can search for tags', async () => {
        await todoWidget.setFilter('bar2')
        const items = await todoWidget.getTodoItems()
        expect(items).toHaveLength(1)
        expect(await items[0].getText()).toBe('test321')
      })

      it('can edit todo', async () => {
        const items = await todoWidget.getTodoItems()
        await items[0].edit({
          todo: 'updates test321',
          tags: ['bar2', 'foo2', 'updated']
        })
        expect(await items[0].getText()).toBe('updates test321')
        expect(await items[0].getTags()).toEqual(['bar2', 'foo2', 'updated'])
      })

      it('it can hide complete todos', async () => {
        await todoWidget.clearFilter()
        const items = await todoWidget.getTodoItems()
        expect(items).toHaveLength(2)

        await items[0].completeItemCheckbox$.click()
        await items[1].completeItemCheckbox$.click()
        await todoWidget.selectOptions({ hideComplete: true })
        expect(await todoWidget.items$$).toHaveLength(0)
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

