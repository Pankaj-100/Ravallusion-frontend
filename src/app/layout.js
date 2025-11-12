
import localFont from "next/font/local";
import "./globals.css";
import { Alexandria } from 'next/font/google'
import LayoutWrapper from "@/components/LayoutWrapper";
import NetworkStatus from "@/components/common/NetworkStatus";




const alexandria = Alexandria({
  subsets: ['latin'],
  weight: ['900', '900'],
});


const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata = {
  title: "Ravallusion",
  description: "Ravallusion course website",
  icons: {
    icon: [{ url: '/favicon_io/favicon.ico' }],
  },
};

export default function RootLayout({ children }) {

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${alexandria.variable}  antialiased`}
      >
        <LayoutWrapper>
          <NetworkStatus /> 
          {children}
        </LayoutWrapper>
      </body>
    </html>
  );
}
