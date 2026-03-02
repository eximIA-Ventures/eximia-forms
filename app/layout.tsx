import type { Metadata } from "next";
import "./globals.css";
import { ThemeScript } from "@/components/theme-script";

export const metadata: Metadata = {
  title: "eximIA Forms",
  description: "O form builder AI-first que entende suas respostas",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
        <ThemeScript />
      </head>
      <body className="min-h-screen bg-bg text-primary antialiased">
        {children}
      </body>
    </html>
  );
}
