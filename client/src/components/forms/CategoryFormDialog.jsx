// src/components/admin/CategoryFormDialog.jsx

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

const CategoryFormDialog = ({
  open,
  onOpenChange,
  mode = "create",
  initialData = null,
  parentOptions = [],
  onSubmit,
}) => {
  const [name, setName] = useState("");
  const [parentId, setParentId] = useState(null);
  const [isActive, setIsActive] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setName(initialData?.name ?? "");
    setParentId(initialData?.parentId ?? null);
    setIsActive(initialData?.isActive ?? true);
  }, [open, initialData]);

  const handleSubmit = async () => {
    if (!name.trim()) return;

    setSubmitting(true);
    try {
      if (mode === "create") {
        // CreateCategoryDTO: Name, ParentId
        await onSubmit({
          name: name.trim(),
          parentId: parentId || null,
        });
      } else {
        // UpdateCategoryDTO: Name, ParentId, IsActive
        await onSubmit({
          name: name.trim(),
          parentId: parentId || null,
          isActive,
        });
      }
      onOpenChange(false);
    } catch (error) {
      console.error(mode === "create" ? "Lỗi tạo:" : "Lỗi cập nhật:", error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Thêm danh mục" : "Cập nhật danh mục"}
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid gap-2">
            <Label htmlFor="category-name">Tên danh mục</Label>
            <Input
              id="category-name"
              placeholder="Nhập tên danh mục..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              autoFocus
            />
          </div>

          <div className="grid gap-2">
            <Label>Danh mục cha</Label>
            <Select
              value={parentId ? String(parentId) : "none"}
              onValueChange={(val) => setParentId(val === "none" ? null : val)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Không có (danh mục gốc)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Không có (danh mục gốc)</SelectItem>
                {parentOptions.map((c) => (
                  <SelectItem key={c.id} value={String(c.id)}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {mode === "update" && (
            <div className="flex items-center justify-between">
              <Label htmlFor="is-active">Trạng thái hoạt động</Label>
              <Switch
                id="is-active"
                checked={isActive}
                onCheckedChange={setIsActive}
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
          >
            Hủy
          </Button>
          <Button onClick={handleSubmit} disabled={submitting || !name.trim()}>
            {submitting
              ? "Đang lưu..."
              : mode === "create"
                ? "Tạo mới"
                : "Cập nhật"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CategoryFormDialog;
