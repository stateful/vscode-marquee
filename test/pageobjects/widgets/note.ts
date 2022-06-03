import { PageDecorator, IPageDecorator, BasePage } from 'wdio-vscode-service'
import * as locatorMap from '../locators'
import { MuiDialog } from '../components/dialog'
import { noteWidget as noteWidgetLocators } from '../locators'
import { SplitButton } from '../components/button'

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
      await dialog.setInputValue('title', params.title)
    }
    if (params.noteText) {
      await dialog.setQuillContainerValue(params.noteText)
    }

    await dialog.saveBtn$.click()
  }
}
