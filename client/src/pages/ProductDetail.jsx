import { Link, useParams } from "react-router-dom";
import { ChevronLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

import ProductInfo from "@/components/products/ProductInfo";
import ProductComments from "@/components/products/ProductComments";

import { productDetail, comments } from "@/utils/demo/productDetailDemo";

export default function ProductDetail() {
  const { id } = useParams(); // dùng khi nối API thật

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 md:py-12">
        {/* Back button */}
        <div className="mb-6">
          <Button variant="ghost" size="sm" asChild className="gap-1.5 -ml-2">
            <Link to="/">
              <ChevronLeft className="h-4 w-4" />
              Quay lại
            </Link>
          </Button>
        </div>

        {/* Phần thông tin sản phẩm */}
        <ProductInfo product={productDetail} />

        <Separator className="my-10 md:my-14" />

        {/* Phần bình luận */}
        <ProductComments comments={comments} />
      </div>
    </div>
  );
}
