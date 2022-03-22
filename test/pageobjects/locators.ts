export const weatherWidget = {
  currentTemperature: 'div[aria-label="Current Temperature"]',
  btnWeatherSettings: 'button[aria-label="weather-settings"]',
  comboBox: 'div[role="combobox"] button[aria-label="Open"]'
}

export const webview = {
  widget: (name: string) => `div[aria-label="${name}-widget"]`
}
