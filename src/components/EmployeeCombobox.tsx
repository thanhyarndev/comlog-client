"use client";

import React, { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { Employee } from "@/types/employee";

interface Props {
  employees: Employee[];
  value: string;
  onChange: (value: string) => void;
}

const removeAccents = (str: string): string =>
  str
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();

export default function EmployeeAutocomplete({
  employees,
  value,
  onChange,
}: Props) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const triggerRef = useRef<HTMLButtonElement>(null);

  const selected = employees.find((e) => e.id === value);
  const filtered = employees.filter((e) => {
    const keyword = removeAccents(input);
    return (
      removeAccents(e.name).includes(keyword) ||
      removeAccents(e.alias || "").includes(keyword)
    );
  });

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          ref={triggerRef}
          className={cn(
            "w-full text-left border rounded px-3 py-2 bg-white hover:bg-gray-50",
            !selected && "text-gray-500"
          )}
          onClick={() => setOpen(true)}
        >
          {selected ? (
            <span>
              {selected.name}
              {selected.alias ? ` (${selected.alias})` : ""}
            </span>
          ) : (
            "Chọn nhân viên..."
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput
            placeholder="Tìm theo tên hoặc alias"
            value={input}
            onValueChange={setInput}
          />
          <CommandEmpty>Không tìm thấy nhân viên</CommandEmpty>
          <CommandGroup>
            {filtered.map((e) => (
              <CommandItem
                key={e.id}
                value={e.id} // ✅
                onSelect={(id) => {
                  onChange(id); // ✅ Truyền id chuẩn lên
                  setOpen(false);
                  setInput("");
                }}
              >
                <div>
                  <div className="font-medium">{e.name}</div>
                  {e.alias && (
                    <div className="text-xs text-gray-500">{e.alias}</div>
                  )}
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
