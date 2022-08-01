import { Webview } from '../pageobjects/webview'
import { MarkdownWidget } from '../pageobjects/widgets/markdown'
import * as locatorMap from '../pageobjects/locators'

export const CMD_KEY = process.platform === 'darwin' ? 'Meta' : 'Control'

const webview = new Webview(locatorMap)
const widget = new MarkdownWidget(locatorMap)

describe('Markdown Widget', () => {
  before(async () => {
    const workbench = await browser.getWorkbench()
    await browser.waitUntil(async () => (
      (await workbench.getTitleBar().getTitle()).includes('Marquee')
    ))
    await webview.open()
  })

  it('should be able to switch into project mode', async () => {
    await webview.switchMode('Project')
    expect(widget.elem).toBeExisting()
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
