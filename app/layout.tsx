import './globals.css';
import AppShell from '../components/AppShell';

export const metadata = {
  title: 'CheaperFind',
  description: 'Drop a product photo or link. Find cheaper alternatives instantly.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en" suppressHydrationWarning><body><AppShell>{children}</AppShell></body></html>;
}
