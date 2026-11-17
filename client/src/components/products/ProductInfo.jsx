// ProductInfo.jsx
import { useState, useEffect, useRef } from "react";
import {
  ArrowLeftRight,
  BarChart3,
  BadgeCheck,
  SlidersHorizontal,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import CompareProductsDialog from "./CompareProductsDialog";
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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
      {/* Ảnh */}
      <div className="space-y-3 w-full">
        <div className="aspect-[4/3] w-full overflow-hidden rounded-2xl border border-sky-100 bg-white shadow-sm flex items-center justify-center">
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
              className={`shrink-0 w-16 h-16 rounded-xl overflow-hidden border-[3px] transition-all ${
                selectedIndex === index
                  ? "border-sky-500 opacity-100 shadow-sm"
                  : "border-sky-100 opacity-60 hover:opacity-100"
              }`}
            >
              <img src={img} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      </div>

      {/* Thông tin */}
      <div className="flex flex-col">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          {product.brand && (
            <Badge className="bg-sky-100 text-sky-700 hover:bg-sky-100">
              {product.brand}
            </Badge>
          )}
          {product.isCreatedByExpert && (
            <Badge className="gap-1 bg-violet-600 text-white hover:bg-violet-600">
              <BadgeCheck className="h-3 w-3" />
              Chuyên gia bình chọn
            </Badge>
          )}
        </div>

        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
          {product.name}
        </h1>

        <p className="text-sm text-slate-400 mb-4">
          Ngày tạo: {formatDate(product.createdDate)}
        </p>

        <p className="text-3xl font-bold text-sky-700 mb-4">
          {formatPrice(product.price)}
        </p>

        {/* Nút so sánh */}
        <div className="mb-6 flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setCompareOpen(true)}
            className="rounded-xl border-sky-200 text-sky-700 hover:bg-sky-50 hover:text-sky-700"
          >
            <ArrowLeftRight className="mr-2 h-4 w-4" />
            So sánh sản phẩm
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => setSentimentOpen(true)}
            className="rounded-xl border-sky-200 text-sky-700 hover:bg-sky-50 hover:text-sky-700"
          >
            <BarChart3 className="mr-2 h-4 w-4" />
            Thống kê cảm xúc
          </Button>
        </div>

        <p className="text-zinc-600 leading-relaxed mb-8">
          {product.description || "Chưa có mô tả."}
        </p>

        {/* Specifications */}
        {product.specifications?.length > 0 && (
          <div className="rounded-2xl border border-sky-100 bg-white p-5 shadow-sm">
            <h3 className="mb-4 flex items-center gap-2 font-semibold">
              <span className="flex size-7 items-center justify-center rounded-lg bg-sky-100 text-sky-600">
                <SlidersHorizontal className="size-4" />
              </span>
              Thông số kỹ thuật
            </h3>
            <div className="space-y-3">
              {product.specifications.map((spec, i) => (
                <div
                  key={i}
                  className="flex justify-between text-sm py-1.5 border-b border-sky-50 last:border-0"
                >
                  <span className="text-slate-500">
                    {spec.label || spec.name || spec.key}
                  </span>
                  <span className="font-medium text-right text-zinc-800">
                    {spec.value}
                  </span>
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
