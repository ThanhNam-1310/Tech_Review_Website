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
      className={`object-cover rounded border shrink-0 ${className}`}
    />
  ) : (
    <div
      className={`rounded border bg-muted flex items-center justify-center shrink-0 ${className}`}
    >
      <ImageOff className="h-4 w-4 text-muted-foreground" />
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
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">
            Sản phẩm của tôi ({totalCount})
          </CardTitle>
          <Button size="sm" onClick={() => navigate("/products/new")}>
            <Plus className="mr-1 h-4 w-4" />
            Tạo sản phẩm
          </Button>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex gap-2 pb-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm sản phẩm của tôi..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="pl-9 pr-9"
              />
              {keyword && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <Button onClick={handleSearch}>Tìm kiếm</Button>
          </div>

          {loading ? (
            <p className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Đang tải sản phẩm...
            </p>
          ) : items.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">
              {activeSearch
                ? `Không tìm thấy sản phẩm nào khớp "${activeSearch}".`
                : "Chưa có sản phẩm nào."}
            </p>
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
                  className="flex items-center gap-4 rounded-lg border p-3"
                >
                  <Thumb src={p.thumbnailUrl} className="w-20 h-14" />

                  <div className="flex-1 min-w-0">
                    <span className="flex items-center gap-2">
                      <Link
                        to={`/products/${p.id}`}
                        className="font-medium text-sm truncate hover:underline block"
                      >
                        {p.name}
                      </Link>
                      {p.isDeleted && (
                        <Badge variant="secondary" className="shrink-0">
                          Đã ẩn
                        </Badge>
                      )}
                    </span>
                    {meta && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {meta}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigate(`/products/edit/${p.id}`)}
                    >
                      <Pencil className="h-3 w-3 mr-1" />
                      Sửa
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => setDeleting(p)}
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
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
                        : "cursor-pointer"
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
                        className="cursor-pointer"
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
                        : "cursor-pointer"
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
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xoá sản phẩm này?</AlertDialogTitle>
            <AlertDialogDescription>
              "{deleting?.name}" sẽ bị xoá vĩnh viễn và không khôi phục được.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Huỷ</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Xoá
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
