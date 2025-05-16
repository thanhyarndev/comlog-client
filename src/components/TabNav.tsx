'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const tabs = [
  { label: 'Expenses', path: '/expenses' },
  { label: 'Weekly Summary', path: '/summary' },
  { label: 'Employees', path: '/employees' },
];

export default function TabNav() {
  const pathname = usePathname();
  return (
    <nav className="bg-white border-b">
      <ul className="flex space-x-4 p-4">
        {tabs.map(tab => (
          <li key={tab.path}>
            <Link href={tab.path} className={pathname === tab.path ? 'font-semibold text-blue-600' : 'text-gray-600'}>
              {tab.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}