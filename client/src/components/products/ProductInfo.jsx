// ProductInfo.jsx
import { useState, useEffect, useRef } from "react";
import {
  Heart,
  Eye,
  MessageCircle,
  Share2,
  Bookmark,
  ArrowLeftRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import CompareProductsDialog from "./CompareProductsDialog";
import { BarChart3 } from "lucide-react";
import SentimentStatsDialog from "./SentimentStatsDialog";

export default function ProductInfo({ product }) {
  // Gộp thumbnail + images, bỏ trùng
  const allImages = [product.thumnailUrl, ...(product.images || [])].filter(
    Boolean,
  );

  const uniqueImages = [...new Set(allImages)];
  const images = uniqueImages.length > 0 ? uniqueImages : ["/placeholder.png"];

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [sentimentOpen, setSentimentOpen] = useState(false);
  const [compareOpen, setCompareOpen] = useState(false);
  const timerRef = useRef(null);

  const selectedImage = images[selectedIndex];

  const startAutoPlay = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setSelectedIndex((prev) => (prev + 1) % images.length);
    }, 3000);
  };

  useEffect(() => {
    if (images.length <= 1) return;
    startAutoPlay();
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [selectedIndex, images.length]);

  const handleSelectImage = (index) => {
    setSelectedIndex(index);
  };

  const formatPrice = (price) => {
    if (price == null) return "Liên hệ";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const rating = product.rating || {};

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
      {/* Ảnh */}
      <div className="space-y-3 w-full">
        <div className="aspect-[4/3] w-full overflow-hidden rounded-xl border bg-muted flex items-center justify-center">
          <img
            src={selectedImage}
            alt={product.name}
            className="h-full w-full object-contain p-4 transition-opacity duration-300"
          />
        </div>

        <div className="flex gap-2.5 overflow-x-auto pb-1">
          {images.map((img, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleSelectImage(index)}
              className={`shrink-0 w-16 h-16 rounded-lg overflow-hidden border-[3px] transition-all ${
                selectedIndex === index
                  ? "border-orange-600 opacity-100"
                  : "border-transparent opacity-70 hover:opacity-100"
              }`}
            >
              <img src={img} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      </div>

      {/* Thông tin */}
      <div className="flex flex-col">
        {product.brand && (
          <Badge variant="secondary" className="w-fit mb-3">
            {product.brand}
          </Badge>
        )}

        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
          {product.name}
        </h1>

        {/* Rating stats */}
        <div className="flex flex-wrap items-center gap-4 mb-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Heart className="h-4 w-4" />
            <span>{rating.likeCount ?? 0}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Eye className="h-4 w-4" />
            <span>{rating.viewCount ?? 0}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <MessageCircle className="h-4 w-4" />
            <span>{rating.commentCount ?? 0}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Bookmark className="h-4 w-4" />
            <span>{rating.savedCount ?? 0}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Share2 className="h-4 w-4" />
            <span>{rating.sharedCount ?? 0}</span>
          </div>
        </div>

        <p className="text-sm text-muted-foreground mb-4">
          Ngày tạo: {formatDate(product.createdDate)}
        </p>

        <p className="text-2xl font-semibold text-primary mb-4">
          {formatPrice(product.price)}
        </p>

        {/* Nút so sánh */}
        <div className="mb-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => setCompareOpen(true)}
          >
            <ArrowLeftRight className="mr-2 h-4 w-4" />
            So sánh sản phẩm
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => setSentimentOpen(true)}
          >
            <BarChart3 className="mr-2 h-4 w-4" />
            Thống kê cảm xúc
          </Button>
        </div>

        <p className="text-muted-foreground leading-relaxed mb-8">
          {product.description || "Chưa có mô tả."}
        </p>

        {/* Specifications */}
        {product.specifications?.length > 0 && (
          <div className="rounded-xl border p-5">
            <h3 className="font-semibold mb-4">Thông số kỹ thuật</h3>
            <div className="space-y-3">
              {product.specifications.map((spec, i) => (
                <div
                  key={i}
                  className="flex justify-between text-sm py-1.5 border-b last:border-0"
                >
                  <span className="text-muted-foreground">
                    {spec.label || spec.name || spec.key}
                  </span>
                  <span className="font-medium text-right">{spec.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Dialog so sánh: trái = sản phẩm đang xem, phải = search chọn đối thủ */}
      <CompareProductsDialog
        open={compareOpen}
        onOpenChange={setCompareOpen}
        productA={product}
      />

      <SentimentStatsDialog
        open={sentimentOpen}
        onOpenChange={setSentimentOpen}
        productId={product.id}
        productName={product.name}
      />
    </div>
  );
}
