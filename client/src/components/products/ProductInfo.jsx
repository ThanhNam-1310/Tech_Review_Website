import { useState } from "react";
import { Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function ProductInfo({ product }) {
  const [selectedImage, setSelectedImage] = useState(product.image);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
      {/* Ảnh */}
      <div className="space-y-4">
        <div className="aspect-square overflow-hidden rounded-2xl border bg-muted">
          <img
            src={selectedImage}
            alt={product.name}
            className="h-full w-full object-cover"
          />
        </div>

        {/* Thumbnail */}
        <div className="flex gap-3 overflow-x-auto pb-1">
          {product.images?.map((img, index) => (
            <button
              key={index}
              onClick={() => setSelectedImage(img)}
              className={`shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                selectedImage === img
                  ? "border-primary"
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

        {/* Pros & Cons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <div className="rounded-xl border p-4 bg-green-50/50 dark:bg-green-950/20">
            <h3 className="font-semibold text-green-700 dark:text-green-400 mb-2">
              Ưu điểm
            </h3>
            <ul className="space-y-1.5 text-sm">
              {product.pros?.map((item, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-green-600">+</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl border p-4 bg-red-50/50 dark:bg-red-950/20">
            <h3 className="font-semibold text-red-700 dark:text-red-400 mb-2">
              Nhược điểm
            </h3>
            <ul className="space-y-1.5 text-sm">
              {product.cons?.map((item, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-red-600">−</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Specs */}
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
