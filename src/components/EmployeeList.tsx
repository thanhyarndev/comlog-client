'use client';
import React from 'react';
import type { Employee } from '@/types/employee';
import { User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Props {
  data: Employee[];
}

export default function EmployeeList({ data }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {data.map(emp => (
        <div
          key={emp.id}
          className="flex items-center justify-between border rounded-lg p-4 hover:shadow-sm transition"
        >
          <div className="flex items-center space-x-3">
            <User
              className={emp.gender === 'male' ? 'text-blue-500' : 'text-pink-500'}
              strokeWidth={2}
            />
            <div>
              <div className="font-semibold text-sm">{emp.name}</div>
              {emp.alias && <div className="text-muted-foreground text-xs">({emp.alias})</div>}
            </div>
          </div>
          <Badge variant={emp.gender === 'male' ? 'outline' : 'secondary'}>
            {emp.gender === 'male' ? 'Nam' : 'Nữ'}
          </Badge>
        </div>
      ))}
    </div>
  );
}
