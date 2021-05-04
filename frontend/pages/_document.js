import React from 'react';
import Document, { Head, Main, NextScript } from 'next/document';
import { ServerStyleSheets } from '@material-ui/styles';

export const title = 'Dock Certs';
const description = 'Its good, yes?';
const url = 'https://certs.dock.io';
const thumbnail = `${url}/static/graphics/thumbnail.png`;

const GTM_ID = 'GTM-MD769WT';

export default class MyDocument extends Document {
  render() {
    return (
      <html lang="en">
        <Head>
          {/* Google Tag Manager */}
          <script
            dangerouslySetInnerHTML={{
              __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','${GTM_ID}');`,
            }}
          />
          {/* End Google Tag Manager */}

          {/* Progressive Web App: Match the width of app’s content with width of viewport for mobile devices */}
          <meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width" />

          {/* Progressive Web App: Have address bar match brand colors */}
          <meta name="theme-color" content="#fff" />

          {/* Progressive Web App: Provide manifest file for metadata */}
          <link rel="manifest" href="/static/manifest.json" />

          {/* Roboto and icons fonts */}
          <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap" />
          <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons" />

          {/* SEO: App description for search-engine optimization */}
          <meta name="Description" content={description} />

          {/* Bonus: Have beautiful preview tiles when users share your website on social media */}
          <meta property="og:title" content={title} />
          <meta property="og:description" content={description} />
          <meta property="og:image" content={thumbnail} />
          <meta property="og:type" content="website" />
          <meta property="og:url" content={url} />
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content={title} />
          <meta name="twitter:description" content={description} />
          <meta name="twitter:image" content={thumbnail} />

          {/* Bonus: Have app icon and splash screen for PWAs saved to homescreen on iOS devices */}
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-status-bar-style" content="black" />
          <link
            rel="apple-touch-icon"
            sizes="57x57"
            href="/static/graphics/icon-57.png"
          />
          <link
            rel="apple-touch-icon"
            sizes="72x72"
            href="/static/graphics/icon-72.png"
          />
          <link
            rel="apple-touch-icon"
            sizes="114x114"
            href="/static/graphics/icon-114.png"
          />
          <link
            rel="apple-touch-icon"
            sizes="144x144"
            href="/static/graphics/icon-144.png"
          />
          <link
            rel="apple-touch-icon"
            sizes="512x512"
            href="/static/graphics/icon-512.png"
          />
          <link
            href="/static/graphics/splash-2048.png"
            media="(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2)"
            rel="apple-touch-startup-image"
          />
          <link
            href="/static/graphics/splash-1668.png"
            media="(device-width: 834px) and (device-height: 1112px) and (-webkit-device-pixel-ratio: 2)"
            rel="apple-touch-startup-image"
          />
          <link
            href="/static/graphics/splash-1536.png"
            media="(device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2)"
            rel="apple-touch-startup-image"
          />
          <link
            href="/static/graphics/splash-1125.png"
            media="(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3)"
            rel="apple-touch-startup-image"
          />
          <link
            href="/static/graphics/splash-1242.png"
            media="(device-width: 414px) and (device-height: 736px) and (-webkit-device-pixel-ratio: 3)"
            rel="apple-touch-startup-image"
          />
          <link
            href="/static/graphics/splash-750.png"
            media="(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2)"
            rel="apple-touch-startup-image"
          />
          <link
            href="/static/graphics/splash-640.png"
            media="(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2)"
            rel="apple-touch-startup-image"
          />

          {/* Performance: Inject the page’s critical CSS in the <head> tag */}
          {this.props.styleTags}
        </Head>
        <body>
          <Main />
          <NextScript />

          {/* Google Tag Manager (noscript) */}
          <noscript
            dangerouslySetInnerHTML={{
              __html: `<iframe src="https://www.googletagmanager.com/ns.html?id=${GTM_ID}" height="0" width="0" style="display:none;visibility:hidden"></iframe>`,
            }}
          />
          {/* End Google Tag Manager (noscript) */}
        </body>
      </html>
    );
  }
}

MyDocument.getInitialProps = async (ctx) => {
  // Render app and page and get the context of the page with collected side effects.
  const sheets = new ServerStyleSheets();
  const originalRenderPage = ctx.renderPage;

  ctx.renderPage = () => originalRenderPage({
    enhanceApp: (App) => (props) => sheets.collect(<App {...props} />),
  });

  const initialProps = await Document.getInitialProps(ctx);

  return {
    ...initialProps,
    // Styles fragment is rendered after the app and page rendering finish.
    styles: [
      <React.Fragment key="styles">
        {initialProps.styles}
        {sheets.getStyleElement()}
      </React.Fragment>,
    ],
  };
};
