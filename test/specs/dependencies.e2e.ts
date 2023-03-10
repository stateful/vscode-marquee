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
  it('shows up in project mode', async () => {
    const workbench = await browser.getWorkbench()
    await browser.waitUntil(async () => (
      (await workbench.getTitleBar().getTitle()).includes('Marquee')
    ))
    await webview.open()
    await webview.switchMode('Project')
    await expect(widget.elem).toBeExisting()
  })

  /**
   * we load the Marquee project which has a hefty number of
   * dependencies making this test very slow and brittle
   */
  it.skip('should be able to get project dependencies', async () => {
    await widget.refresh()
    const dependencies = await widget.getDependencies()
    expect(dependencies).not.toHaveLength(0)

    let someLinkExists = false

    for(const dep of dependencies) {
      await expect(dep.name$).toBeExisting()
      await expect(dep.name$.getHTML(false)).not.toBe('')
      await expect(dep.versionInfoCurrent$).toBeExisting()
      await expect(dep.versionInfoLatest$).toBeExisting()

      const links = await dep.linkButton$$

      for(const link of links) {
        someLinkExists = true
        const href = await link.parentElement().getAttribute('href')
        expect(href).toMatch(/^http?/)
      }
    }

    expect(someLinkExists).toBeTruthy()
  })
})
