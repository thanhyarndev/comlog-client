import "./globals.css";
import TabNav from "@/components/TabNav";

export const metadata = {
  title: "Quản lí chi tiêu",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50 min-h-screen text-gray-800">
        <header className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              🍱 Hệ thống quản lý chi tiêu bữa ăn
            </h1>
            <p className="text-sm text-blue-100 mt-1">
              Giám sát, thống kê và quản lý chi phí một cách dễ dàng
            </p>
          </div>
        </header>
        <TabNav />
        <main className="max-w-7xl mx-auto px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
