import { Options } from '@wdio/types'
import { config as baseConfig } from './wdio.conf'

export const config: Options.Testrunner = {
  ...baseConfig,
  capabilities: [{
    browserName: 'chrome',
    'goog:chromeOptions': {
      args: process.env.CI
        ? ['--headless', '--disable-gpu', '--window-size=1440,735']
        : []
    },
    'wdio:vscodeOptions': baseConfig.capabilities[0]['wdio:vscodeOptions']
  }],
  mochaOpts: {
    ...baseConfig.mochaOpts,
    grep: 'skipWeb',
    invert: true
  }
}
