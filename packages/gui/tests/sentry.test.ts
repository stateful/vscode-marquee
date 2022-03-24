import * as Sentry from "@sentry/react"
import { Integrations } from "@sentry/tracing"
import { CaptureConsole } from "@sentry/integrations"

import SentryModule from '../src/sentry'

jest.mock('../src/constants', () => ({
  SENTRY_DNS: 'SENTRY_DNS'
}))

beforeEach(() => {
  (Sentry.configureScope as jest.Mock).mockClear()
})

test('init', () => {
  SentryModule.init()
  expect((Sentry.init as jest.Mock).mock.calls[0][0]).toMatchSnapshot()
  expect(Sentry.configureScope).toBeCalledTimes(0)
  expect(Integrations.BrowserTracing).toBeCalledTimes(1)
  expect(CaptureConsole).toBeCalledTimes(1)
  SentryModule.init('foobar')
  expect(Sentry.configureScope).toBeCalledTimes(1)
})

test('setUserID', () => {
  // @ts-expect-error param test
  SentryModule.setUserID()
  expect(Sentry.configureScope).toBeCalledTimes(0)
  SentryModule.setUserID('foobar')
  expect(Sentry.configureScope).toBeCalledTimes(1)
})
