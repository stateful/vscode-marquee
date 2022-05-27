import { createTheme, ThemeOptions } from '@mui/material/styles'
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

  const newTheme: ThemeOptions = {
    shape: {
      borderRadius: 0,
    },
    components: {
      MuiSvgIcon: {
        defaultProps: {
          htmlColor: vsCodeStyleMap['--vscode-icon-foreground']
        }
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: '0px',
          }
        }
      },
      MuiButton: {
        styleOverrides: {
          root: {
            color: 'var(--vscode-button-foreground)',
            backgroundColor: 'var(--vscode-button-background)',
            borderColor: 'var(--vscode-editorGhostText-foreground)',
            '&:hover': {
              backgroundColor: 'var(--vscode-button-hoverBackground)',
              borderColor: 'var(--vscode-tab-inactiveForeground)'
            }
          },
          outlined: {
            backgroundColor: 'transparent',
            color: 'var(--vscode-button-background)',
          }
        }
      },
      MuiListItem: {
        styleOverrides: {
          root: {
            '&:hover': {
              backgroundColor: 'var(--vscode-button-secondaryHoverBackground)',
              color: 'var(--vscode-button-secondaryForeground)'
            }
          }
        }
      },
      MuiButtonGroup: {
        styleOverrides: {
          grouped: {
            '&:not(:last-of-type)': {
              borderRight: '1px solid rgba(255, 255, 255, 0.23)'
            }
          }
        }
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            backgroundImage: 'none'
          }
        }
      },
      MuiPopover: {
        styleOverrides: {
          paper: {
            backgroundImage: 'none'
          }
        }
      },
      MuiTabs: {
        styleOverrides: {
          indicator: {
            left: 0
          }
        }
      }
    },
    palette: {
      mode: document.body.classList[0] === 'vscode-light' ? 'light' : 'dark',
      divider: vsCodeStyleMap['--vscode-foreground'],
      background: {
        default: vsCodeStyleMap['--vscode-sideBar-background'],
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
    }
  }

  return createTheme(newTheme)
}
