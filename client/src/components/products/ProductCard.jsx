import { Link } from "react-router-dom";
import { Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function ProductCard({ product }) {
  return (
    <Link
      to={`/products/${product.id}`}
      className="group flex flex-col overflow-hidden rounded-xl border bg-card transition-all duration-200 hover:shadow-md"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <img
          src={product.thumnailUrl || product.images?.[0] || "/placeholder.png"}
          alt={product.name}
          className="h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
          onError={(e) => {
            e.currentTarget.src = "/placeholder.png";
          }}
        />
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-3">
        <div className="flex items-center justify-between gap-2">
          <Badge
            variant="secondary"
            className="shrink-0 px-1.5 py-0 text-[10px] font-normal"
          >
            {product.categoryName || "Chưa phân loại"}
          </Badge>

          <div className="flex shrink-0 items-center gap-0.5 text-xs font-semibold">
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            {product.score ?? product.rating?.averageRating ?? 0}
          </div>
        </div>

        <h3 className="line-clamp-2 text-sm font-semibold leading-snug transition-colors group-hover:text-primary">
          {product.name}
        </h3>

        {product.price != null && (
          <p className="mt-auto text-sm font-semibold text-primary">
            {Number(product.price).toLocaleString("vi-VN")} ₫
          </p>
        )}
      </div>
    </Link>
  );
}
