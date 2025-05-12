import "./globals.css";
import TabNav from "@/components/TabNav";

export const metadata = {
  title: 'Meal Expense Management',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="p-4 bg-gray-100">
          <h1 className="text-2xl font-bold">Company Meal Expense Tracker</h1>
        </header>
        <TabNav />
        <main className="p-6">{children}</main>
      </body>
    </html>
  );
}