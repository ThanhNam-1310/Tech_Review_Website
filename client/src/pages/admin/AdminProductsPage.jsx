import { useCallback, useEffect, useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  RotateCcw,
  Ban,
  RefreshCw,
  Search,
  X,
  Package,
} from "lucide-react";
import { toast } from "sonner";

import {
  GetAllProduct,
  SoftDeleteProduct,
  RestoreSoftDelProduct,
  DeleteProductById,
} from "@/apis/product.api";
import { GetAllCategories } from "@/apis/category.api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import CreateProductForm from "@/components/forms/CreateProductForm";

const PAGE_SIZE = 10;

const norm = (p) => ({
  id: p.id ?? p.Id,
  categoryId: p.categoryId ?? p.CategoryId,
  name: p.name ?? p.Name ?? "",
  brand: p.brand ?? p.Brand ?? "",
  price: p.price ?? p.Price ?? null,
  thumnailUrl: p.thumnailUrl ?? p.ThumnailUrl ?? p.thumbnailUrl ?? "",
  isDeleted: p.isDeleted ?? p.IsDeleted ?? false,
});

const flattenCategories = (nodes, result = []) => {
  (nodes || []).forEach((c) => {
    result.push({ id: c.id ?? c.Id, name: c.name ?? c.Name ?? "" });
    flattenCategories(c.children ?? c.Children ?? [], result);
  });
  return result;
};

const formatPrice = (price) =>
  price == null || price === ""
    ? "—"
    : new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(Number(price));

