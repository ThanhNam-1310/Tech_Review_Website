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
        <h1 className="text-2xl font-bold">Quản lý sản phẩm</h1>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Tìm theo tên sản phẩm..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="w-64 pl-9 pr-9"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => {
                  setSearchInput("");
                  setPage(1);
                  setActiveSearch("");
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <Button onClick={handleSearch}>Tìm kiếm</Button>
          <Button
            variant="outline"
            size="icon"
            onClick={fetchProducts}
            disabled={loading}
            title="Làm mới"
          >
            <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
          <Button onClick={() => setFormDialog({ productId: null })}>
            <Plus className="mr-2 size-4" />
            Thêm sản phẩm
          </Button>
        </div>
      </div>

      {/* ===== Bảng sản phẩm ===== */}
      <div className="min-h-0 flex-1 overflow-hidden rounded-md border">
        <div className="h-full overflow-y-auto">
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-background">
              <TableRow>
                <TableHead className="w-16">Ảnh</TableHead>
                <TableHead>Tên</TableHead>
                <TableHead>Thương hiệu</TableHead>
                <TableHead>Danh mục</TableHead>
                <TableHead>Giá</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center text-muted-foreground"
                  >
                    Đang tải...
                  </TableCell>
                </TableRow>
              ) : products.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center text-muted-foreground"
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
                    className={p.isDeleted ? "opacity-50" : undefined}
                  >
                    <TableCell>
                      {p.thumnailUrl ? (
                        <img
                          src={p.thumnailUrl}
                          alt={p.name}
                          className="size-10 rounded object-cover"
                        />
                      ) : (
                        <div className="size-10 rounded bg-muted" />
                      )}
                    </TableCell>
                    <TableCell className="max-w-[240px] truncate font-medium">
                      {p.name}
                    </TableCell>
                    <TableCell>{p.brand || "—"}</TableCell>
                    <TableCell>{categoryName(p.categoryId)}</TableCell>
                    <TableCell>{formatPrice(p.price)}</TableCell>
                    <TableCell>
                      {p.isDeleted ? (
                        <Badge variant="outline">Đã ẩn</Badge>
                      ) : (
                        <Badge variant="secondary">Đang hiện</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Sửa"
                          onClick={() => setFormDialog({ productId: p.id })}
                        >
                          <Pencil className="size-4" />
                        </Button>
                        {p.isDeleted ? (
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Khôi phục"
                            onClick={() => handleRestore(p)}
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
                          >
                            <Ban className="size-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Xóa vĩnh viễn"
                          onClick={() => setConfirm({ product: p, hard: true })}
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
        <p className="text-sm text-muted-foreground">
          Hiển thị {start}–{end} trên tổng {totalCount} sản phẩm
        </p>
        <Pagination className="mx-0 w-auto">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                aria-disabled={page === 1}
                className={page === 1 ? "pointer-events-none opacity-50" : ""}
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
                  page === totalPages ? "pointer-events-none opacity-50" : ""
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
        <DialogContent className="w-[96vw] max-w-6xl sm:max-w-6xl max-h-[92vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
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
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirm?.hard ? "Xóa vĩnh viễn" : "Ẩn sản phẩm"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirm?.hard
                ? `Xóa vĩnh viễn "${confirm?.product.name}"? Không thể hoàn tác.`
                : `Ẩn "${confirm?.product.name}"? Bạn có thể khôi phục sau.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={confirmLoading}>Hủy</AlertDialogCancel>
            <Button
              variant="destructive"
              onClick={handleConfirm}
              disabled={confirmLoading}
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
