// src/components/EmployeeModal.tsx
'use client';
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { createEmployee } from '@/hooks/api/employee';

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EmployeeModal({ open, onClose, onSuccess }: Props) {
  const [name, setName] = useState('');
  const [alias, setAlias] = useState('');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
  if (!name) return;
  setLoading(true);
  try {
    console.log('📤 Gửi yêu cầu tạo nhân viên...');
    await createEmployee({ name, alias, gender });
    console.log('✅ Đã tạo thành công!');
    onSuccess();
    onClose();
    setName('');
    setAlias('');
    setGender('male');
  } catch (err) {
    console.error('❌ Lỗi khi tạo nhân viên:', err);
  } finally {
    setLoading(false);
  }
};

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Thêm nhân viên mới</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Họ tên</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="alias">Tên gọi khác (tùy chọn)</Label>
            <Input id="alias" value={alias} onChange={(e) => setAlias(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label>Giới tính</Label>
            <RadioGroup value={gender} onValueChange={(v) => setGender(v as 'male' | 'female')} className="flex gap-6">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="male" id="r1" />
                <Label htmlFor="r1">Nam</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="female" id="r2" />
                <Label htmlFor="r2">Nữ</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSubmit} disabled={loading} className="bg-green-600 hover:bg-green-700">
              {loading ? 'Đang lưu...' : 'Lưu'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
