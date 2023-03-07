import React from 'react'
import { Grid, Button } from '@mui/material'

export default function InstallRunme () {
  return (<Grid
    container
    style={{ height: '100%' }}
    alignItems="center"
    justifyContent="center"
    direction="row"
  >
    <Grid item style={{ width: '40%', textAlign: 'center' }}>
      <img
        src={'../packages/widget-runme/src/img/runme.png'}
        alt="Runme"
      />
    </Grid>
    <Grid item style={{ width: 'calc(60% - 25px)', padding: '0 25px 0 0' }}>
      <h1
        style={{
          backgroundImage: 'linear-gradient(to right, #c084fc, #db2777)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          color: 'transparent',
          fontSize: '3em',
          display: 'inline-block',
          margin: 0
        }}
      >
        runme
      </h1>
      <h3>Everything a markdown file can do and way more. No changes required.</h3>
      <p>Install native VS Code support for Runme 🚀</p>
      <p>
        <Button
          component={'a'}
          style={{ color: '#fff' }}
          // eslint-disable-next-line max-len
          href="vscode://stateful.runme?command=setup&fileToOpen=https://gist.githubusercontent.com/christian-bromann/df97ce3dace21564ffdf1900400ec099/raw/0a9b29c979d61e17032c855b04dbc4f5b962f847/ThankYou.md"
        >
          Add to VS Code
        </Button>
      </p>
    </Grid>
  </Grid>)
}
