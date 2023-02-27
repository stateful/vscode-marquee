import { Webview } from '../pageobjects/webview.js'
import { DependenciesWidget } from '../pageobjects/widgets/dependencies.js'
import * as locatorMap from '../pageobjects/locators.js'

const webview = new Webview(locatorMap)
const widget = new DependenciesWidget(locatorMap)

/**
 * no support to be tested as web extension due to
 * https://github.com/microsoft/vscode-test-web/issues/4
 */
describe('Dependencies Widget @skipWeb', () => {
  before(async () => {
    const workbench = await browser.getWorkbench()
    await browser.waitUntil(async () => (
      (await workbench.getTitleBar().getTitle()).includes('Marquee')
    ))
    await webview.open()
  })

  it('should be able to switch into work mode', async () => {
    await webview.switchMode('Work')
    expect(widget.elem).toBeExisting()
  })

  it('should be able to get project dependencies', async () => {
    await widget.refresh()
    const dependencies = await widget.getDependencies()

    expect(dependencies).not.toHaveLength(0)

    let someLinkExists = false

    for(const dep of dependencies) {
      expect(await dep.name$.isExisting()).toBeTruthy()
      expect(await dep.name$.getHTML(false)).not.toHaveLength(0)
      expect(await dep.versionInfoCurrent$.isExisting()).toBeTruthy()
      expect(await dep.versionInfoLatest$.isExisting()).toBeTruthy()

      const links = await dep.linkButton$$

      for(const link of links) {
        someLinkExists = true

        const aElem = link.parentElement()
        const href = await aElem.getAttribute('href')

        expect(href).not.toHaveLength(0)
        expect(href).toMatch(/^http?/)
      }
    }

    expect(someLinkExists).toBeTruthy()
  })
})
