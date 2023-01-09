import Document, { Head, Html, Main, NextScript } from 'next/document'
import { TITLE, DESCRIPTION, CANONICAL } from '../constants'
import { DefaultSeo } from 'next-seo'

export default class MyDocument extends Document {
  render () {
    return (
      <Html lang="en">
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

        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}
