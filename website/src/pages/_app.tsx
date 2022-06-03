import App from 'next/app'
import Head from 'next/head'
import { ChakraProvider } from '@chakra-ui/react'
import { DefaultSeo } from 'next-seo'
import { IntercomProvider } from 'react-use-intercom'

import theme from '../theme'
import { TITLE, DESCRIPTION, CANONICAL, INTERCOM_APP_ID } from '../constants'
import {useAnalytics} from '../components/UseAnalytics'
import { Router } from 'next/router'
const {init, trackPageViewed} = useAnalytics()
export default class MarqueeApp extends App {
  componentDidMount (){
    init('G-Y4EB2N534S')
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
        <Head>
          <meta charSet="utf-8" />
          <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
          <meta
            name="viewport"
            content="width=device-width,initial-scale=1,minimum-scale=1,maximum-scale=1,user-scalable=no" />

          <link rel="manifest" href="/site.webmanifest" />
          <link
            href="/favicon/favicon-16x16.png"
            rel="icon"
            type="image/png"
            sizes="16x16"
          />
          <link
            href="/favicon/favicon-32x32.png"
            rel="icon"
            type="image/png"
            sizes="32x32"
          />
          <link rel="apple-touch-icon" href="/favicon/apple-touch-icon.png"></link>
          <meta name="theme-color" content="#1a1f2c" />
        </Head>
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
        <IntercomProvider appId={INTERCOM_APP_ID} autoBoot>
          <Component {...pageProps} />
        </IntercomProvider>
      </ChakraProvider>
    )
  }
}
