import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Micaela Sampaio | Clube + Estética 3.0",
  description: "Sistema de Contratos - Clube + Estética 3.0",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt">
      <body>
        {children}
      </body>
    </html>
  );
}
