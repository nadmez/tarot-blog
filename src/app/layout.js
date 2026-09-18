import { Inter, Playfair_Display } from "next/font/google";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import "./globals.css";

const playfairDisplay = Playfair_Display({
  variable: "--font-heading-family",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-body-family",
  subsets: ["latin"],
});

export const metadata = {
  title: "Tarot Falı | Sezgisel Tarot Okumaları ve Rehberlik",
  description:
    "Tarot kartları, açılımlar ve sezgisel okumalar üzerine rehberlik, açılım kılavuzları ve blog yazıları.",
  openGraph: {
    title: "Tarot Falı | Sezgisel Tarot Okumaları ve Rehberlik",
    description:
      "Tarot kartları, açılımlar ve sezgisel okumalar üzerine rehberlik, açılım kılavuzları ve blog yazıları.",
    locale: "tr_TR",
    siteName: "Tarot Falı",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="tr" className={`${playfairDisplay.variable} ${inter.variable} antialiased`}>
      <body className="flex min-h-screen flex-col bg-background text-foreground">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
