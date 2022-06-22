import { Button, DialogActions, DialogContent, Typography } from '@mui/material'
import { DialogContainer, DialogTitle } from '@vscode-marquee/dialog'
import React from 'react'

interface FeatureInterestDialogProps {
  setShowCloudSyncFeature: (show: boolean) => void
  _isInterestedInSyncFeature: () => void
}
const FeatureInterestDialog = ({ setShowCloudSyncFeature, _isInterestedInSyncFeature }: FeatureInterestDialogProps) => {
  return (
    <DialogContainer fullWidth={true} onClose={() => setShowCloudSyncFeature(false)} >
      <DialogTitle onClose={() => setShowCloudSyncFeature(false)} >
        <Typography style={{ width: '85%', fontWeight: 'bold' }}>
          Want to sync your notes to the cloud?
        </Typography>
      </DialogTitle>
      <DialogContent>
        <p>This feature would push your todo's, note’s
          and snippets to the Stateful service and make them available anywhere you have Marquee or
          Stateful installed. If you’re interested click “yes”, otherwise - “No”. Thank you for the feedback!
        </p>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setShowCloudSyncFeature(false)}>No</Button>
        <Button onClick={() => {
          _isInterestedInSyncFeature()
          setShowCloudSyncFeature(false)
        }}>
          Yes
        </Button>
      </DialogActions>
    </DialogContainer>
  )
}

export default FeatureInterestDialog