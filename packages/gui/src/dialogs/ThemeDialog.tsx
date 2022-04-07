import React, { useContext } from 'react'
import {
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Grid,
  Box,
} from '@mui/material'

import { GlobalContext } from '@vscode-marquee/utils'
import { DialogContainer, DialogTitle } from '@vscode-marquee/dialog'

import backgrounds from '../utils/backgrounds'
import { themes } from '../constants'
import type { Theme } from '../types'

interface TileStyle {
  minHeight: string
  borderRadius: string
  backgroundColor: string
  backgroundImage: string
  backgroundSize: string
  backgroundRepeat: string
  backgroundPositionY: string
}

const ThemeDialog = React.memo(({ close }: { close: () => void }) => {
  const { themeColor, background, setBackground } = useContext(GlobalContext)
  const isSelected = (tile: Theme) => !isNaN(+background) && tile.id === parseInt(background, 10)

  return (
    <DialogContainer fullScreen={true}>
      <>
        <DialogTitle onClose={close}>Themes</DialogTitle>
        <DialogContent dividers={true}>
          <Box sx={{
            flexGrow: 1,
          }}>
            <Grid container spacing={3}>
              {themes.map((tile) => {
                const tileStyle: Partial<TileStyle> = {
                  minHeight: '200px',
                  borderRadius: '4px',
                }
                if (!tile.background) {
                  tileStyle.backgroundColor = tile.backgroundColor
                } else {
                  tileStyle.backgroundImage = `url("${backgrounds(tile.background)}")`
                  tileStyle.backgroundSize = '100% auto'
                  tileStyle.backgroundRepeat = 'no-repeat'
                  tileStyle.backgroundPositionY = '50%'
                }
                return (
                  <Grid
                    item
                    style={{ cursor: 'pointer' }}
                    xs={12}
                    sm={6}
                    md={4}
                    lg={4}
                    key={tile.id}
                    onClick={() => setBackground(tile.id.toString())}
                  >
                    <Grid container style={tileStyle} alignContent="flex-end">
                      <Grid item style={{ width: '100%' }}>
                        <Grid
                          container
                          style={{
                            padding: '8px',
                            background: (
                              'linear-gradient('
                              + 'to right, '
                              + `rgba(${themeColor.r}, ${themeColor.g}, ${themeColor.b}, 0.9) 0%, `
                              + `rgba(${themeColor.r}, ${themeColor.g}, ${themeColor.b}, 0.5) 100%`
                              + ')'
                            )
                          }}
                          justifyContent="space-between"
                          alignItems="center"
                        >
                          <Grid item>
                            <Grid container direction="column">
                              <Grid item>
                                <Typography style={{ fontWeight: 'bold' }}>
                                  {tile.title}
                                </Typography>
                              </Grid>
                              <Grid item>
                                <Typography variant="body2">
                                  {tile.description}
                                </Typography>
                              </Grid>
                            </Grid>
                          </Grid>
                          {isSelected(tile) && <Grid item>
                            <Button
                              size="small"
                              variant="outlined"
                              sx={{
                                color: 'var(--vscode-foreground)',
                                border: '1px solid var(--vscode-button-foreground)',
                              }}
                            >
                              <Typography style={{ fontWeight: 'bold' }}>Selected</Typography>
                            </Button>
                          </Grid>}
                        </Grid>
                      </Grid>
                    </Grid>
                  </Grid>
                )
              })}
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={close} variant="contained" color="primary">
            Close
          </Button>
        </DialogActions>
      </>
    </DialogContainer>
  )
})

export default ThemeDialog
