import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";

const inter = Inter({
  subsets: ["latin"],
});

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://tri-vault.vercel.app";

export const metadata: Metadata = {
  title: "TriVault | Collect Seals on Base",
  description: "Collect 3 unique vault seals on Base chain. Complete the challenge and earn your seals!",
  openGraph: {
    title: "TriVault - Seal Collection Mini-App",
    description: "Collect 3 unique vault seals on Base chain. Complete the challenge and earn your seals!",
    images: [`${appUrl}/og-image.png`],
    siteName: "TriVault",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "TriVault - Seal Collection Mini-App",
    description: "Collect 3 unique vault seals on Base chain.",
    images: [`${appUrl}/og-image.png`],
  },
  other: {
    "fc:frame": JSON.stringify({
      version: "next",
      imageUrl: `${appUrl}/og-image.png`,
      button: {
        title: "🔐 Collect Seals",
        action: {
          type: "launch_frame",
          name: "TriVault",
          url: appUrl,
          splashImageUrl: `${appUrl}/splash.png`,
          splashBackgroundColor: "#030712",
        },
      },
    }),
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} antialiased bg-gray-950`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
