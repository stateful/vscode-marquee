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
          Would you like to have the optional auth and sync notes/todos with the Stateful Backend ?
        </Typography>
      </DialogTitle>
      <DialogContent>
        <p>Cloud sync feature will sync your todos, notes and clipboard/snippets from the Stateful Extension.
          If you are interested in this feature press yes, if not interested press no.
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