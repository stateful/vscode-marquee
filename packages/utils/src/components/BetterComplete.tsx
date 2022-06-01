import React, { ChangeEvent } from 'react'
import Autocomplete from '@mui/material/Autocomplete'
import { styled, TextField } from '@mui/material'

export interface Props {
  id: string
  field: string,
  options: any,
  display: string
  label: string
  variant: 'filled' | 'standard' | 'outlined' | undefined
  value: any
  isOptionEqualToValue: (option: any, value: any) => boolean
  onChange: (e: ChangeEvent<{}>, v: any) => void
}

const PREFIX = 'BetterComplete'
const classes = {
  option: `${PREFIX}-option`,
  input: `${PREFIX}-input`,
  label: `${PREFIX}-label`,
}

const Root = styled('div')(() => ({
  [`&.${classes.option}`]: {
    backgroundColor: 'var(--vscode-editor-background)',

    '&[data-focus="true"]': {
      backgroundColor: 'var(--vscode-editor-selectionBackground)',
      color: 'var(--vscode-input-foreground)',
    },
    '&[aria-selected="true"]': {
      backgroundColor: 'var(--vscode-editor-selectionBackground)',
      color: 'var(--vscode-editor-foreground)',
    },
  },
  [`& .${classes.input}`]: {
    // color: "black",
    color: 'var(--vscode-editor-foreground)',
  },
  [`& .${classes.label}`]: {
    color: 'var(--vscode-editor-foreground)',
  },
}))

const BetterComplete = ({
  id,
  field,
  options,
  display,
  label,
  variant,
  ...rest
}: Props) => {

  return (
    <Root>
      <Autocomplete
        id={id}
        classes={{
          option: classes.option,
          input: classes.input,
        }}
        options={options}
        getOptionLabel={(option) => option[display] || ''}
        renderInput={(params) => (
          <TextField
            {...params}
            label={label || field}
            fullWidth
            variant={variant || 'outlined'}
            InputLabelProps={{
              className: classes.label,
            }}
          />
        )}
        {...rest}
      />
    </Root>
  )
}

export default React.memo(BetterComplete)
