import TelemetryReporter from '@vscode/extension-telemetry'

import { pkg, EXTENSION_ID } from '@vscode-marquee/utils/extension'

// injected by webpack
declare const INSTRUMENTATION_KEY: string

const reporter = INSTRUMENTATION_KEY
  ? new TelemetryReporter(
    EXTENSION_ID,
    pkg.version,
    INSTRUMENTATION_KEY
  )
  : {
    // noop
    sendTelemetryEvent: () => {}
  }

export default reporter as Pick<TelemetryReporter, 'sendTelemetryEvent'>
