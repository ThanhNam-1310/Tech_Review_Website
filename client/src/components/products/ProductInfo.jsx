import { useState, useEffect, useRef } from "react";
import { Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function ProductInfo({ product }) {
  const images = product.images?.length ? product.images : [product.image];
  const [selectedIndex, setSelectedIndex] = useState(0);
  const timerRef = useRef(null);

  const selectedImage = images[selectedIndex];

  // Reset timer: mỗi 3s chuyển ảnh tiếp theo
  const startAutoPlay = () => {
    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(() => {
      setSelectedIndex((prev) => (prev + 1) % images.length);
    }, 3000);
  };

  // Chạy autoplay khi index / danh sách ảnh đổi
  useEffect(() => {
    if (images.length <= 1) return;

    startAutoPlay();

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [selectedIndex, images.length]);

  // Click thumbnail → đổi ảnh + reset timer từ đầu
  const handleSelectImage = (index) => {
    setSelectedIndex(index);
    // useEffect sẽ clear + set lại timeout
  };

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

        {/* Thumbnail */}
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
        <Badge variant="secondary" className="w-fit mb-3">
          {product.categoryName}
        </Badge>

        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
          {product.name}
        </h1>

        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-1.5">
            <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
            <span className="text-xl font-semibold">{product.score}</span>
            <span className="text-muted-foreground text-sm">/ 10</span>
          </div>
          <span className="text-muted-foreground text-sm">
            {product.publishedAt} · {product.readTime}
          </span>
        </div>

        <p className="text-2xl font-semibold text-primary mb-6">
          {product.price}
        </p>

        <p className="text-muted-foreground leading-relaxed mb-8">
          {product.summary}
        </p>

        <div className="rounded-xl border p-5">
          <h3 className="font-semibold mb-4">Thông số kỹ thuật</h3>
          <div className="space-y-3">
            {product.specs?.map((spec, i) => (
              <div
                key={i}
                className="flex justify-between text-sm py-1.5 border-b last:border-0"
              >
                <span className="text-muted-foreground">{spec.label}</span>
                <span className="font-medium text-right">{spec.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
