export const webview = {
  widget: (name: string) => `div[aria-label="${name}-widget"]`,
  outerFrame: '.webview.ready',
  innerFrame: '#active-frame',
  widgets: '.react-grid-layout > div'
}

export const weatherWidget = {
  elem: webview.widget('weather'),
  currentTemperature: 'div[aria-label="Current Temperature"]',
  btnWeatherSettings: 'button[aria-label="weather-settings"]',
  title: 'h6'
}

export const dialog = {
  elem: '.MuiDialog-root',
  closeBtn: 'span=Close',
  comboBox: 'div[role="combobox"] button[aria-label="Open"]',
  input: (inputName: string) => `input[name="${inputName}"]`,
}
