import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Wage Data Assistant",
  description: "AI-powered wage data chat — Student Reality Lab (BLS data, 2010–2025)",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
