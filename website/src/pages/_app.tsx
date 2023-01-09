import App from 'next/app'
import { ChakraProvider } from '@chakra-ui/react'
import { IntercomProvider } from 'react-use-intercom'

import theme from '../theme'
import { Router } from 'next/router'
import { init, trackPageViewed } from '../utils/GoogleAnalytics'
import {  INTERCOM_APP_ID, GOOGLE_ANALYTICS_4_ID } from '../constants'
import { TITLE, DESCRIPTION, CANONICAL } from '../constants'
import { DefaultSeo } from 'next-seo'
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
      <>
        <DefaultSeo
          title={TITLE}
          description={DESCRIPTION}
          canonical={CANONICAL}

          openGraph={{
            url: CANONICAL,
            title: TITLE,
            description: DESCRIPTION,
            images: [{
              url: `${CANONICAL}/assets/screenshot.png`,
              width: 1200,
              height: 744,
              alt: 'Marquee Extension',
              type: 'image/png',
            }],
            site_name: TITLE,
          }}
          twitter={{
            handle: '@statefulhq',
            site: '@statefulhq',
            cardType: 'summary_large_image'
          }}
        />
        <ChakraProvider resetCSS theme={theme}>
          <IntercomProvider appId={INTERCOM_APP_ID} autoBoot>
            <Component {...pageProps} />
          </IntercomProvider>
        </ChakraProvider>
      </>
    )
  }
}
