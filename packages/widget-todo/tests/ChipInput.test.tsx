import React from 'react'
import { render, screen } from '@testing-library/react'
import ChipInput from '../src/components/ChipInput'
import userEvent from '@testing-library/user-event'

const noop = () => undefined

test('renders label', () => {
  const label = 'Add some tags!'
  render(<ChipInput label={label} value={[]} onChange={noop} />)
  expect(screen.getAllByText(label)).toHaveLength(2)
})

test('renders tags', () => {
  const tags = ['tagOne', 'tagTwo']
  render(<ChipInput value={tags} onChange={noop} />)

  tags.forEach((tag) =>
    expect(screen.getByRole('button', { name: tag })).toBeInTheDocument()
  )
})

test('triggers `onChange` with new value when enter is pressed', async () => {
  const onChange = jest.fn()
  const oldTags = ['OldTag']

  render(<ChipInput value={oldTags} onChange={onChange} />)

  const userInputText = 'NewTag'
  await userEvent.type(screen.getByRole('textbox'), userInputText + '{enter}')

  expect(onChange).toHaveBeenCalledWith([...oldTags, userInputText])
})

test('triggers `onChange` with new value when input is blurred', async () => {
  const onChange = jest.fn()
  const oldTags = ['OldTag']

  render(<ChipInput value={oldTags} onChange={onChange} />)

  const userInputText = 'NewTag'
  await userEvent.type(screen.getByRole('textbox'), userInputText)

  // to trigger blur
  await userEvent.tab()

  expect(onChange).toHaveBeenCalledWith([...oldTags, userInputText])
})

test('doenst trigger `onChange` when new value is duplicate', async () => {
  const onChange = jest.fn()
  const newTag = 'NewTag'
  const oldTags = [newTag]

  render(<ChipInput value={oldTags} onChange={onChange} />)

  const userInputText = 'NewTag'
  await userEvent.type(screen.getByRole('textbox'), userInputText + '{enter}')

  expect(onChange).not.toBeCalled()
})

test('Clicking the X removes a tag', async () => {
  const onChange = jest.fn()
  const tagToRemoveLabel = 'tag-to-remove'
  const oldTags = ['some-tag', tagToRemoveLabel, 'other-tag']

  render(<ChipInput value={oldTags} onChange={onChange} />)

  const tagToRemove = screen.getByRole('button', { name: tagToRemoveLabel })

  await userEvent.click(tagToRemove.querySelector('svg')!)

  expect(onChange).toHaveBeenCalledWith(
    oldTags.filter((tag) => tag !== tagToRemoveLabel)
  )
})

test('Typing backspace when input is empty starts editing the last tag', async () => {
  const onChange = jest.fn()
  const tagToEdit = 'tag-to-edit'
  const oldTags = [tagToEdit]

  render(<ChipInput value={oldTags} onChange={onChange} />)

  // hitting backspace when input has content just removes content
  await userEvent.type(
    screen.getByRole('textbox'),
    'ABC{backspace}{backspace}{backspace}'
  )
  expect(onChange).not.toHaveBeenCalled()

  // now that the input is empty, is starts editing the last tag
  await userEvent.type(screen.getByRole('textbox'), '{backspace}')
  expect(onChange).toHaveBeenCalledWith([])
  expect(screen.getByRole('textbox')).toHaveValue(tagToEdit)
})
