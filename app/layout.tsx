import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bible Verse Randomizer — Discover God's Word Daily",
  description: "Discover beautiful Bible verses with our free random Bible verse generator. Get daily inspiration, search by topic, and share verses with friends. Multiple translations including KJV, NIV, ESV.",
  keywords: "bible verse randomizer, random bible verse generator, daily bible verse, bible verses by topic, scripture generator",
  openGraph: {
    title: "Bible Verse Randomizer — Discover God's Word Daily",
    description: "Discover beautiful Bible verses daily with our free random verse generator",
    type: "website",
    url: "https://bibleverserandomizer.com",
  },
  twitter: {
    card: "summary_large_image",
    title: "Bible Verse Randomizer — Discover God's Word Daily",
    description: "Discover beautiful Bible verses daily with our free random verse generator",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "Bible Verse Randomizer",
              "description": "Free random Bible verse generator with multiple translations and topic filtering",
              "url": "https://bibleverserandomizer.com",
              "applicationCategory": "UtilitiesApplication",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
              }
            })
          }}
        />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
