// ProductDetail.jsx
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ChevronLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import ProductInfo from "@/components/products/ProductInfo";
import Comments from "@/components/common/Comment";
import { GetDetailProductById } from "@/apis/product.api";

export default function ProductDetail() {
  const { id } = useParams();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) {
        setError("Không tìm thấy ID sản phẩm.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const res = await GetDetailProductById(id);
        const result = res.data?.data ?? res.data;

        console.log("Product API response:", result);

        if (!result || typeof result !== "object") {
          setProduct(null);
          setError("Dữ liệu sản phẩm không hợp lệ.");
          return;
        }

        setProduct(result);
      } catch (err) {
        console.error("Fetch product error:", err.response?.data || err);
        setError(
          err.response?.data?.message ||
            err.response?.data?.title ||
            "Không thể tải thông tin sản phẩm.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="mb-6">
          <Button variant="ghost" size="sm" asChild className="-ml-2 gap-1.5">
            <Link to="/products">
              <ChevronLeft className="h-4 w-4" />
              Quay lại
            </Link>
          </Button>
        </div>

        {loading ? (
          <div className="py-16 text-center text-muted-foreground">
            Đang tải thông tin sản phẩm...
          </div>
        ) : error ? (
          <div className="py-16 text-center text-destructive">{error}</div>
        ) : product ? (
          <>
            <ProductInfo product={product} />
            <Separator className="my-10 md:my-14" />
            <Comments type="product" targetId={id} />
          </>
        ) : (
          <div className="py-16 text-center text-muted-foreground">
            Không tìm thấy sản phẩm.
          </div>
        )}
      </div>
    </div>
  );
}
