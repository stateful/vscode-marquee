import React, { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Button, DialogActions, DialogContent, Link, Typography } from '@mui/material'
import { DialogContainer, DialogTitle } from '@vscode-marquee/dialog'
import { faDiscord } from '@fortawesome/free-brands-svg-icons/faDiscord'

interface FeatureInterestDialogProps {
  setShowCloudSyncFeature: (show: boolean) => void
  _isInterestedInSyncFeature: (interested: boolean) => void
}
const FeatureInterestDialog = ({ setShowCloudSyncFeature, _isInterestedInSyncFeature }: FeatureInterestDialogProps) => {
  const discordLink = 'https://discord.gg/BQm8zRCBUY'
  const [showCloudSyncFeedbackResponse, setShowCloudSyncFeedbackResponse] = useState(false)
  return (
    <DialogContainer fullWidth={true} onClose={() => setShowCloudSyncFeature(false)} >
      <DialogTitle onClose={() => setShowCloudSyncFeature(false)} >
        <Typography style={{ width: '85%', fontWeight: 'bold' }}>
          {showCloudSyncFeedbackResponse ?
            <>
              Thank you for your response.
            </>
            :
            'Do you want to sync your Notes, Todos and Snippets across multiple machines?'
          }
        </Typography>
      </DialogTitle>
      {showCloudSyncFeedbackResponse ?
        <DialogContent>
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
        </DialogContent>
        :
        <DialogActions>
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
        </DialogActions>}
    </DialogContainer>
  )
}

export default FeatureInterestDialog