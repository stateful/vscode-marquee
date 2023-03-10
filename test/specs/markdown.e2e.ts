import { Webview } from '../pageobjects/webview.js'
import { MarkdownWidget } from '../pageobjects/widgets/markdown.js'
import * as locatorMap from '../pageobjects/locators.js'

const webview = new Webview(locatorMap)
const widget = new MarkdownWidget(locatorMap)

/**
 * no support to be tested as web extension due to
 * https://github.com/microsoft/vscode-test-web/issues/4
 */
describe('Markdown Widget @skipWeb', () => {
  before(async () => {
    const workbench = await browser.getWorkbench()
    await browser.waitUntil(async () => (
      (await workbench.getTitleBar().getTitle()).includes('Marquee')
    ))
    await webview.open()
    await webview.switchMode('Project')
    await expect(widget.elem).toBeExisting()
  })

  it('should have markdown items loaded', async () => {
    await widget.items$.waitForExist()
    await widget.selectItem('CHANGELOG.md')
    await expect(widget.content$).toHaveTextContaining('for a detailed changelog on every release.')
  })

  it('should read markdown from configuration', async () => {
    await widget.selectItem('some-test.js')
    await expect(widget.content$).toHaveTextContaining('I am a smoke test')
  })
})
