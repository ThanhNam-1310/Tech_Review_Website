import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { GetAllCategories } from "@/apis/category.api";
import {
  GetAllSpecifiByCategory,
  UpdateSpecification,
  DeleteSpecification,
} from "@/apis/specification.api";
import CreateSpecificationDialog from "@/components/forms/CreateSpecificationDialog";
import {
  Loader2,
  Pencil,
  Trash2,
  Check,
  X,
  SlidersHorizontal,
} from "lucide-react";

export default function AdminSpecificationPage() {
  const [categories, setCategories] = useState([]);
  const [categoryId, setCategoryId] = useState("");
  const [specs, setSpecs] = useState([]);
  const [loading, setLoading] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [saving, setSaving] = useState(false);

  // Delete dialog
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    GetAllCategories()
      .then((res) => {
        const data = res.data?.data ?? res.data ?? [];
        setCategories(
          (Array.isArray(data) ? data : [])
            .filter((c) => !(c.parentId ?? c.ParentId))
            .map((c) => ({
              id: String(c.id ?? c.Id),
              name: c.name ?? c.Name,
            })),
        );
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!categoryId) return setSpecs([]);
    setLoading(true);
    GetAllSpecifiByCategory(categoryId)
      .then((res) => {
        let data = res.data?.data ?? res.data ?? [];
        if (!Array.isArray(data)) data = [];
        setSpecs(
          data.map((s) => ({
            id: s.id ?? s.Id,
            name: s.name ?? s.Name,
          })),
        );
      })
      .catch(() => setSpecs([]))
      .finally(() => setLoading(false));
  }, [categoryId]);

  const handleCreated = (created) => {
    if (!created) return;
    setSpecs((prev) => [
      ...prev,
      {
        id: created.id ?? created.Id,
        name: created.name ?? created.Name,
      },
    ]);
    toast.success("Tạo mới thành công");
  };

  const handleSave = async (id) => {
    if (!editName.trim()) return;
    setSaving(true);
    try {
      await UpdateSpecification(id, {
        name: editName.trim(),
        categoryId,
      });
      setSpecs((prev) =>
        prev.map((s) => (s.id === id ? { ...s, name: editName.trim() } : s)),
      );
      setEditingId(null);
      toast.success("Cập nhật thành công");
    } catch {
      toast.error("Cập nhật thất bại");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await DeleteSpecification(deleteId);
      setSpecs((prev) => prev.filter((s) => s.id !== deleteId));
      toast.success("Xóa thành công");
      setDeleteId(null);
    } catch {
      toast.error("Xóa thất bại");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-8">
      <div className="flex items-center gap-3">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white shadow-sm">
          <SlidersHorizontal className="size-5" />
        </span>
        <div>
          <h1 className="text-2xl font-bold leading-tight">
            Quản lý đặc điểm kỹ thuật
          </h1>
          <p className="text-sm text-muted-foreground">
            Chọn danh mục cha để xem và quản lý các đặc điểm kỹ thuật của nó.
          </p>
        </div>
      </div>

      <Select value={categoryId} onValueChange={setCategoryId} modal={false}>
        <SelectTrigger className="w-full max-w-xs border-indigo-200 bg-white">
          <SelectValue placeholder="Chọn danh mục cha" />
        </SelectTrigger>
        <SelectContent
          position="popper"
          side="bottom"
          align="start"
          sideOffset={4}
          onCloseAutoFocus={(e) => e.preventDefault()}
        >
          {categories.map((c) => (
            <SelectItem key={c.id} value={c.id}>
              {c.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Card className="overflow-hidden rounded-2xl border-indigo-100 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b border-indigo-100 bg-indigo-50/50 pb-3">
          <CardTitle className="text-base">
            Đặc điểm kỹ thuật
            {categoryId && (
              <span className="ml-2 rounded-full bg-indigo-100 px-2 py-0.5 text-sm font-semibold text-indigo-700">
                {specs.length}
              </span>
            )}
          </CardTitle>
          <CreateSpecificationDialog
            categoryId={categoryId || null}
            onCreated={handleCreated}
          />
        </CardHeader>

        <CardContent className="pt-4">
          {!categoryId ? (
            <p className="rounded-xl border border-dashed border-indigo-200 bg-indigo-50/40 py-8 text-center text-sm text-muted-foreground">
              Chọn danh mục để xem
            </p>
          ) : loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-indigo-500" />
            </div>
          ) : specs.length === 0 ? (
            <p className="rounded-xl border border-dashed border-indigo-200 bg-indigo-50/40 py-8 text-center text-sm text-muted-foreground">
              Chưa có đặc điểm kỹ thuật nào
            </p>
          ) : (
            <ul className="divide-y divide-indigo-100 overflow-hidden rounded-xl border border-indigo-100">
              {specs.map((spec) => (
                <li
                  key={spec.id}
                  className="flex items-center gap-2 px-3 py-2.5 transition-colors hover:bg-indigo-50/50"
                >
                  {editingId === spec.id ? (
                    <>
                      <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="h-8 flex-1 border-indigo-200 focus-visible:ring-indigo-500"
                        autoFocus
                      />
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-indigo-600 hover:bg-indigo-100 hover:text-indigo-700"
                        onClick={() => handleSave(spec.id)}
                        disabled={saving}
                      >
                        {saving ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Check className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 hover:bg-muted"
                        onClick={() => setEditingId(null)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <span className="flex-1 text-sm font-medium">
                        {spec.name}
                      </span>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 hover:bg-indigo-100 hover:text-indigo-600"
                        onClick={() => {
                          setEditingId(spec.id);
                          setEditName(spec.name);
                        }}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-destructive hover:bg-rose-50"
                        onClick={() => setDeleteId(spec.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </>
                  )}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Dialog xác nhận xóa */}
      <Dialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
      >
        <DialogContent className="rounded-2xl border-indigo-100 sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Xác nhận xóa</DialogTitle>
            <DialogDescription>
              Bạn có chắc muốn xóa đặc điểm này? Hành động không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              className="border-indigo-200 hover:bg-indigo-50"
              onClick={() => setDeleteId(null)}
              disabled={deleting}
            >
              Hủy
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Xóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
