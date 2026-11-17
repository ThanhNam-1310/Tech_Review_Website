import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  ImageOff,
  Search,
  X,
  Pencil,
  Trash2,
  Plus,
  Loader2,
  Package,
} from "lucide-react";
import { toast } from "sonner";
import { GetMyProducts, DeleteProductById } from "@/apis/product.api";

const PAGE_SIZE = 10;

// Chuẩn hoá 1 product từ ListProductDTO (BE) — lưu ý field ảnh là "thumnailUrl"
const normalizeProduct = (p) => ({
  id: p.id ?? p.Id,
  name: p.name ?? p.Name ?? "",
  brand: p.brand ?? p.Brand ?? "",
  price: p.price ?? p.Price ?? null,
  thumbnailUrl:
    p.thumnailUrl ?? p.ThumnailUrl ?? p.thumbnailUrl ?? p.ThumbnailUrl ?? "",
  createdAt: p.createdAt ?? p.CreatedAt ?? "",
  isDeleted: p.isDeleted ?? p.IsDeleted ?? false,
});

const formatDate = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  return isNaN(d) ? "" : d.toLocaleDateString("vi-VN");
};

const formatPrice = (price) =>
  price == null
    ? ""
    : new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(Number(price));

const getPageItems = (current, total) => {
  const pages = new Set([1, total, current - 1, current, current + 1]);
  const sorted = [...pages]
    .filter((n) => n >= 1 && n <= total)
    .sort((a, b) => a - b);
  const items = [];
  sorted.forEach((n, i) => {
    if (i > 0 && n - sorted[i - 1] > 1) items.push("...");
    items.push(n);
  });
  return items;
};

const Thumb = ({ src, className }) =>
  src ? (
    <img
      src={src}
      alt=""
      className={`shrink-0 rounded-xl border border-sky-100 object-cover shadow-sm ${className}`}
    />
  ) : (
    <div
      className={`flex shrink-0 items-center justify-center rounded-xl border border-sky-100 bg-sky-50 ${className}`}
    >
      <ImageOff className="h-4 w-4 text-sky-300" />
    </div>
  );

