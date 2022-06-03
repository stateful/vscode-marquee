import { PageDecorator, IPageDecorator, BasePage } from 'wdio-vscode-service'
import * as locatorMap from '../locators'
import { MuiDialog } from '../components/dialog'
import { noteWidget as noteWidgetLocators } from '../locators'
import { SplitButton } from '../components/button'

const CMD_KEY = process.platform === 'darwin' ? 'Meta' : 'Control'

export interface NoteWidget extends IPageDecorator<typeof noteWidgetLocators> { }
@PageDecorator(noteWidgetLocators)
export class NoteWidget extends BasePage<typeof noteWidgetLocators, typeof locatorMap> {
  /**
   * @private locator key to identify locator map (see locators.ts)
   */
  public locatorKey = 'todoWidget' as const

  public async createNote (title: string, noteText: string, scope: 'workspace' | 'global') {
    const dialog = new MuiDialog(this.locatorMap)
    if (!await dialog.isOpen()) {
      await this.addNoteBtn$.click()
    }

    await dialog.setInputValue('title', title)
    await dialog.setQuillContainerValue(noteText)

    const btnLabel = scope === 'workspace'
      ? 'Add to Workspace'
      : 'Add as Global Todo'
    const submitBtn = new SplitButton(this.locatorMap, dialog.elem)
    await submitBtn.selectByValue(btnLabel)
  }

  public async editNote (params: { title?: string, noteText?: string }) {
    const dialog = new MuiDialog(this.locatorMap)
    if (params.title) {
      // delete input first (not possible with clearValue)
      await dialog.input$('title').click()
      await browser.keys([CMD_KEY, 'a'])
      await browser.keys(['Delete'])
      await dialog.setInputValue('title', params.title)
    }
    if (params.noteText) {
      await dialog.setQuillContainerValue(params.noteText)
    }

    await dialog.saveBtn$.click()
  }
}
