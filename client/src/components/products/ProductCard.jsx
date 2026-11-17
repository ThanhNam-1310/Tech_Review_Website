import { Link } from "react-router-dom";
import { BadgeCheck } from "lucide-react";
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
        {product.isCreatedByExpert && (
          <Badge className="w-fit gap-1 bg-violet-600 px-2 py-0.5 text-[11px] font-medium text-white hover:bg-violet-600">
            <BadgeCheck className="h-3 w-3" />
            Chuyên gia bình chọn
          </Badge>
        )}

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
