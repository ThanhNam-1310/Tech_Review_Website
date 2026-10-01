import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import ProductCard from "./ProductCard";

const PAGE_SIZE_OPTIONS = [5, 10, 15, 20];

export default function ProductGrid({
  products = [],
  loading = false,
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  pageSize = 10,
  onPageChange,
  onPageSizeChange,
}) {
  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center py-20 text-muted-foreground text-sm">
        Đang tải sản phẩm...
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center py-20 border rounded-xl bg-muted/20 text-muted-foreground text-sm">
        Không tìm thấy sản phẩm nào.
      </div>
    );
  }

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      onPageChange?.(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="w-full lg:w-3/4 flex flex-col px-4 py-3 rounded-3xl border-2 gap-3">
      {/* Toolbar: số lượng hiển thị */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <p className="text-sm text-muted-foreground">
          Hiển thị{" "}
          <span className="font-medium text-foreground">{products.length}</span>
          {" / "}
          <span className="font-medium text-foreground">{totalItems}</span> sản
          phẩm
        </p>

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground hidden sm:inline">
            Mỗi trang
          </span>
          <Select
            value={String(pageSize)}
            onValueChange={(val) => onPageSizeChange?.(Number(val))}
          >
            <SelectTrigger className="w-[90px] h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAGE_SIZE_OPTIONS.map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-5">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex justify-center">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => handlePageChange(currentPage - 1)}
                  className={cn(
                    currentPage <= 1 &&
                      "pointer-events-none opacity-50 cursor-not-allowed",
                  )}
                />
              </PaginationItem>

              {Array.from({ length: totalPages }).map((_, i) => {
                const page = i + 1;

                if (
                  page === 1 ||
                  page === totalPages ||
                  Math.abs(page - currentPage) <= 1
                ) {
                  return (
                    <PaginationItem key={page}>
                      <PaginationLink
                        isActive={page === currentPage}
                        onClick={() => handlePageChange(page)}
                        className="cursor-pointer"
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  );
                }

                if (page === currentPage - 2 || page === currentPage + 2) {
                  return (
                    <PaginationItem key={`ellipsis-${page}`}>
                      <PaginationEllipsis />
                    </PaginationItem>
                  );
                }

                return null;
              })}

              <PaginationItem>
                <PaginationNext
                  onClick={() => handlePageChange(currentPage + 1)}
                  className={cn(
                    currentPage >= totalPages &&
                      "pointer-events-none opacity-50 cursor-not-allowed",
                  )}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}
