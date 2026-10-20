import './globals.css';
import Shell from '../components/Shell';

export const metadata = { title: 'My Panel' };

export default function RootLayout({ children }) {
  return (
    <html lang="en" dir="ltr" data-ac-icons="/aramin/icons.svg" suppressHydrationWarning>
      <head>
        {/* Applies the saved theme/lang before first paint. Must be a classic script in <head>. */}
        <script src="/aramin/aramin-console-boot.js" />
        <link rel="stylesheet" href="/aramin/aramin-console.min.css" />
      </head>
      <body>
        <Shell>{children}</Shell>
      </body>
    </html>
  );
}
