import * as Sentry from '@sentry/react'
import { Integrations } from '@sentry/tracing'
import { CaptureConsole } from '@sentry/integrations'

import { SENTRY_DNS } from './constants'

function init (userID?: string, location: 'extensionHost' | 'webview' = 'webview') {
  const env = process.env.NODE_ENV === 'development'
    ? 'development'
    : 'production'

  Sentry.init({
    dsn: SENTRY_DNS,
    beforeSend (event){
      if(event.environment === 'development'){
        return null
      }
      return event
    },
    integrations: [
      new Integrations.BrowserTracing(),
      new CaptureConsole({ levels: ['error'] }),
    ],
    environment: env,
    tracesSampleRate: 1,
  })

  Sentry.configureScope((scope) => {
    scope.setTag('occurred', location)
  })

  if (userID) {
    Sentry.configureScope((scope) => {
      scope.setUser({ id: userID })
    })
  }
}

function setUserID (userID: string) {
  if (!userID) {
    return
  }

  Sentry.configureScope((scope) => {
    scope.setUser({ id: userID })
  })
}

export default { init, setUserID }
