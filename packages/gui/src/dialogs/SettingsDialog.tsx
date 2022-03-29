import React, { useState, useContext } from 'react'
import {
  DialogContent,
  Button,
  Grid,
  List,
  ListItem,
  ListSubheader,
  Divider,
  ListItemText,
  AppBar,
  Tabs,
  Tab,
  Box
} from '@mui/material'

import { MarqueeWindow, GlobalContext } from '@vscode-marquee/utils'
import { DialogContainer, DialogTitle } from '@vscode-marquee/dialog'

import ModeDialogContent from '../components/ModeDialogContent'

declare const window: MarqueeWindow

const ImportExport = ({ close }: { close: () => void }) => {
  const { setResetApp } = useContext(GlobalContext)

  return (
    <Grid
      container
      direction="column"
      justifyContent="flex-start"
      alignItems="stretch"
      spacing={1}
    >
      <Grid item container alignItems="center" spacing={1}>
        <Grid item>
          <Button
            variant="outlined"
            onClick={() => {
              window.vscode.postMessage({
                west: { execCommands: [{
                  command: 'marquee.jsonImport',
                }]},
              })
              setResetApp(true)
              close()
            }}
          >
            Import
          </Button>
        </Grid>
        <Grid item>
          Import a Marquee JSON file (replaces all current data).
        </Grid>
      </Grid>
      <Grid item container alignItems="center" spacing={1}>
        <Grid item>
          <Button
            variant="outlined"
            onClick={() => {
              window.vscode.postMessage({
                west: { execCommands: [{
                  command: 'marquee.jsonExport',
                }]},
              })
              close()
            }}
          >
            Export
          </Button>
        </Grid>
        <Grid item>Generate a JSON file containing all your Marquee data.</Grid>
      </Grid>
    </Grid>
  )
}

interface TabPanelProps {
  children?: React.ReactElement
  value: number
  index: number
  style?: Record<string, any>
}
function TabPanel (props: TabPanelProps) {
  const { children, value, index, ...other } = props

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      {...other}
    >
      {value === index && (
        <Box p={1} style={{ height: '100%' }}>
          {children}
        </Box>
      )}
    </div>
  )
}

const SettingsDialog = React.memo(({ close }: { close: () => void }) => {
  const [value, setValue] = useState(0)

  const handleChange = (event: any, newValue: any) => {
    if (event.target.innerHTML === 'Marquee Settings') {
      return window.vscode.postMessage({
        west: { execCommands: [{
          command: 'workbench.action.openSettings',
          args: ['@ext:stateful.marquee']
        }]},
      })
    }

    setValue(newValue)
  }
  return (
    <DialogContainer fullScreen={true}>
      <>
        <DialogTitle onClose={close}>Control Panel</DialogTitle>
        <DialogContent dividers={true}>
          <Grid
            container
            wrap="nowrap"
            direction="column"
            style={{ height: '100%' }}
          >
            <Grid item style={{ maxWidth: '100%' }}>
              <AppBar position="static" color="inherit">
                <Tabs
                  value={value}
                  onChange={handleChange}
                  variant="scrollable"
                  scrollButtons
                  allowScrollButtonsMobile>
                  <Tab label="Widgets" />
                  <Tab label="Import / Export" />
                  <Tab label="Marquee Settings" />
                </Tabs>
              </AppBar>
            </Grid>
            <Grid
              item
              style={{
                overflow: 'auto',
              }}
            >
              <TabPanel value={value} index={0} style={{ height: '100%' }}>
                <ModeDialogContent />
              </TabPanel>
              <TabPanel value={value} index={1}>
                <List>
                  <ListSubheader disableSticky>
                    You can export your Marquee settings and import it from
                    the exported JSON file.
                  </ListSubheader>
                  <Divider />
                  <ListItem>
                    <ListItemText primary={<ImportExport close={close} />} />
                  </ListItem>
                </List>
              </TabPanel>
            </Grid>
          </Grid>
        </DialogContent>
      </>
    </DialogContainer>
  )
})

export default SettingsDialog
