import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "soundcloud-widget-react — Demo",
  description: "Live demo of soundcloud-widget-react v2.0.0 features",
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
