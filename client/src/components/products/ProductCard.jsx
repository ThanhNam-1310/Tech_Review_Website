import { Link } from "react-router-dom";
import { Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function ProductCard({ product }) {
  return (
    <Link
      to={`/products/${product.id}`}
      className="group flex flex-col overflow-hidden rounded-xl border bg-card transition-all duration-200 hover:shadow-md"
    >
      {/* object-contain: không cắt ảnh */}
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
        />
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-3">
        <div className="flex items-center justify-between gap-2">
          <Badge
            variant="secondary"
            className="font-normal text-[10px] px-1.5 py-0 shrink-0"
          >
            {product.categoryName}
          </Badge>
          <div className="flex items-center gap-0.5 text-xs font-semibold shrink-0">
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            {product.score}
          </div>
        </div>

        <h3 className="font-semibold text-sm leading-snug line-clamp-2 group-hover:text-primary transition-colors">
          {product.name}
        </h3>

        {product.price && (
          <p className="mt-auto text-sm font-semibold text-primary">
            {product.price}
          </p>
        )}
      </div>
    </Link>
  );
}
