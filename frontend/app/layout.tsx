import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TMF Stock",
  description: "Frontend Next.js pour TMF Stock (auth + CRUD minimal)."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body
        style={{
          margin: 0,
          fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
          backgroundColor: "#F8FAFB",
          color: "#344D59"
        }}
      >
        {children}
      </body>
    </html>
  );
}


