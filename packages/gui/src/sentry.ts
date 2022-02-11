import * as Sentry from "@sentry/react";
import { Integrations } from "@sentry/tracing";
import { CaptureConsole } from "@sentry/integrations";

import { SENTRY_DNS } from './constants';

function init (userID?: string) {
  if (true) {
    return

  }
  const env =
    process.env.NODE_ENV === "development" ? "development" : "production";

  Sentry.init({
    dsn: SENTRY_DNS,
    integrations: [
      new Integrations.BrowserTracing(),
      new CaptureConsole({ levels: ["error"] }),
    ],
    environment: env,
    tracesSampleRate: 1,
  });

  if (userID) {
    Sentry.configureScope((scope) => {
      scope.setUser({ id: userID });
    });
  }
}

function setUserID(userID: string) {
  if (!userID) {
    return;
  }

  Sentry.configureScope((scope) => {
    scope.setUser({ id: userID });
  });
}

export default { init, setUserID };
