import { useState, useMemo, useEffect } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

import CategorySidebar from "../common/CategorySidebar";
import ProductGrid from "../products/ProductGrid";

export default function ProductReview({
  categories = [],
  products = [],
  loading = false,
}) {
  const [activeCategoryId, setActiveCategoryId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Lấy cả ID danh mục con khi chọn danh mục cha
  const getCategoryIds = (category) => [
    category.id,
    ...(category.children ?? []).flatMap(getCategoryIds),
  ];

  const filteredProducts = useMemo(() => {
    let result = products;

    if (activeCategoryId) {
      const findCategory = (items) => {
        for (const category of items) {
          if (category.id === activeCategoryId) {
            return category;
          }

          const found = findCategory(category.children ?? []);
          if (found) return found;
        }

        return null;
      };

      const selectedCategory = findCategory(categories);
      const categoryIds = selectedCategory
        ? getCategoryIds(selectedCategory)
        : [activeCategoryId];

      result = result.filter((product) =>
        categoryIds.includes(product.categoryId),
      );
    }

    if (searchTerm.trim()) {
      const keyword = searchTerm.trim().toLowerCase();

      result = result.filter((product) =>
        (product.name ?? "").toLowerCase().includes(keyword),
      );
    }

    return result;
  }, [products, categories, activeCategoryId, searchTerm]);

  const totalPages = Math.ceil(filteredProducts.length / pageSize) || 1;

  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredProducts.slice(start, start + pageSize);
  }, [filteredProducts, currentPage, pageSize]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategoryId, searchTerm, pageSize]);

  return (
    <section className="container mx-auto px-4 py-10 md:py-14">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 md:mb-10">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
            Gian hàng sản phẩm
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
        <CategorySidebar
          categories={categories}
          activeCategoryId={activeCategoryId}
          onSelect={setActiveCategoryId}
        />

        <ProductGrid
          products={paginatedProducts}
          loading={loading}
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredProducts.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
        />
      </div>
    </section>
  );
}
