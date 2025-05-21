"use client";
import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { createTag, getAllTags } from "@/hooks/api/tag";

interface TagSelectorProps {
  selectedTags: string[];
  onChange: (tags: string[]) => void;
  updateTitleFromTags?: boolean;
}

export default function TagSelector({
  selectedTags,
  onChange,
  updateTitleFromTags = true,
}: TagSelectorProps) {
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    const res = await getAllTags();
    setTags(res.map((tag: { name: string }) => tag.name));
  };

  const handleAddTag = async () => {
    if (!newTag.trim()) return;
    const tag = await createTag({ name: newTag.trim() });
    const name = tag.name;
    const updatedTags = [...selectedTags, name];
    setTags((prev) => [...prev, name]);
    onChange(updatedTags);
    setNewTag("");
  };

  const toggleTag = (tag: string) => {
    const isSelected = selectedTags.includes(tag);
    const updated = isSelected
      ? selectedTags.filter((t) => t !== tag)
      : [...selectedTags, tag];

    onChange(updated);
  };

  return (
    <div className="space-y-2">
      <Label>Danh mục (Tag)</Label>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <div
            key={tag}
            onClick={() => toggleTag(tag)}
            className={cn(
              "px-3 py-1.5 text-sm rounded-full cursor-pointer border transition",
              selectedTags.includes(tag)
                ? "bg-green-100 text-green-800 border-green-500"
                : "bg-gray-100 text-gray-600 border-gray-300"
            )}
          >
            {tag}
          </div>
        ))}
      </div>

      <div className="flex gap-2 mt-2">
        <Input
          placeholder="Tạo tag mới..."
          value={newTag}
          onChange={(e) => setNewTag(e.target.value)}
          className="w-40"
        />
        <Button
          type="button"
          className="bg-green-600 text-white hover:bg-green-700"
          onClick={handleAddTag}
        >
          Thêm
        </Button>
      </div>
    </div>
  );
}
