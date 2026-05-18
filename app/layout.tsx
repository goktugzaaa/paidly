import type { Metadata, Viewport } from "next";
import { Inter, Instrument_Serif } from "next/font/google";
import "./globals.css";
import { I18nProvider } from "@/lib/i18n/context";
import { getLocale } from "@/lib/i18n/server";
import { FlashToast } from "@/components/Toast";
import { ThemeProvider } from "@/components/ThemeProvider";

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  display: "swap",
  variable: "--font-inter",
});

const serif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-serif",
});

export const metadata: Metadata = {
  title: {
    default: "Nib — Invoices & clients in one place",
    template: "%s · Nib",
  },
  description:
    "A lightweight workspace for freelancers and small agencies. Track clients, send PDF invoices, and watch revenue land — without spreadsheets.",
  applicationName: "Nib",
  keywords: [
    "invoice",
    "freelancer",
    "saas",
    "client management",
    "pdf invoice",
    "billing",
  ],
  authors: [{ name: "Nib" }],
  openGraph: {
    title: "Nib — Invoices & clients in one place",
    description:
      "Track clients, send PDF invoices, get paid. Built for freelancers and small agencies.",
    type: "website",
    siteName: "Nib",
  },
  twitter: {
    card: "summary_large_image",
    title: "Nib — Invoices & clients in one place",
    description:
      "Track clients, send PDF invoices, get paid. Built for freelancers and small agencies.",
  },
};

export const viewport: Viewport = {
  themeColor: "#1f3df5",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  return (
    <html lang={locale} className={`${inter.variable} ${serif.variable}`} suppressHydrationWarning>
      <head>
        {/* Flash-of-wrong-theme prevention: read stored theme before paint */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var s=localStorage.getItem('nib-theme');var t=s||'system';var d=t==='dark'||(t==='system'&&window.matchMedia('(prefers-color-scheme: dark)').matches);if(d){document.documentElement.classList.add('dark');document.documentElement.style.colorScheme='dark';}else{document.documentElement.style.colorScheme='light';}}catch(e){}})();`,
          }}
        />
      </head>
      <body className="font-sans">
        <ThemeProvider>
          <I18nProvider locale={locale}>
            {children}
            <FlashToast />
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
