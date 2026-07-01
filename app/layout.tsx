import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Katha - Stories That Must Not Be Forgotten",
  description: "Preserving dying oral folk tales for future generations",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}

// Made with Bob
