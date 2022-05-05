import { extendTheme } from '@chakra-ui/react'
import { createBreakpoints } from '@chakra-ui/theme-tools'

import { MAIN_COLOR } from './constants'

const fonts = { mono: '\'Menlo\', monospace' }

const breakpoints = createBreakpoints({
  xs: '36em',
  sm: '40em',
  md: '52em',
  lg: '64em',
  xl: '80em',
})

const theme = extendTheme({
  colors: {
    black: '#16161D',
    marquee: MAIN_COLOR,
  },
  config: {
    useSystemColorMode: true,
    initialColorMode: 'dark'
  },
  fonts,
  breakpoints,
})

export default theme
