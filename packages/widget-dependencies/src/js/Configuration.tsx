import { FormControlLabel, Checkbox, TextField } from '@mui/material'
import React, { useContext } from 'react'
import DependencyContext from '../Context'

const Configuration = () => {
  const {
    prefersPnpm,
    setPrefersPnpm,
    jsRegistry,
    setJsRegistry
  } = useContext(DependencyContext)
  
  return (
    <>
      <FormControlLabel 
        control={
          <Checkbox 
            checked={prefersPnpm}
            onChange={(e) => setPrefersPnpm(e.target.checked)}
          />
        }
        label="Prefer pnpm"
      />

      <TextField 
        id="widget-dependencies-config-js-registry" 
        label="Registry" 
        variant="filled"

        value={jsRegistry}
        onChange={(e) => setJsRegistry(e.target.value)}

        placeholder="Default registry..."
      />
    </>
  )
}

export default Configuration