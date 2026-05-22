import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: "KidZone Staff Portal",
  description: "Dynamic staff & child attendance management with role-based access control.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3500,
            style: {
              background: "#fff",
              color: "#1F2937",
              border: "1px solid #E5E7EB",
              borderRadius: "0.75rem",
              fontSize: "0.875rem",
            },
          }}
        />
      </body>
    </html>
  );
}
