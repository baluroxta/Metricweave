import type { Metadata } from "next";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "MetricWeave AI — From raw data to clear decisions",
  description: "Upload your data, profile quality, generate tailored business dashboards, and export native Microsoft Power BI Desktop projects.",
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "MetricWeave AI — From raw data to clear decisions",
    description: "Enterprise AI dashboard generator with native Microsoft Power BI Desktop (.pbip) export.",
    siteName: "MetricWeave AI",
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
    <html lang="en" className="h-full dark" suppressHydrationWarning>
      <head />
      <body className="flex min-h-full flex-col bg-background text-foreground antialiased font-sans">
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
