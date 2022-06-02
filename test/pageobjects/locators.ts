export const webview = {
  widget: (name: string) => `div[aria-label="${name}-widget"]`,
  outerFrame: '.webview.ready',
  innerFrame: '#active-frame',
  widgets: '.react-grid-layout > div',
  toggleScopeBtn: 'button[aria-label="toggle-scope"]'
}

const commonWidgetLocators = {
  settingsBtn: 'button[aria-label="widget-settings"]'
}

export const weatherWidget = {
  ...commonWidgetLocators,
  elem: webview.widget('weather'),
  currentTemperature: 'div[aria-label="Current Temperature"]',
  btnWeatherSettings: 'button[aria-label="weather-settings"]',
  title: 'h6'
}

export const newsWidget = {
  ...commonWidgetLocators,
  elem: webview.widget('news'),
  articles: 'ul.MuiList-root.MuiList-dense.MuiList-padding > li.MuiListItem-root.MuiListItem-dense.MuiListItem-gutters'
}

export const githubWidget = {
  ...commonWidgetLocators,
  elem: webview.widget('github'),
  articles: 'div[aria-labelledby="trend-entry"]',
  filterBtn: 'button[aria-label="github-trends-filter"]',
  filterInput: 'input[name="github-filter"]',
  filterSettingsBtn: 'button[aria-label="filter-settings"]'
}

export const githubTrendItem = {
  language: 'div[aria-label="language"]',
  forks: 'div[aria-label="forks"]',
  stars: 'div[aria-label="stars"]'
}

export const todoWidget = {
  ...commonWidgetLocators,
  elem: webview.widget('todo'),
  createTodoBtn: 'button=Create a todo',
  addTodoBtn: 'button[aria-label="add-todo"]',
  items: 'div[aria-label="todo-item"]',
  filterBtn: 'button[aria-label="todo-filter"]',
  filterInput: 'input[name="todo-filter"]',
  autoDetectCheckbox: 'span[aria-label="Auto-detect TODOs"]',
  hideCompleteCheckbox: 'span[aria-label="Hide completed"]',
  showArchivedCheckbox: 'span[aria-label="Show archived"]'
}

export const todoItem = {
  completeItemCheckbox: 'span[aria-label="Complete Todo"]',
  label: 'p[aria-label="todo-label"]',
  originLink: 'button[aria-label="todo-link"]',
  tags: '.MuiChip-root',
  optionsBtn: 'button[aria-label="todo-options"]'
}

export const MuiDialog = {
  elem: '.MuiDialog-root',
  closeBtn: 'button=Close',
  comboBox: 'div[role="combobox"] button[aria-label="Open"]',
  input: (name: string) => `input[name="${name}"]`,
  textarea: (name: string) => `textarea[name="${name}"]`,
  adornment: '.MuiInputAdornment-root svg',
  saveBtn: 'button=Save'
}

export const Select = {
  root: '.MuiSelect-select'
}

export const MuiAutocomplete = {
  clearBtn: 'button[aria-label="Clear"]',
  openOptionsBtn: 'button[aria-label="Open"]'
}

export const SplitButton = {
  button: '.MuiButtonGroup-root',
  popupBtn: 'button[aria-haspopup="menu"]'
}

export const TreeView = {}
