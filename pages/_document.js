import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Google Site Verification */}
        <meta
          name="google-site-verification"
          content="ocZ4mt2LvoDiiVPgHc1_y4gvd8uJ5Z9s3mMaSqQe9Vs"
        />

        {/* Basic SEO */}
        <meta
          name="description"
          content="NasPro Pvt (naspropvt) provides professional IT services, software development, and digital solutions. Discover why businesses trust NasPro for IT services."
        />
        <meta
          name="keywords"
          content="naspropvt, naspro, IT service, IT solutions, IT company, software development, technology support"
        />

        {/* Open Graph for Social Sharing */}
        <meta property="og:title" content="NasPro Pvt | IT Services & Solutions" />
        <meta
          property="og:description"
          content="Professional IT services by NasPro Pvt. We deliver software solutions, IT consulting, and digital support."
        />
        <meta property="og:url" content="https://naspropvt.vercel.app" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="NasPro Pvt" />
        <meta property="og:locale" content="en_US" />

        {/* Twitter Card for Sharing */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="NasPro Pvt | IT Services & Solutions" />
        <meta
          name="twitter:description"
          content="NasPro Pvt offers IT services, software solutions, and technology consulting."
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
            }
            
