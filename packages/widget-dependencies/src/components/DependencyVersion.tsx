import { Grid, IconButton, Typography } from '@mui/material'
import React, { FC } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faAnglesUp } from '@fortawesome/free-solid-svg-icons/faAnglesUp'

interface Props {
  version?: string
  caption?: string
  upgrade?: (() => void)|false
}

export const DependencyVersion: FC<Props> = ({ version, caption, upgrade }) => {
  return (
    <Grid
      container
      direction="row"
      alignItems="center"
      gap={0.5}
      width="unset"
      aria-label={`dependency-version-info-${caption}`}
    >
      <Grid
        container
        direction="column"
        alignItems="start"
        width="unset"
      >
        <Typography component="span" fontWeight="bold">
          {version}
        </Typography>
        <Typography component="span" sx={{ fontVariant: 'small-caps' }}>
          {caption}
        </Typography>
      </Grid>

      { upgrade && (
        <IconButton
          onClick={upgrade}
          aria-label="dependency-upgrade-button"
        >
          <FontAwesomeIcon 
            icon={faAnglesUp}
            fontSize='medium'
          />
        </IconButton>
      )}
    </Grid>
    
  )
}