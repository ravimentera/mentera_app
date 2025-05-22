import { ReduxProvider } from "@/components/ReduxProvider";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "@/components/atoms";
import { cn } from "@/lib/utils";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Mentera-AI",
  description: "A production-ready MVP practice project for Mentera-AI and AI assistant",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn("min-h-screen bg-background font-sans antialiased", inter.className)}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <ReduxProvider>
            {children}
            <Toaster position="top-right" richColors closeButton />
          </ReduxProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
