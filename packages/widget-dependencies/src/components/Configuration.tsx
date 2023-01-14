import { 
  Checkbox, 
  Divider, 
  FormControl, 
  FormControlLabel, 
  FormGroup, 
  Grid, 
  InputLabel, 
  MenuItem, 
  Select 
} from '@mui/material'
import React, { FC, useContext, useState } from 'react'
import DependencyContext from '../Context'

import JsConfig from '../js/Configuration'

const providers = [
  {
    name: 'JavaScript',
    Component: JsConfig
  }
]

interface Props { }

export const Configuration: FC<Props> = ({ }) => {
  const { 
    autoRefresh,
    setAutoRefresh,
    showUpToDate,
    setShowUpToDate
  } = useContext(DependencyContext)

  const [ language, setLanguage ] = useState<number>(0)

  const { Component: LanguageConfig } = providers[language]
  
  return (
    <FormGroup>
      <FormControlLabel
        control={
          <Checkbox 
            checked={autoRefresh}
            onChange={(e) => setAutoRefresh(e.target.checked)}
          />
        }

        label="Auto-Refresh"
      />
    
      <FormControlLabel 
        control={
          <Checkbox 
            checked={showUpToDate}
            onChange={(e) => setShowUpToDate(e.target.checked)}
          />
        }
        label="Include Up to Date"
      />

      <Grid item>&nbsp;</Grid>
      <Grid item>
        <Divider />
      </Grid>
      <Grid item>&nbsp;</Grid>

      <FormControl variant="standard" >
        <InputLabel id="dependencies-config-language-select-label">Language</InputLabel>
        <Select
          labelId="dependencies-config-language-select-label"
          id="dependencies-config-language-select"
          value={language}
          onChange={(e) => setLanguage(Number(e.target.value))}
          label="Language Settings"
        >
          {providers.map(({ name }, i) => (
            <MenuItem
              key={name}
              value={i}
            >
              {name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <LanguageConfig />
    </FormGroup>
  )
}