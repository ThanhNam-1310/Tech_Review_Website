// src/pages/admin/AdminCategoriesPage.jsx
import { useEffect, useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  LayoutGrid,
  TriangleAlert,
} from "lucide-react";
import { toast } from "sonner";

import {
  GetAllCategories,
  CreateNewCategory,
  UpdateCategoryById,
  DeleteCategoryById,
} from "@/apis/category.api";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const ROOT = "__root__"; // giá trị đại diện "không có danh mục cha" cho Select

const norm = (c) => ({
  id: c.id ?? c.Id,
  name: c.name ?? c.Name ?? "",
  parentId: c.parentId ?? c.ParentId ?? null,
  isActive: c.isActive ?? c.IsActive ?? true,
  children: (c.children ?? c.Children ?? []).map(norm),
});

const flattenTree = (nodes, level = 0, out = []) => {
  nodes.forEach((n) => {
    out.push({ ...n, level });
    flattenTree(n.children || [], level + 1, out);
  });
  return out;
};

const buildVisible = (nodes, expanded, level = 0, out = []) => {
  nodes.forEach((n) => {
    out.push({ ...n, level });
    if (expanded.has(n.id))
      buildVisible(n.children || [], expanded, level + 1, out);
  });
  return out;
};

// Id của 1 node + toàn bộ con cháu (để loại khỏi options danh mục cha, tránh tạo vòng)
const subtreeIds = (node, set = new Set()) => {
  if (!node) return set;
  set.add(node.id);
  (node.children || []).forEach((c) => subtreeIds(c, set));
  return set;
};

