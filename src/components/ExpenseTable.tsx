'use client';
import React from 'react';
import type { Expense } from '../app/data/mockData';
import { Button } from '@/components/ui/button';

interface Props {
  data: Expense[];
  onToggleCollected: (id: string) => void;
}

export default function ExpenseTable({ data, onToggleCollected }: Props) {
  return (
    <table className="w-full">
      <thead className="bg-gray-100">
        <tr>
          <th className="p-2">Date</th>
          <th className="p-2">Total</th>
          <th className="p-2">Collected</th>
          <th className="p-2">Description</th>
          <th className="p-2">Actions</th>
        </tr>
      </thead>
      <tbody>
        {data.map(exp => {
          const total = exp.employees.reduce((sum, it) => sum + it.amount, 0);
          return (
            <tr key={exp.id} className="border-t">
              <td className="p-2">{formatDate(exp.date)}</td>
              <td className="p-2">{total.toLocaleString()} ₫</td>
              <td className="p-2">{exp.isCollected ? '✅' : '❌'}</td>
              <td className="p-2">{exp.description}</td>
              <td className="p-2">
                <Button size="sm" onClick={() => onToggleCollected(exp.id)}>
                  {exp.isCollected ? 'Uncollect' : 'Collect'}
                </Button>
              </td>
            </tr>
          );
        })}
        {!data.length && (
          <tr>
            <td colSpan={5} className="p-4 text-center text-gray-500">
              No expenses recorded.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}

function formatDate(date: string) {
  const [y, m, d] = date.split('-');
  return `${d}/${m}/${y}`;
}