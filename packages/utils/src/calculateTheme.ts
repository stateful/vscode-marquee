import { createTheme, DeprecatedThemeOptions, adaptV4Theme } from '@mui/material/styles'
import React from 'react'

export default () => {
  const fontSize = parseInt(
    window.getComputedStyle(document.documentElement)
      .getPropertyValue('--vscode-font-size')
      .replace('px', '')
  )

  const vscodeStyles = document.documentElement.style.cssText.split(';')
  const vsCodeStyleMap: Record<string, string> = {}

  vscodeStyles.forEach((style) => {
    if (style.indexOf('--vscode') !== -1) {
      const pair = style.replace(/\s/g, '').split(':')
      vsCodeStyleMap[pair[0]] = pair[1]
    }
  })

  const newTheme: DeprecatedThemeOptions = {
    shape: {
      borderRadius: 0,
    },
    props: {
      MuiSvgIcon: {
        htmlColor: vsCodeStyleMap['--vscode-icon-foreground'],
      },
    },
    palette: {
      mode: document.body.classList[0] === 'vscode-light' ? 'light' : 'dark',
      divider: vsCodeStyleMap['--vscode-foreground'],
      background: {
        default: vsCodeStyleMap['--vscode-editor-background'],
        paper: vsCodeStyleMap['--vscode-sideBar-background'],
      },
      text: {
        primary: vsCodeStyleMap['--vscode-foreground'],
        secondary: vsCodeStyleMap['--vscode-foreground'],
      },
      primary: {
        main: vsCodeStyleMap['--vscode-button-background'] || '#000000',
        dark: vsCodeStyleMap['--vscode-button-hoverBackground'],
        contrastText: vsCodeStyleMap['--vscode-button-foreground'],
      },
      secondary: {
        main: vsCodeStyleMap['--vscode-editorMarkerNavigationError-background'],
        contrastText: vsCodeStyleMap['--vscode-button-foreground'],
      },
      action: {
        active: vsCodeStyleMap['--vscode-foreground'],
        selected: vsCodeStyleMap['--vscode-editor-selectionBackground'],
        hover: vsCodeStyleMap['--vscode-editor-hoverHighlightBackground'],
        disabled: vsCodeStyleMap['--vscode-editor-inactiveSelectionBackground'],
        disabledBackground:
          vsCodeStyleMap['--vscode-editor-inactiveSelectionBackground'],
      },
    },
    typography: {
      fontFamily: vsCodeStyleMap['--vscode-font-family'],
      fontWeightLight: vsCodeStyleMap['--vscode-font-weight'] as React.CSSProperties['fontWeight'],
      fontWeightRegular: vsCodeStyleMap['--vscode-font-weight'] as React.CSSProperties['fontWeight'],
      fontWeightMedium: vsCodeStyleMap['--vscode-font-weight'] as React.CSSProperties['fontWeight'],
      fontWeightBold: vsCodeStyleMap['--vscode-font-weight'] as React.CSSProperties['fontWeight'],
      fontSize: fontSize,
      button: {
        textTransform: 'none',
      },
    },
    overrides: {
      MuiChip: {
        root: {
          borderRadius: '0px',
        },
      },
    },
  }

  return createTheme(adaptV4Theme(newTheme))
}
