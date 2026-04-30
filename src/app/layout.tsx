// Root layout – wraps every page with shared HTML structure and global styles.
import type { Metadata } from 'next';
import './globals.css';

/** Page metadata shown in the browser tab */
export const metadata: Metadata = {
  title: 'Task Logger',
  description: 'A simple full-stack task management app built with Next.js',
};

/**
 * RootLayout wraps all pages.
 * Provides the <html> and <body> tags and imports global CSS.
 */
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        {/* Site-wide header */}
        <header className="site-header">
          <span>📝 Task Logger</span>
        </header>

        {/* Page content */}
        {children}
      </body>
    </html>
  );
}
