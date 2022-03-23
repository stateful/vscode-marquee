export const webview = {
  widget: (name: string) => `div[aria-label="${name}-widget"]`,
  outerFrame: '.webview.ready',
  innerFrame: '#active-frame',
  widgets: '.react-grid-layout > div'
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

export const MuiDialog = {
  elem: '.MuiDialog-root',
  closeBtn: 'span=Close',
  comboBox: 'div[role="combobox"] button[aria-label="Open"]',
  input: (inputName: string) => `input[name="${inputName}"]`,
}

export const Select = {
  root: '.MuiSelect-root'
}

export const MuiAutocomplete = {
  clearBtn: 'button[aria-label="Clear"]',
  openOptionsBtn: 'button[aria-label="Open"]'
}