export default function MyProductsPage() {
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [pageNumber, setPageNumber] = useState(1);
  const [keyword, setKeyword] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [deleting, setDeleting] = useState(null);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  const fetchPage = useCallback(async () => {
    setLoading(true);
    try {
      const res = await GetMyProducts({
        pageNumber,
        pageSize: PAGE_SIZE,
        search: activeSearch || undefined,
      });
      const data = res.data ?? {};
      const list = data.items ?? data ?? [];
      const arr = Array.isArray(list) ? list : [];
      setItems(arr.map(normalizeProduct));
      setTotalCount(
        typeof data.totalCount === "number" ? data.totalCount : arr.length,
      );
    } catch {
      toast.error("Không tải được danh sách sản phẩm.");
    } finally {
      setLoading(false);
    }
  }, [pageNumber, activeSearch]);

  useEffect(() => {
    fetchPage();
  }, [fetchPage]);

  const handleSearch = () => {
    setActiveSearch(keyword.trim());
    setPageNumber(1);
  };

  const clearSearch = () => {
    setKeyword("");
    setActiveSearch("");
    setPageNumber(1);
  };

  const handleDelete = async () => {
    if (!deleting) return;
    try {
      await DeleteProductById(deleting.id);
      toast.success("Đã xoá sản phẩm.");
      setDeleting(null);
      // Xoá phần tử cuối của trang → lùi 1 trang, còn lại tải lại trang hiện tại
      if (items.length === 1 && pageNumber > 1) {
        setPageNumber(pageNumber - 1);
      } else {
        fetchPage();
      }
    } catch {
      toast.error("Xoá sản phẩm thất bại.");
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 md:p-6">
      <Card className="overflow-hidden rounded-2xl border-sky-100 bg-white shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b border-sky-100 bg-sky-50/50 px-5 py-4">
          <CardTitle className="flex items-center gap-2.5 text-base">
            <span className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-teal-500 text-white shadow-sm shadow-sky-600/20">
              <Package className="size-4" />
            </span>
            Sản phẩm của tôi
            <span className="rounded-full bg-sky-100 px-2.5 py-0.5 text-xs font-semibold text-sky-700 ring-1 ring-inset ring-sky-200">
              {totalCount}
            </span>
          </CardTitle>
          <Button
            size="sm"
            onClick={() => navigate("/products/new")}
            className="rounded-xl bg-gradient-to-r from-sky-500 to-teal-500 font-semibold text-white shadow-md shadow-sky-600/20 hover:from-sky-600 hover:to-teal-600"
          >
            <Plus className="mr-1 h-4 w-4" />
            Tạo sản phẩm
          </Button>
        </CardHeader>
        <CardContent className="space-y-3 px-5 py-5">
          <div className="flex gap-2 pb-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-sky-400" />
              <Input
                placeholder="Tìm sản phẩm của tôi..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="rounded-xl border-sky-100 bg-white pl-9 pr-9 focus-visible:border-sky-300 focus-visible:ring-sky-400"
              />
              {keyword && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-sky-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <Button
              variant="outline"
              onClick={handleSearch}
              className="rounded-xl border-sky-200 text-sky-700 hover:bg-sky-50 hover:text-sky-700"
            >
              Tìm kiếm
            </Button>
          </div>

          {loading ? (
            <p className="flex items-center justify-center gap-2 py-10 text-sm text-slate-500">
              <Loader2 className="h-4 w-4 animate-spin text-sky-500" />
              Đang tải sản phẩm...
            </p>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-sky-200 bg-sky-50/50 px-4 py-10 text-center">
              <span className="flex size-11 items-center justify-center rounded-full bg-sky-100 text-sky-500">
                <Package className="size-5" />
              </span>
              <p className="text-sm text-slate-500">
                {activeSearch
                  ? `Không tìm thấy sản phẩm nào khớp "${activeSearch}".`
                  : "Chưa có sản phẩm nào."}
              </p>
            </div>
          ) : (
            items.map((p) => {
              const meta = [
                p.brand,
                formatPrice(p.price),
                formatDate(p.createdAt),
              ]
                .filter(Boolean)
                .join(" • ");
              return (
                <div
                  key={p.id}
                  className="flex items-center gap-4 rounded-xl border border-sky-100 bg-white p-3 shadow-sm transition hover:border-sky-200 hover:bg-sky-50/50 hover:shadow"
                >
                  <Thumb src={p.thumbnailUrl} className="h-16 w-24" />

                  <div className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <Link
                        to={`/products/${p.id}`}
                        className="block truncate text-sm font-medium transition-colors hover:text-sky-600 hover:underline"
                      >
                        {p.name}
                      </Link>
                      {p.isDeleted && (
                        <Badge
                          variant="secondary"
                          className="shrink-0 gap-1.5 bg-zinc-100 text-zinc-600 hover:bg-zinc-100"
                        >
                          <span className="size-1.5 rounded-full bg-zinc-400" />
                          Đã ẩn
                        </Badge>
                      )}
                    </span>
                    {meta && (
                      <p className="mt-1 text-xs text-slate-500">{meta}</p>
                    )}
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigate(`/products/edit/${p.id}`)}
                      className="rounded-xl border-sky-200 text-sky-700 hover:bg-sky-50 hover:text-sky-700"
                    >
                      <Pencil className="mr-1 h-3 w-3" />
                      Sửa
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => setDeleting(p)}
                      className="rounded-xl shadow-sm"
                    >
                      <Trash2 className="mr-1 h-3 w-3" />
                      Xoá
                    </Button>
                  </div>
                </div>
              );
            })
          )}

          {totalPages > 1 && (
            <Pagination className="pt-4">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() =>
                      pageNumber > 1 && setPageNumber(pageNumber - 1)
                    }
                    className={
                      pageNumber <= 1
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer hover:bg-sky-50 hover:text-sky-700"
                    }
                  />
                </PaginationItem>

                {getPageItems(pageNumber, totalPages).map((item, i) => (
                  <PaginationItem key={`${item}-${i}`}>
                    {item === "..." ? (
                      <PaginationEllipsis />
                    ) : (
                      <PaginationLink
                        isActive={item === pageNumber}
                        onClick={() => setPageNumber(item)}
                        className="cursor-pointer hover:bg-sky-50 hover:text-sky-700 aria-[current=page]:border-sky-500 aria-[current=page]:bg-sky-500 aria-[current=page]:text-white aria-[current=page]:hover:bg-sky-500 aria-[current=page]:hover:text-white"
                      >
                        {item}
                      </PaginationLink>
                    )}
                  </PaginationItem>
                ))}

                <PaginationItem>
                  <PaginationNext
                    onClick={() =>
                      pageNumber < totalPages && setPageNumber(pageNumber + 1)
                    }
                    className={
                      pageNumber >= totalPages
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer hover:bg-sky-50 hover:text-sky-700"
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </CardContent>
      </Card>

      <AlertDialog
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
      >
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <span className="flex size-8 items-center justify-center rounded-lg bg-red-100 text-red-600">
                <Trash2 className="size-4" />
              </span>
              Xoá sản phẩm này?
            </AlertDialogTitle>
            <AlertDialogDescription>
              "{deleting?.name}" sẽ bị xoá vĩnh viễn và không khôi phục được.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Huỷ</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Xoá
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
