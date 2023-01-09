import App from 'next/app'
import { ChakraProvider } from '@chakra-ui/react'
import { IntercomProvider } from 'react-use-intercom'

import theme from '../theme'
import { Router } from 'next/router'
import { init, trackPageViewed } from '../utils/GoogleAnalytics'
import {  INTERCOM_APP_ID, GOOGLE_ANALYTICS_4_ID } from '../constants'
export default class MarqueeApp extends App {
  componentDidMount (){
    init(GOOGLE_ANALYTICS_4_ID)
    trackPageViewed(window.location.pathname + window.location.search)
  }
  componentDidUpdate (){
    Router.events.on('routeChangeComplete', () => {
      trackPageViewed(window.location.pathname + window.location.search)
    })
  }
  render () {
    const { Component, pageProps } = this.props

    return (
      <ChakraProvider resetCSS theme={theme}>

        <IntercomProvider appId={INTERCOM_APP_ID} autoBoot>
          <Component {...pageProps} />
        </IntercomProvider>
      </ChakraProvider>
    )
  }
}
