import { Webview } from '../pageobjects/webview'
import { DependenciesWidget } from '../pageobjects/widgets/dependencies'
import * as locatorMap from '../pageobjects/locators'

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

    for(const dep of dependencies) {
      expect(await dep.name$.isExisting()).toBeTruthy()
      expect(await dep.name$.getHTML(false)).not.toHaveLength(0)
      expect(await dep.versionInfoCurrent$.isExisting()).toBeTruthy()
      expect(await dep.versionInfoLatest$.isExisting()).toBeTruthy()
    }
  })
})