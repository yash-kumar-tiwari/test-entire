import "./globals.css";

export const metadata = {
  title: "Bookmarks",
  description: "Save and share your favorite links",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
