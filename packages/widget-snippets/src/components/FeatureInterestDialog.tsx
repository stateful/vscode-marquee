import { Button, DialogActions, Typography } from '@mui/material'
import { DialogContainer, DialogTitle } from '@vscode-marquee/dialog'
import React from 'react'

interface FeatureInterestDialogProps {
  setShowCloudSyncFeature: (show: boolean) => void
  _isInterestedInSyncFeature: (interest: boolean) => void
}
const FeatureInterestDialog = ({ setShowCloudSyncFeature, _isInterestedInSyncFeature }: FeatureInterestDialogProps) => {
  return (
    <DialogContainer fullWidth={true} onClose={() => setShowCloudSyncFeature(false)} >
      <DialogTitle onClose={() => setShowCloudSyncFeature(false)} >
        <Typography style={{ width: '85%', fontWeight: 'bold' }}>
          Do you want to sync your Notes, Todos and Clipboard Snippets across multiple machines?
        </Typography>
      </DialogTitle>
      <DialogActions>
        <Button onClick={() => {
          _isInterestedInSyncFeature(false)
          setShowCloudSyncFeature(false)
        }}>No</Button>
        <Button onClick={() => {
          _isInterestedInSyncFeature(true)
          setShowCloudSyncFeature(false)
        }}>
          Yes
        </Button>
      </DialogActions>
    </DialogContainer>
  )
}

export default FeatureInterestDialog