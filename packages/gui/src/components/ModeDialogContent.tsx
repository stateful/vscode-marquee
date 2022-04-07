import React, { useContext, useMemo, useState, useEffect } from 'react'
import {
  Typography,
  Grid,
  List,
  ListItem,
  ListItemText,
  Tooltip,
  Box,
  FormControlLabel,
  Checkbox,
  ListItemAvatar,
  ListItemSecondaryAction,
  Tabs,
  Tab,
} from '@mui/material'
import withStyles from '@mui/styles/withStyles'
import ViewCompactIcon from '@mui/icons-material/ViewCompact'
import PropTypes from 'prop-types'
import { Emoji } from 'emoji-mart'

import ModeContext from '../contexts/ModeContext'
import { widgetConfig } from '../constants'

import ModeConfigToolbar from './ModeConfigToolbar'
import ModeTabPop from './ModeTabPop'
import { ucFirst } from '../utils'
import { WidgetConfig, PresetModes } from '../types'

const VerticalTabs = withStyles(() => ({
  flexContainer: {
    flexDirection: 'column',
  },
  indicator: {
    display: 'none',
  },
}))(Tabs)

const MyTab = withStyles(() => ({
  selected: {
    borderLeft:
      '2px solid var(--vscode-editorMarkerNavigationError-background)',
    backgroundColor: 'var(--vscode-editor-background)',
  },
}))(Tab)

interface TabPanelProps {
  children: any
  value: number
  index: number
}

function TabPanel (props: TabPanelProps) {
  const { children, value, index, ...other } = props

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`vertical-tabpanel-${index}`}
      aria-labelledby={`vertical-tab-${index}`}
      {...other}
    >
      {value === index && <Box p={1}>{children}</Box>}
    </div>
  )
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.any.isRequired,
  value: PropTypes.any.isRequired,
}

interface WidgetSelectorProps {
  widgetName: string
  targetModeName: string
}
const WidgetSelector = React.memo(({ widgetName, targetModeName }: WidgetSelectorProps) => {
  const { modes, _setModeWidget } = useContext(ModeContext)

  const checked = useMemo(() => {
    if (modes[targetModeName] && modes[targetModeName]['widgets'][widgetName]) {
      return modes[targetModeName]['widgets'][widgetName]
    } else {
      return false
    }
  }, [modes, widgetName, targetModeName])

  return (
    <Tooltip title={'Enable/Disable'} placement="top" arrow>
      <FormControlLabel
        label=""
        aria-label={`Enable/Disable ${ucFirst(widgetName)} Widget`}
        style={{ marginLeft: 0, marginRight: 0 }}
        control={
          <Checkbox
            edge="start"
            disableRipple
            size="small"
            checked={checked}
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              _setModeWidget(targetModeName, widgetName, !checked)
            }}
          />
        }
      />
    </Tooltip>
  )
})

interface WidgetListProps {
  name: string
}
const WidgetList = React.memo(({ name }: WidgetListProps) => {
  const { modes, _setModeWidget, thirdPartyWidgets } = useContext(ModeContext)
  const widgets: WidgetConfig[] = [...widgetConfig, ...thirdPartyWidgets]

  return (
    <>
      {widgets.map((widget: any) => {
        return (
          <Grid item key={widget.name}>
            <List dense style={{ padding: 0 }}>
              <ListItem
                dense
                button
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  _setModeWidget(
                    name,
                    widget.name,
                    !modes[name]['widgets'][widget.name]
                  )
                }}
              >
                <ListItemAvatar>
                  {React.cloneElement(widget.icon, {
                    style: { fontSize: '16px' },
                  })}
                </ListItemAvatar>
                <ListItemText
                  aria-label={`Enable/Disable ${ucFirst(widget.name)} Widget`}
                  primary={
                    <Typography variant="body2">
                      {(widget.label && ucFirst(widget.label)) ||
                        ucFirst(widget.name)}
                    </Typography>
                  }
                  secondary={
                    <Typography variant="caption">
                      {widget.description}
                    </Typography>
                  }
                />
                <ListItemSecondaryAction>
                  <WidgetSelector
                    widgetName={widget.name}
                    targetModeName={name}
                  />
                </ListItemSecondaryAction>
              </ListItem>
            </List>
          </Grid>
        )
      })}
    </>
  )
})

const ModeDialogContent = () => {
  const { modes, modeName } = useContext(ModeContext)
  const [value, setValue] = useState(0)

  useEffect(() => {
    setValue(Object.keys(modes).indexOf(modeName))
  }, [])

  useEffect(() => {
    if (!Object.keys(modes)[value]) {
      setValue(Object.keys(modes).indexOf(modeName))
    }
  }, [modes])

  const handleChange = (event: any, newValue: any) => {
    setValue(newValue)
  }

  return (
    <>
      <ModeConfigToolbar />

      <Box sx={{
        flexGrow: 1,
        display: 'flex',
        height: '90%',
      }}>
        <Box flexGrow={1} display="flex" overflow="hidden">
          <Box overflow="auto" style={{ minWidth: '150px' }}>
            <VerticalTabs
              orientation="vertical"
              variant="scrollable"
              value={value}
              onChange={handleChange}
              sx={{
                borderRight: theme => `1px solid ${theme.palette.divider}`,
                height: '100%',
              }}
            >
              {modes &&
                Object.keys(modes).map((name) => {
                  return (
                    <MyTab
                      style={{ minWidth: 0 }}
                      key={name}
                      label={
                        <ModeTabPop name={name as PresetModes}>
                          <Grid
                            container
                            direction="row"
                            justifyContent="flex-start"
                            alignItems="center"
                            wrap="nowrap"
                            spacing={1}
                          >
                            <Grid item style={{ paddingTop: '8px' }}>
                              {modes[name].icon && (
                                <Emoji emoji={modes[name].icon!} size={16} />
                              )}
                              {!modes[name].icon && (
                                <ViewCompactIcon fontSize="small" />
                              )}
                            </Grid>
                            <Grid item>
                              <Tooltip
                                title={ucFirst(name)}
                                placement="top"
                                arrow
                              >
                                <Typography variant="body2">
                                  {ucFirst(name)}
                                </Typography>
                              </Tooltip>
                            </Grid>
                          </Grid>
                        </ModeTabPop>
                      }
                    />
                  )
                })}
            </VerticalTabs>
          </Box>
          <Box overflow="auto" style={{ width: '100%' }}>
            {modes &&
              Object.keys(modes).map((name) => {
                return (
                  <TabPanel
                    value={value}
                    index={Object.keys(modes).indexOf(name)}
                    key={name}
                  >
                    <WidgetList name={name} />
                  </TabPanel>
                )
              })}
          </Box>
        </Box>
      </Box>
    </>
  )
}

export default ModeDialogContent
