// src/components/ExpenseList.tsx
'use client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { format } from 'date-fns';
import { Check, Trash2, X } from 'lucide-react';
import type { Expense } from '../app/data/mockData';

interface Props {
  data: Expense[];
  onTogglePaid: (id: string) => void;
  onRemove: (id: string) => void;
}

export default function ExpenseList({ data, onTogglePaid, onRemove }: Props) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Ngày</TableHead>
            <TableHead>Nhân viên</TableHead>
            <TableHead>Số tiền</TableHead>
            <TableHead>Mô tả</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead className="text-right">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map(expense => {
            const total = expense.employees.reduce((sum, e) => sum + e.amount, 0);
            const empNames = expense.employees.map(e => e.name).join(', ');
            return (
              <TableRow key={expense.id}>
                <TableCell>{format(new Date(expense.date), 'dd/MM/yyyy')}</TableCell>
                <TableCell>{empNames}</TableCell>
                <TableCell>{total.toLocaleString()} ₫</TableCell>
                <TableCell>{expense.description || '-'}</TableCell>
                <TableCell>
                  <Badge variant={expense.isCollected ? 'default' : 'outline'}>
                    {expense.isCollected ? 'Đã thanh toán' : 'Chưa thanh toán'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => onTogglePaid(expense.id)}
                      title={expense.isCollected ? 'Đánh dấu chưa thanh toán' : 'Đánh dấu đã thanh toán'}
                    >
                      {expense.isCollected ? <X className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => onRemove(expense.id)}
                      className="text-red-500"
                      title="Xóa"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
          {data.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                Chưa có chi phí nào được thêm vào
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
