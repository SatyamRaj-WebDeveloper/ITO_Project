
import './globals.css'; 

export const metadata = {
  title: 'India Trade Overseas - Operating System',
  description: 'Corporate operating infrastructure for sales tracking and automation.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="bg-slate-50 text-slate-900 antialiased min-h-screen flex flex-col m-0 p-0">
        {children}
      </body>
    </html>
  );
}