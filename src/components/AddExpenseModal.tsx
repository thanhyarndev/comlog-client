'use client';
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import type {  Expense } from '../app/data/mockData';
import { cn } from '@/lib/utils';
import type { Employee } from '@/types/employee';

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (expense: Omit<Expense, 'id' | 'isCollected'>) => void;
}

export default function AddExpenseModal({ open, onClose, onSave }: Props) {
  const [date, setDate] = useState<Date>(new Date());
  const [selection, setSelection] = useState<Record<string, number>>({});
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (open) {
      setDate(new Date());
      setSelection({});
      setDescription('');
    }
  }, [open]);

  const toggleEmp = (id: string) => {
    setSelection(prev => {
      const next = { ...prev };
      if (id in next) delete next[id];
      else next[id] = 0;
      return next;
    });
  };

  const updateAmt = (id: string, v: string) => {
    const amt = parseInt(v, 10) || 0;
    setSelection(prev => ({ ...prev, [id]: amt }));
  };

  const total = Object.values(selection).reduce((a, b) => a + b, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const items = Object.entries(selection).map(([id, amount]) => {
      const emp = employees.find(x => x.id === id)!;
      return { id, name: emp.name, amount };
    });
    onSave({ date: format(date, 'yyyy-MM-dd'), employees: items, description });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogTitle>Add Expense</DialogTitle>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-1">
            <Label>Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn('w-full justify-start text-left')}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(date, 'dd/MM/yyyy')}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="p-0">
                <Calendar mode="single" selected={date} onSelect={d => d && setDate(d)} />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-1">
            <Label>Employees</Label>
            <div className="border p-2 rounded max-h-48 overflow-y-auto">
              {employees.map(emp => (
                <div key={emp.id} className="flex items-center space-x-2 mb-1">
                  <input
                    type="checkbox"
                    checked={emp.id in selection}
                    onChange={() => toggleEmp(emp.id)}
                  />
                  <span className="flex-1">{emp.name}</span>
                  <Input
                    type="number"
                    placeholder="0"
                    disabled={!(emp.id in selection)}
                    value={(selection[emp.id] || '').toString()}
                    onChange={e => updateAmt(emp.id, e.target.value)}
                    className="w-20"
                  />
                </div>
              ))}
            </div>
            <div className="text-right text-sm">Total: {total.toLocaleString()} ₫</div>
          </div>

          <div className="space-y-1">
            <Label>Description</Label>
            <Textarea
              placeholder="Description (optional)"
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit">Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