const headClass =
  "text-xs font-semibold uppercase tracking-wider text-slate-500";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [expanded, setExpanded] = useState(new Set());
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState(null); // { id|null, name, parentId, isActive }
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [deletingLoading, setDeletingLoading] = useState(false);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await GetAllCategories();
      const raw = res.data?.data ?? res.data ?? [];
      const tree = (Array.isArray(raw) ? raw : []).map(norm);
      setCategories(tree);
      // Mặc định mở hết các node có con cho dễ nhìn
      setExpanded(
        new Set(
          flattenTree(tree)
            .filter((n) => n.children?.length)
            .map((n) => n.id),
        ),
      );
    } catch {
      toast.error("Không thể tải danh mục. Vui lòng thử lại.");
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const flat = flattenTree(categories);
  const visible = buildVisible(categories, expanded);

  const toggleExpand = (id) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  // Options cho Select danh mục cha: bỏ chính node đang sửa + con cháu của nó
  const editingNode = form?.id ? flat.find((c) => c.id === form.id) : null;
  const excluded = subtreeIds(editingNode);
  const parentOptions = flat.filter((c) => !excluded.has(c.id));

  const handleFormSubmit = async () => {
    if (!form?.name.trim()) {
      toast.error("Tên danh mục không được để trống");
      return;
    }
    setSubmitting(true);
    try {
      if (form.id) {
        await UpdateCategoryById(form.id, {
          name: form.name.trim(),
          parentId: form.parentId,
          isActive: form.isActive,
        });
        toast.success("Cập nhật danh mục thành công");
      } else {
        await CreateNewCategory({
          name: form.name.trim(),
          parentId: form.parentId,
        });
        toast.success("Tạo danh mục thành công");
      }
      setForm(null);
      fetchCategories();
    } catch {
      toast.error(form.id ? "Cập nhật thất bại" : "Tạo danh mục thất bại");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleting || deleting.children?.length) return;
    setDeletingLoading(true);
    try {
      await DeleteCategoryById(deleting.id);
      toast.success(`Đã xóa "${deleting.name}"`);
      setDeleting(null);
      fetchCategories();
    } catch {
      toast.error("Xóa danh mục thất bại");
    } finally {
      setDeletingLoading(false);
    }
  };

  const hasChildren = (deleting?.children?.length ?? 0) > 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-sm shadow-emerald-600/20">
            <LayoutGrid className="size-5" />
          </span>
          <div>
            <h1 className="text-2xl font-bold leading-tight">
              Danh mục sản phẩm
            </h1>
            <p className="text-sm text-slate-500">
              Tổng cộng {flat.length} danh mục
            </p>
          </div>
        </div>
        <Button
          onClick={() =>
            setForm({ id: null, name: "", parentId: null, isActive: true })
          }
          className="rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 font-semibold text-white shadow-md shadow-emerald-600/20 hover:from-emerald-600 hover:to-emerald-700"
        >
          <Plus className="mr-2 size-4" /> Thêm danh mục
        </Button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-emerald-100 bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-emerald-50 hover:bg-emerald-50">
              <TableHead className={headClass}>Tên danh mục</TableHead>
              <TableHead className={`w-40 ${headClass}`}>Trạng thái</TableHead>
              <TableHead className={`w-36 text-right ${headClass}`}>
                Thao tác
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={3}
                  className="py-10 text-center text-slate-500"
                >
                  Đang tải...
                </TableCell>
              </TableRow>
            ) : visible.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={3}
                  className="py-10 text-center text-slate-500"
                >
                  Chưa có danh mục.
                </TableCell>
              </TableRow>
            ) : (
              visible.map((cat) => (
                <TableRow key={cat.id} className="hover:bg-emerald-50/50">
                  <TableCell>
                    <div
                      className="flex items-center gap-2"
                      style={{ paddingLeft: `${cat.level * 28}px` }}
                    >
                      {cat.children?.length > 0 ? (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-7 shrink-0 rounded-lg text-slate-400 hover:bg-emerald-50 hover:text-emerald-700"
                          onClick={() => toggleExpand(cat.id)}
                        >
                          {expanded.has(cat.id) ? (
                            <ChevronDown className="size-4" />
                          ) : (
                            <ChevronRight className="size-4" />
                          )}
                        </Button>
                      ) : (
                        <span className="inline-block size-7 shrink-0" />
                      )}
                      <span
                        className={
                          cat.level === 0 ? "font-semibold" : "text-slate-500"
                        }
                      >
                        {cat.name}
                      </span>
                      {cat.children?.length > 0 && (
                        <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-100">
                          {cat.children.length} mục con
                        </span>
                      )}
                    </div>
                  </TableCell>

                  <TableCell>
                    {cat.isActive ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-200">
                        <span className="size-1.5 rounded-full bg-emerald-500" />
                        Hoạt động
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-500 ring-1 ring-inset ring-zinc-200">
                        <span className="size-1.5 rounded-full bg-zinc-400" />
                        Đã tắt
                      </span>
                    )}
                  </TableCell>

                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Thêm danh mục con"
                        className="rounded-xl hover:bg-emerald-50 hover:text-emerald-700"
                        onClick={() =>
                          setForm({
                            id: null,
                            name: "",
                            parentId: cat.id,
                            isActive: true,
                          })
                        }
                      >
                        <Plus className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Sửa"
                        className="rounded-xl hover:bg-emerald-50 hover:text-emerald-700"
                        onClick={() =>
                          setForm({
                            id: cat.id,
                            name: cat.name,
                            parentId: cat.parentId ?? null,
                            isActive: cat.isActive ?? true,
                          })
                        }
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Xóa"
                        onClick={() => setDeleting(cat)}
                        className="rounded-xl hover:bg-red-50"
                      >
                        <Trash2 className="size-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* ===== Form tạo / sửa (inline) ===== */}
      <Dialog open={!!form} onOpenChange={(o) => !o && setForm(null)}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-sm shadow-emerald-600/20">
                <LayoutGrid className="size-4" />
              </span>
              {form?.id ? "Chỉnh sửa danh mục" : "Tạo danh mục"}
            </DialogTitle>
          </DialogHeader>

          {form && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Tên danh mục</label>
                <Input
                  className="mt-1 rounded-xl border-emerald-100 focus-visible:border-emerald-300 focus-visible:ring-emerald-400"
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                  placeholder="VD: Laptop, Điện thoại..."
                  onKeyDown={(e) => e.key === "Enter" && handleFormSubmit()}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Danh mục cha</label>
                <Select
                  value={form.parentId ?? ROOT}
                  onValueChange={(v) =>
                    setForm((f) => ({
                      ...f,
                      parentId: v === ROOT ? null : v,
                    }))
                  }
                >
                  <SelectTrigger className="mt-1 rounded-xl border-emerald-100 focus:ring-emerald-400">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent
                    position="popper"
                    side="bottom"
                    align="start"
                    sideOffset={4}
                  >
                    <SelectItem value={ROOT}>
                      — Không có (danh mục gốc)
                    </SelectItem>
                    {parentOptions.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {"— ".repeat(c.level)}
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {form.id && (
                <label className="flex cursor-pointer items-center gap-2 text-sm select-none">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, isActive: e.target.checked }))
                    }
                    className="h-4 w-4 accent-emerald-600"
                  />
                  Đang hoạt động
                </label>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setForm(null)}
                  disabled={submitting}
                  className="rounded-xl"
                >
                  Hủy
                </Button>
                <Button
                  onClick={handleFormSubmit}
                  disabled={submitting}
                  className="rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 font-semibold text-white shadow-md shadow-emerald-600/20 hover:from-emerald-600 hover:to-emerald-700"
                >
                  {submitting && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {form.id ? "Cập nhật" : "Tạo danh mục"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ===== Xác nhận xóa ===== */}
      <AlertDialog
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
      >
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <span
                className={`flex size-8 items-center justify-center rounded-lg ${
                  hasChildren
                    ? "bg-amber-100 text-amber-600"
                    : "bg-red-100 text-red-600"
                }`}
              >
                {hasChildren ? (
                  <TriangleAlert className="size-4" />
                ) : (
                  <Trash2 className="size-4" />
                )}
              </span>
              {hasChildren ? "Không thể xóa" : "Xác nhận xóa"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {hasChildren
                ? `Danh mục "${deleting?.name}" còn danh mục con. Hãy xóa hết danh mục con trước.`
                : `Bạn có chắc muốn xóa "${deleting?.name}"? Hành động này không thể hoàn tác.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={deletingLoading}
              className="rounded-xl"
            >
              Hủy
            </AlertDialogCancel>
            {!hasChildren && (
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={deletingLoading}
                className="rounded-xl"
              >
                {deletingLoading ? "Đang xóa..." : "Xóa"}
              </Button>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
