'use client';
import React, { useState } from 'react';
import { format } from 'date-fns';
import { CalendarIcon, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import type { Employee, ExpenseItem } from '../app/data/mockData';

interface Props {
  employees: Employee[];
  onSubmit: (expense: { date: string; employees: ExpenseItem[]; description?: string }) => void;
  onCancel: () => void;
}

export default function ExpenseForm({ employees, onSubmit, onCancel }: Props) {
  const [date, setDate] = useState<Date>(new Date());
  const [selection, setSelection] = useState<Record<string, number>>({});
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [search, setSearch] = useState('');

  const toggleEmployee = (id: string) => {
    setSelection(prev => {
      const next = { ...prev };
      if (id in next) delete next[id];
      else next[id] = 10000; // mặc định mỗi người 10.000
      return next;
    });
  };

  const updateAmount = (id: string, value: string) => {
    const amt = parseInt(value, 10) || 0;
    setSelection(prev => ({ ...prev, [id]: amt }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!date) newErrors.date = 'Vui lòng chọn ngày';
    if (Object.keys(selection).length === 0) newErrors.employees = 'Chọn ít nhất một nhân viên';
    if (Object.values(selection).some(v => v <= 0)) newErrors.amount = 'Số tiền phải lớn hơn 0';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    const items: ExpenseItem[] = Object.entries(selection).map(([id, amount]) => {
      const emp = employees.find(e => e.id === id)!;
      return { id, name: emp.name, amount };
    });
    onSubmit({ date: format(date, 'yyyy-MM-dd'), employees: items, description });
  };

  const total = Object.values(selection).reduce((a, b) => a + b, 0);
  const filteredEmployees = employees.filter(emp => emp.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="date">Ngày</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn('w-full justify-start text-left font-normal', !date && 'text-muted-foreground')}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, 'dd/MM/yyyy') : <span>Chọn ngày</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={date}
              onSelect={newDate => newDate && setDate(newDate)}
              initialFocus
            />
          </PopoverContent>
        </Popover>
        {errors.date && <p className="text-sm text-red-500">{errors.date}</p>}
      </div>

      <div className="space-y-2">
        <Label>Nhân viên</Label>
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-8"
            placeholder="Search by name"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap gap-2 mt-3">
          {filteredEmployees.map(emp => {
            const isSelected = emp.id in selection;
            return (
              <div
                key={emp.id}
                onClick={() => toggleEmployee(emp.id)}
                className={cn(
                  'flex items-center px-3 py-1.5 rounded-full border cursor-pointer text-sm',
                  isSelected
                    ? 'bg-pink-100 border-pink-500 text-pink-800'
                    : 'bg-blue-100 border-blue-400 text-blue-800'
                )}
              >
                <span className="mr-1">{emp.gender === 'male' ? '👨' : '👩'}</span>
                <span>{emp.name}</span>
                {isSelected && (
                  <X
                    className="ml-1 h-3 w-3 hover:text-red-500"
                    onClick={e => {
                      e.stopPropagation();
                      toggleEmployee(emp.id);
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>

        {Object.keys(selection).length > 0 && (
          <div className="mt-4 space-y-2">
            {Object.entries(selection).map(([id, amt]) => {
              const emp = employees.find(e => e.id === id)!;
              return (
                <div key={id} className="flex items-center space-x-2">
                  <span className="w-40 text-sm truncate">💵 {emp.name}</span>
                  <Input
                    type="number"
                    className="w-24"
                    value={amt}
                    onChange={e => updateAmount(id, e.target.value)}
                  />
                </div>
              );
            })}
          </div>
        )}

        {errors.employees && <p className="text-sm text-red-500">{errors.employees}</p>}
        {errors.amount && <p className="text-sm text-red-500">{errors.amount}</p>}
        <div className="text-sm text-right text-muted-foreground mt-1">Tổng: {total.toLocaleString()} ₫</div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Mô tả (tùy chọn)</Label>
        <Textarea
          id="description"
          placeholder="Bữa trưa tại..."
          value={description}
          onChange={e => setDescription(e.target.value)}
        />
      </div>

      <div className="flex justify-end space-x-2">
        <Button variant="outline" type="button" onClick={onCancel}>
          Hủy
        </Button>
        <Button type="submit" className="bg-green-600 hover:bg-green-700">
          Lưu
        </Button>
      </div>
    </form>
  );
}
