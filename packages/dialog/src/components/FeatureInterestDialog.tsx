import React, { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Button, DialogActions, DialogContent, Grid, Link, Typography } from '@mui/material'
import { faDiscord } from '@fortawesome/free-brands-svg-icons/faDiscord'
import { DialogContainer, DialogTitle } from '..'

const discordLink = 'https://discord.gg/BQm8zRCBUY'

interface FeatureInterestDialogProps {
  setShowCloudSyncFeature: (show: boolean) => void
  _isInterestedInSyncFeature: (interested: boolean) => void
}
const FeatureInterestDialog = ({ setShowCloudSyncFeature, _isInterestedInSyncFeature }: FeatureInterestDialogProps) => {
  const [showCloudSyncFeedbackResponse, setShowCloudSyncFeedbackResponse] = useState(false)

  const DialogHeader = showCloudSyncFeedbackResponse
    ? 'Thank you for your response.'
    : 'Do you want to sync your Notes, Todos and Snippets across multiple machines?'

  const DialogBody = showCloudSyncFeedbackResponse
    ? <DialogContent sx={{ padding: '2px' }}>
      <Grid padding={2}>
        Join our
        <Link
          component="a"
          href={discordLink}
          target="_blank"
          underline="hover">
          &nbsp;discord &nbsp;
          <FontAwesomeIcon icon={faDiscord} />
        </Link>
        {' '}channel if you like to stay updated with
        upcoming features or if you have other feature requests.
      </Grid>
    </DialogContent>
    : <DialogActions>
      <Button onClick={() => {
        _isInterestedInSyncFeature(false)
        setShowCloudSyncFeedbackResponse(true)
      }}>No</Button>
      <Button onClick={() => {
        _isInterestedInSyncFeature(true)
        setShowCloudSyncFeedbackResponse(true)
      }}>
        Yes
      </Button>
    </DialogActions>

  return (
    <DialogContainer fullWidth={true} onClose={() => setShowCloudSyncFeature(false)} >
      <DialogTitle onClose={() => setShowCloudSyncFeature(false)} >
        <Typography style={{ width: '85%', fontWeight: 'bold' }}>
          {DialogHeader}
        </Typography>
      </DialogTitle>
      {DialogBody}
    </DialogContainer>
  )
}

export default React.memo(FeatureInterestDialog)
