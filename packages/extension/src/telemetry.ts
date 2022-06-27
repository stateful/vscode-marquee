import TelemetryReporter, { TelemetryEventProperties, TelemetryEventMeasurements } from '@vscode/extension-telemetry'

import { pkg, EXTENSION_ID } from '@vscode-marquee/utils/extension'

// injected by webpack
declare const INSTRUMENTATION_KEY: string
declare const INSTRUMENTATION_KEY_NEW: string

const reporter = INSTRUMENTATION_KEY
  ? {
    sendTelemetryEvent: (
      eventName: string,
      properties?: TelemetryEventProperties,
      measurements?: TelemetryEventMeasurements
    ) => {
      const oldReporter = new TelemetryReporter(
        EXTENSION_ID,
        pkg.version,
        INSTRUMENTATION_KEY
      )
      const newReporter = new TelemetryReporter(
        EXTENSION_ID,
        pkg.version,
        INSTRUMENTATION_KEY_NEW
      )

      /**
       * let's publish telemetry to both accounts until we captured
       * sufficient data on the new app insights deployment
       */
      oldReporter.sendTelemetryEvent(eventName, properties, measurements)
      newReporter.sendTelemetryEvent(eventName, properties, measurements)
    }
  }
  : {
    // noop
    sendTelemetryEvent: () => {}
  }

export default reporter as Pick<TelemetryReporter, 'sendTelemetryEvent'>