const headClass =
  "text-xs font-semibold uppercase tracking-wider text-stone-500";

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchInput, setSearchInput] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Dialog tạo/sửa: null = đóng, { productId: null } = tạo mới, { productId } = sửa
  const [formDialog, setFormDialog] = useState(null);

  // Dialog xác nhận ẩn/xoá: { product, hard } | null
  const [confirm, setConfirm] = useState(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const start = totalCount === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const end = Math.min(page * PAGE_SIZE, totalCount);

  // Danh mục load 1 lần, chỉ để tra tên hiển thị
  useEffect(() => {
    GetAllCategories()
      .then((res) => setCategories(flattenCategories(res.data ?? [])))
      .catch(() => {});
  }, []);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await GetAllProduct({
        search: activeSearch || undefined,
        pageNumber: page,
        pageSize: PAGE_SIZE,
      });
      const data = res.data ?? {};
      const items = Array.isArray(data.items)
        ? data.items
        : Array.isArray(data)
          ? data
          : [];
      setProducts(items.map(norm));
      setTotalCount(data.totalCount ?? items.length);
    } catch {
      toast.error("Không thể tải danh sách sản phẩm.");
      setProducts([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [page, activeSearch]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleSearch = () => {
    setPage(1);
    setActiveSearch(searchInput.trim());
  };

  const categoryName = (id) => categories.find((c) => c.id === id)?.name ?? "—";

  const handleConfirm = async () => {
    if (!confirm) return;
    setConfirmLoading(true);
    try {
      if (confirm.hard) {
        await DeleteProductById(confirm.product.id);
        toast.success(`Đã xóa vĩnh viễn "${confirm.product.name}"`);
      } else {
        await SoftDeleteProduct(confirm.product.id);
        toast.success(`Đã ẩn "${confirm.product.name}"`);
      }
      setConfirm(null);
      fetchProducts();
    } catch {
      toast.error(confirm.hard ? "Xóa thất bại" : "Ẩn sản phẩm thất bại");
    } finally {
      setConfirmLoading(false);
    }
  };

  const handleRestore = async (p) => {
    try {
      await RestoreSoftDelProduct(p.id);
      toast.success(`Đã khôi phục "${p.name}"`);
      fetchProducts();
    } catch {
      toast.error("Khôi phục thất bại");
    }
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] min-h-0 flex-col gap-4 overflow-hidden">
      {/* ===== Tiêu đề + tìm kiếm + hành động ===== */}
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-sm shadow-amber-600/20">
            <Package className="size-5" />
          </span>
          <h1 className="text-2xl font-bold">Quản lý sản phẩm</h1>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-amber-500" />
            <Input
              placeholder="Tìm theo tên sản phẩm..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="w-64 pl-9 pr-9 rounded-xl border-amber-100 bg-white focus-visible:border-amber-300 focus-visible:ring-amber-400"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => {
                  setSearchInput("");
                  setPage(1);
                  setActiveSearch("");
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-amber-700"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <Button
            variant="outline"
            onClick={handleSearch}
            className="rounded-xl border-amber-200 text-amber-700 hover:bg-amber-50 hover:text-amber-700"
          >
            Tìm kiếm
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={fetchProducts}
            disabled={loading}
            title="Làm mới"
            className="rounded-xl border-amber-200 text-amber-700 hover:bg-amber-50 hover:text-amber-700"
          >
            <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
          <Button
            onClick={() => setFormDialog({ productId: null })}
            className="rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 font-semibold text-white shadow-md shadow-amber-600/20 hover:from-amber-600 hover:to-amber-700"
          >
            <Plus className="mr-2 size-4" />
            Thêm sản phẩm
          </Button>
        </div>
      </div>

      {/* ===== Bảng sản phẩm ===== */}
      <div className="min-h-0 flex-1 overflow-hidden rounded-2xl border border-amber-100 bg-white shadow-sm">
        <div className="h-full overflow-y-auto">
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-amber-50">
              <TableRow className="hover:bg-transparent">
                <TableHead className={`w-16 ${headClass}`}>Ảnh</TableHead>
                <TableHead className={headClass}>Tên</TableHead>
                <TableHead className={headClass}>Thương hiệu</TableHead>
                <TableHead className={headClass}>Danh mục</TableHead>
                <TableHead className={headClass}>Giá</TableHead>
                <TableHead className={headClass}>Trạng thái</TableHead>
                <TableHead className={`text-right ${headClass}`}>
                  Thao tác
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="py-10 text-center text-stone-500"
                  >
                    Đang tải...
                  </TableCell>
                </TableRow>
              ) : products.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="py-10 text-center text-stone-500"
                  >
                    {activeSearch
                      ? `Không tìm thấy sản phẩm nào với "${activeSearch}".`
                      : "Chưa có sản phẩm."}
                  </TableCell>
                </TableRow>
              ) : (
                products.map((p) => (
                  <TableRow
                    key={p.id}
                    className={`hover:bg-amber-50/60 ${p.isDeleted ? "opacity-50" : ""}`}
                  >
                    <TableCell>
                      {p.thumnailUrl ? (
                        <img
                          src={p.thumnailUrl}
                          alt={p.name}
                          className="size-12 rounded-xl object-cover shadow-sm ring-1 ring-amber-100"
                        />
                      ) : (
                        <div className="flex size-12 items-center justify-center rounded-xl bg-amber-50 ring-1 ring-amber-100">
                          <Package className="size-5 text-amber-300" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="max-w-[240px] truncate font-semibold">
                      {p.name}
                    </TableCell>
                    <TableCell className="text-stone-500">
                      {p.brand || "—"}
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-100">
                        {categoryName(p.categoryId)}
                      </span>
                    </TableCell>
                    <TableCell className="font-semibold tabular-nums">
                      {formatPrice(p.price)}
                    </TableCell>
                    <TableCell>
                      {p.isDeleted ? (
                        <Badge className="gap-1.5 bg-stone-100 text-stone-500 ring-1 ring-inset ring-stone-200 hover:bg-stone-100">
                          <span className="size-1.5 rounded-full bg-stone-400" />
                          Đã ẩn
                        </Badge>
                      ) : (
                        <Badge className="gap-1.5 bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200 hover:bg-amber-50">
                          <span className="size-1.5 rounded-full bg-amber-500" />
                          Đang hiện
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Sửa"
                          onClick={() => setFormDialog({ productId: p.id })}
                          className="rounded-xl hover:bg-amber-50 hover:text-amber-700"
                        >
                          <Pencil className="size-4" />
                        </Button>
                        {p.isDeleted ? (
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Khôi phục"
                            onClick={() => handleRestore(p)}
                            className="rounded-xl hover:bg-amber-50 hover:text-amber-700"
                          >
                            <RotateCcw className="size-4" />
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Ẩn sản phẩm"
                            onClick={() =>
                              setConfirm({ product: p, hard: false })
                            }
                            className="rounded-xl hover:bg-stone-100 hover:text-stone-700"
                          >
                            <Ban className="size-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Xóa vĩnh viễn"
                          onClick={() => setConfirm({ product: p, hard: true })}
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
      </div>

      {/* ===== Phân trang ===== */}
      <div className="flex shrink-0 flex-col items-center justify-between gap-2 sm:flex-row">
        <p className="text-sm text-stone-500">
          Hiển thị {start}–{end} trên tổng {totalCount} sản phẩm
        </p>
        <Pagination className="mx-0 w-auto">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                aria-disabled={page === 1}
                className={
                  page === 1
                    ? "pointer-events-none opacity-50"
                    : "hover:bg-amber-50 hover:text-amber-700"
                }
                onClick={(e) => {
                  e.preventDefault();
                  if (page > 1) setPage(page - 1);
                }}
              />
            </PaginationItem>
            <PaginationItem>
              <span className="flex h-9 items-center px-3 text-sm font-medium">
                {page}/{totalPages}
              </span>
            </PaginationItem>
            <PaginationItem>
              <PaginationNext
                href="#"
                aria-disabled={page === totalPages}
                className={
                  page === totalPages
                    ? "pointer-events-none opacity-50"
                    : "hover:bg-amber-50 hover:text-amber-700"
                }
                onClick={(e) => {
                  e.preventDefault();
                  if (page < totalPages) setPage(page + 1);
                }}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>

      {/* ===== Dialog tạo / sửa sản phẩm (dùng lại CreateProductForm) ===== */}
      <Dialog
        open={!!formDialog}
        onOpenChange={(o) => !o && setFormDialog(null)}
      >
        <DialogContent className="w-[96vw] max-w-6xl sm:max-w-6xl max-h-[92vh] overflow-y-auto rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-sm shadow-amber-600/20">
                <Package className="size-4" />
              </span>
              {formDialog?.productId ? "Chỉnh sửa sản phẩm" : "Tạo sản phẩm"}
            </DialogTitle>
          </DialogHeader>
          {formDialog && (
            <CreateProductForm
              key={formDialog.productId ?? "new"}
              productId={formDialog.productId}
              onSuccess={() => {
                setFormDialog(null);
                fetchProducts();
              }}
              onCancel={() => setFormDialog(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* ===== Dialog xác nhận ẩn / xoá vĩnh viễn ===== */}
      <AlertDialog
        open={!!confirm}
        onOpenChange={(o) => !o && setConfirm(null)}
      >
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <span
                className={`flex size-8 items-center justify-center rounded-lg ${
                  confirm?.hard
                    ? "bg-red-100 text-red-600"
                    : "bg-stone-100 text-stone-500"
                }`}
              >
                {confirm?.hard ? (
                  <Trash2 className="size-4" />
                ) : (
                  <Ban className="size-4" />
                )}
              </span>
              {confirm?.hard ? "Xóa vĩnh viễn" : "Ẩn sản phẩm"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirm?.hard
                ? `Xóa vĩnh viễn "${confirm?.product.name}"? Không thể hoàn tác.`
                : `Ẩn "${confirm?.product.name}"? Bạn có thể khôi phục sau.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={confirmLoading} className="rounded-xl">
              Hủy
            </AlertDialogCancel>
            <Button
              variant="destructive"
              onClick={handleConfirm}
              disabled={confirmLoading}
              className="rounded-xl"
            >
              {confirmLoading
                ? "Đang xử lý..."
                : confirm?.hard
                  ? "Xóa vĩnh viễn"
                  : "Ẩn"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
