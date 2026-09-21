import { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import { Star, Search, ChevronRight } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import { cn } from "@/lib/utils";

const ITEMS_PER_PAGE = 6; // Số sản phẩm mỗi trang

export default function ProductReview({
  categories = [],
  products = [],
  loading = false,
}) {
  const [activeCategoryId, setActiveCategoryId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedParents, setExpandedParents] = useState({});
  const [currentPage, setCurrentPage] = useState(1);

  // Lọc sản phẩm theo category + search
  const filteredProducts = useMemo(() => {
    let result = products;

    if (activeCategoryId) {
      result = result.filter((p) => p.categoryId === activeCategoryId);
    }

    if (searchTerm.trim()) {
      const lower = searchTerm.toLowerCase();
      result = result.filter((p) => p.name.toLowerCase().includes(lower));
    }

    return result;
  }, [products, activeCategoryId, searchTerm]);

  // Tính tổng số trang
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE) || 1;

  // Lấy sản phẩm của trang hiện tại
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  // Khi đổi category hoặc search thì về trang 1
  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategoryId, searchTerm]);

  const toggleParent = (id) => {
    setExpandedParents((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <section className="container mx-auto px-4 py-10 md:py-14">
      {/* ===== HEADER + SEARCH ===== */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 md:mb-10">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
            Đánh giá sản phẩm
          </h2>
          <p className="text-muted-foreground mt-1.5 text-sm md:text-base">
            Khám phá các sản phẩm công nghệ được đánh giá chi tiết
          </p>
        </div>

        <div className="relative w-full sm:w-72 md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm sản phẩm..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-10"
          />
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 lg:gap-10">
        {/* ====================== LEFT: Categories ====================== */}
        <aside className="w-full lg:w-1/4">
          <div className="lg:sticky lg:top-24 space-y-4">
            <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">
              Danh mục
            </h3>

            <div className="rounded-xl border bg-card p-3 shadow-sm max-h-[60vh] overflow-y-auto">
              <div className="space-y-0.5">
                <button
                  onClick={() => setActiveCategoryId(null)}
                  className={cn(
                    "w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    activeCategoryId === null
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted",
                  )}
                >
                  Tất cả
                </button>

                {categories.map((category) => {
                  const hasChildren = category.children?.length > 0;
                  const isExpanded = expandedParents[category.id];

                  return (
                    <div key={category.id}>
                      <div className="flex items-center">
                        {hasChildren ? (
                          <button
                            onClick={() => toggleParent(category.id)}
                            className="p-1.5 hover:bg-muted rounded-md shrink-0"
                          >
                            <ChevronRight
                              className={cn(
                                "h-4 w-4 transition-transform",
                                isExpanded && "rotate-90",
                              )}
                            />
                          </button>
                        ) : (
                          <div className="w-7" />
                        )}

                        <button
                          onClick={() => setActiveCategoryId(category.id)}
                          className={cn(
                            "flex-1 text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                            activeCategoryId === category.id
                              ? "bg-primary text-primary-foreground"
                              : "hover:bg-muted",
                          )}
                        >
                          {category.name}
                        </button>
                      </div>

                      {hasChildren && isExpanded && (
                        <div className="ml-7 mt-0.5 space-y-0.5 border-l pl-2">
                          {category.children.map((child) => (
                            <button
                              key={child.id}
                              onClick={() => setActiveCategoryId(child.id)}
                              className={cn(
                                "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors",
                                activeCategoryId === child.id
                                  ? "bg-primary text-primary-foreground font-medium"
                                  : "hover:bg-muted text-muted-foreground",
                              )}
                            >
                              {child.name}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </aside>

        {/* ====================== RIGHT: Products ====================== */}
        <div className="w-full lg:w-3/4 flex flex-col">
          {loading ? (
            <div className="flex-1 flex items-center justify-center py-20 text-muted-foreground text-sm">
              Đang tải sản phẩm...
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="flex-1 flex items-center justify-center py-20 border rounded-xl bg-muted/20 text-muted-foreground text-sm">
              Không tìm thấy sản phẩm nào.
            </div>
          ) : (
            <>
              {/* Grid sản phẩm (đã phân trang) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 md:gap-6">
                {paginatedProducts.map((product) => (
                  <Link
                    key={product.id}
                    to={`/products/${product.id}`}
                    className="group flex flex-col overflow-hidden rounded-2xl border bg-card transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>

                    <div className="flex flex-1 flex-col p-4 md:p-5">
                      <div className="flex items-center justify-between mb-2.5">
                        <Badge
                          variant="secondary"
                          className="font-normal text-xs"
                        >
                          {product.categoryName}
                        </Badge>
                        <div className="flex items-center gap-1 text-sm font-semibold">
                          <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                          {product.score}
                        </div>
                      </div>

                      <h3 className="font-semibold text-sm md:text-base leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                        {product.name}
                      </h3>

                      {product.price && (
                        <p className="mt-auto pt-3 text-sm md:text-base font-semibold text-primary">
                          {product.price}
                        </p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>

              {/* Pagination - luôn hiện khi > 1 trang */}
              {totalPages > 1 && (
                <div className="mt-10 flex justify-center">
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

                        // Hiện trang đầu, cuối, và quanh trang hiện tại
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

                        // Hiện dấu ...
                        if (
                          page === currentPage - 2 ||
                          page === currentPage + 2
                        ) {
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
            </>
          )}
        </div>
      </div>
    </section>
  );
}
