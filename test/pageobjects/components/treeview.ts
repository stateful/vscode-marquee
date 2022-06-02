import { PageDecorator, IPageDecorator, BasePage, ViewControl, CustomTreeItem } from 'wdio-vscode-service'
import * as locatorMap from '../locators'
import { TreeView as TreeViewLocators } from '../locators'

export interface TreeView extends IPageDecorator<typeof TreeViewLocators> { }
@PageDecorator(TreeViewLocators)
export class TreeView extends BasePage<typeof TreeViewLocators, typeof locatorMap> {
  /**
   * @private locator key to identify locator map (see locators.ts)
   */
  public locatorKey = 'Select' as const

  constructor (locators: typeof locatorMap, public view: ViewControl) {
    super(locators, 'html')
  }

  async getTreeSection () {
    const view = await this.view.openView()
    const content = await view.getContent()
    return (await content.getSections())[0]
  }

  async getItems () {
    const treeSection = await this.getTreeSection()
    return treeSection.getVisibleItems() as Promise<CustomTreeItem[]>
  }

  async getItemLabels (): Promise<string[]> {
    const items = await this.getItems()
    return Promise.all(items.map((i) => i.getLabel()))
  }
}
