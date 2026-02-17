import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Bible Verse Randomizer — Discover God's Word Daily",
    template: "%s | Bible Verse Randomizer",
  },
  description: "Discover beautiful Bible verses with our free random Bible verse generator. Get daily inspiration, search by topic, and share verses with friends. Multiple translations including KJV, NIV, ESV.",
  keywords: "bible verse randomizer, random bible verse generator, daily bible verse, bible verses by topic, scripture generator",
  metadataBase: new URL('https://bibleverserandomizer.com'),
  openGraph: {
    title: "Bible Verse Randomizer — Discover God's Word Daily",
    description: "Discover beautiful Bible verses daily with our free random verse generator",
    type: "website",
    url: "https://bibleverserandomizer.com",
    siteName: "Bible Verse Randomizer",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Bible Verse Randomizer — Discover God's Word Daily",
    description: "Discover beautiful Bible verses daily with our free random verse generator",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: { canonical: 'https://bibleverserandomizer.com' },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Rich structured data graph for E-E-A-T
  const schemaGraph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://bibleverserandomizer.com/#organization",
        "name": "Bible Verse Randomizer",
        "url": "https://bibleverserandomizer.com",
        "logo": {
          "@type": "ImageObject",
          "url": "https://bibleverserandomizer.com/logo.png",
          "width": 512,
          "height": 512,
        },
        "description": "Free Bible verse tools and comprehensive Scripture resources for daily study and inspiration.",
        "foundingDate": "2024",
        "sameAs": [],
      },
      {
        "@type": "WebSite",
        "@id": "https://bibleverserandomizer.com/#website",
        "url": "https://bibleverserandomizer.com",
        "name": "Bible Verse Randomizer",
        "publisher": { "@id": "https://bibleverserandomizer.com/#organization" },
        "inLanguage": "en-US",
        "potentialAction": {
          "@type": "SearchAction",
          "target": {
            "@type": "EntryPoint",
            "urlTemplate": "https://bibleverserandomizer.com/topics?q={search_term_string}",
          },
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@type": "WebApplication",
        "@id": "https://bibleverserandomizer.com/#app",
        "name": "Bible Verse Randomizer",
        "description": "Free random Bible verse generator with multiple translations, topic filtering, and 31,000+ verses",
        "url": "https://bibleverserandomizer.com",
        "applicationCategory": "UtilitiesApplication",
        "operatingSystem": "All",
        "browserRequirements": "Requires JavaScript",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD",
        },
        "publisher": { "@id": "https://bibleverserandomizer.com/#organization" },
      },
    ],
  };

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaGraph) }}
        />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}

