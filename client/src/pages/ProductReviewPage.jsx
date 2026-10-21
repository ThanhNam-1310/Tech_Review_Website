import { useEffect, useState } from "react";
import ProductReview from "@/components/sections/ProductReview";
import { GetAllCategories } from "@/apis/category.api";
import { GetAllProduct } from "@/apis/product.api";

const ProductReviewPage = () => {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const [categoryResponse, productResponse] = await Promise.all([
          GetAllCategories(),
          GetAllProduct(),
        ]);

        const categoryData = categoryResponse.data;
        const productData = productResponse.data;

        setCategories(
          Array.isArray(categoryData)
            ? categoryData
            : (categoryData?.items ?? []),
        );

        setProducts(
          Array.isArray(productData) ? productData : (productData?.items ?? []),
        );

        console.log("Product API response:", productResponse.data);
      } catch (error) {
        console.error("Lỗi lấy dữ liệu từ BE:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      <ProductReview
        categories={categories}
        products={products}
        loading={loading}
      />
    </div>
  );
};

export default ProductReviewPage;
