import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mayank Soni | Mayankkreative Portfolio",
  description: "Mayank Soni - Developer & Digital Strategist. Building Brands, Automating Operations, & Crafting Digital Experiences.",
  keywords: ["Mayank Soni", "Mayankkreative", "Web Developer", "Digital Strategist", "Automation", "Portfolio"],
  openGraph: {
    title: "Mayank Soni | Mayankkreative Portfolio",
    description: "Building Brands, Automating Operations, & Crafting Digital Experiences.",
    url: "https://www.mayankkreative.com",
    siteName: "Mayankkreative",
    images: [
      {
        url: "/img/person/avatar.jpg", // Ensure this path is correct for OG image
        width: 800,
        height: 600,
      },
    ],
    locale: "en_US",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${outfit.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
