"use client";

export default function NewLoginLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Return children directly, bypassing the AuthLayout used for other auth pages
  return <>{children}</>;
}
