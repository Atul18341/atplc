import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from "next/font/google";
import { AuthContextProvider } from "./Context/AuthContext";
import { AppContextProvider } from './Context/AppContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import "./globals.css";
import Header from './components/Header/Header';
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});
export const metadata: Metadata = {
  title: 'ATPLC Portal',
  description: 'A Technical & Practical Learning Portal',
  manifest: '/manifest.json', // Connects the web manifest configuration file
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'ATPLC Portal',
  },
};

export const viewport: Viewport = {
  themeColor: '#1e3a8a',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      
      <body className="min-h-full flex flex-col">
        <AuthContextProvider>
          <AppContextProvider>
        <Header/>
        {children}
        <ToastContainer 
          position="top-right"
          autoClose={4000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
        </AppContextProvider>
        </AuthContextProvider>
        </body>
    </html>
  );
}
