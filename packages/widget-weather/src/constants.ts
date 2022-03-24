export const SCALE_OPTIONS = [
  { name: "Fahrenheit", value: "fahrenheit" },
  { name: "Celsius", value: "celsius" },
] as const

export const DEFAULT_CONFIGURATION = {
  city: "",
  scale: SCALE_OPTIONS[0].name
}

export const DEFAULT_STATE = {}
