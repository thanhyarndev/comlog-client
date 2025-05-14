'use client';
import { useEffect, useState } from 'react';
import { format } from 'date-fns';
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
import { Check, Trash2, X } from 'lucide-react';
import {
  getAllExpenses,
  toggleExpenseCollected,
  deleteExpense,
} from '@/hooks/api/expense';
import type { Expense } from '@/types/expense';

export default function ExpenseList() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  const loadExpenses = async () => {
    try {
      const res = await getAllExpenses();
      setExpenses(res);
    } catch (err) {
      console.error('Lỗi khi tải dữ liệu chi phí:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExpenses();
  }, []);

  const handleTogglePaid = async (id: string) => {
    await toggleExpenseCollected(id);
    loadExpenses();
  };

  const handleRemove = async (id: string) => {
    await deleteExpense(id);
    loadExpenses();
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Ngày</TableHead>
            <TableHead>Tiêu đề</TableHead>
            <TableHead>Số tiền</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead className="text-right">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {expenses.map((expense) => {
            const { _id, title, date, totalAmount, totalReceived } = expense;
            const isFullyPaid = totalReceived >= totalAmount;
            const percentage = ((totalReceived / totalAmount) * 100).toFixed(0);

            return (
              <TableRow key={_id}>
                <TableCell>{format(new Date(date), 'dd/MM/yyyy')}</TableCell>
                <TableCell>{title}</TableCell>
                <TableCell>{totalAmount.toLocaleString()} ₫</TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <Badge variant={isFullyPaid ? 'default' : 'outline'}>
                      {`Đã thu: ${totalReceived.toLocaleString()} ₫ / ${totalAmount.toLocaleString()} ₫`}
                    </Badge>
                    {!isFullyPaid && (
                      <span className="text-xs text-yellow-600 font-medium">
                        ⚠ Chưa thu đủ ({percentage}%)
                      </span>
                    )}
                    {isFullyPaid && (
                      <span className="text-xs text-green-600 font-medium">
                        ✓ Đã thu đủ
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleTogglePaid(_id)}
                      title="Chuyển trạng thái đã/ chưa thu đủ"
                    >
                      {isFullyPaid ? (
                        <X className="h-4 w-4" />
                      ) : (
                        <Check className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleRemove(_id)}
                      className="text-red-500"
                      title="Xoá"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
          {!loading && expenses.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                Chưa có chi phí nào được thêm vào
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
