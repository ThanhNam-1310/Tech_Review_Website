import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { GetProductSentimentStats } from "@/apis/comment.api";

const NHAN_THONG_KE = [
  { key: "positive", ten: "Tích cực", mauThanh: "bg-emerald-500", mauChu: "text-emerald-600" },
  { key: "negative", ten: "Tiêu cực", mauThanh: "bg-rose-500", mauChu: "text-rose-600" },
  { key: "neutral", ten: "Trung lập", mauThanh: "bg-zinc-400", mauChu: "text-zinc-500" },
];

export default function SentimentStatsDialog({ open, onOpenChange, productId, productName }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !productId) return;
    setLoading(true);
    setStats(null);
    GetProductSentimentStats(productId)
      .then(setStats)
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
  }, [open, productId]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Thống kê cảm xúc bình luận</DialogTitle>
          {productName && (
            <p className="text-sm text-muted-foreground">{productName}</p>
          )}
        </DialogHeader>

        {loading ? (
          <p className="py-6 text-center text-sm text-muted-foreground">Đang tải...</p>
        ) : !stats || stats.total === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Sản phẩm này chưa có bình luận nào được phân loại.
          </p>
        ) : (
          <div className="space-y-5 py-2">
            {NHAN_THONG_KE.map(({ key, ten, mauThanh, mauChu }) => {
              const phanTram = stats[`${key}Percent`] ?? 0;
              const soLuong = stats[`${key}Count`] ?? 0;
              return (
                <div key={key}>
                  <div className="mb-1.5 flex items-center justify-between text-sm">
                    <span className={`font-medium ${mauChu}`}>{ten}</span>
                    <span className="text-muted-foreground">
                      {soLuong} bình luận ·{" "}
                      <span className="font-semibold text-foreground">
                        {phanTram.toFixed(2)}%
                      </span>
                    </span>
                  </div>
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className={`h-full rounded-full ${mauThanh} transition-all duration-500`}
                      style={{ width: `${phanTram}%` }}
                    />
                  </div>
                </div>
              );
            })}
            <p className="pt-1 text-center text-xs text-muted-foreground">
              Dựa trên {stats.total} bình luận đã được mô hình phân loại
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
