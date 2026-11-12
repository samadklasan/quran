import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Quran — Arabic, English & Roman Urdu",
  description: "Read the Quran with Arabic text, English translation, and Roman Urdu translation together.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
