import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="pt-BR">
      <Head>
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9683441595888028"
          crossOrigin="anonymous"
        ></script>
        <script
          async
          custom-element="amp-ad"
          src="https://cdn.ampproject.org/v0/amp-ad-0.1.js"
        ></script>
      </Head>
      <body>
        <div
          dangerouslySetInnerHTML={{
            __html: `
              <amp-ad
                width="100vw"
                height="320"
                type="adsense"
                data-ad-client="ca-pub-9683441595888028"
                data-ad-slot="7995557049"
                data-auto-format="rspv"
                data-full-width="">
                <div overflow=""></div>
              </amp-ad>
            `
          }}
        />
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
