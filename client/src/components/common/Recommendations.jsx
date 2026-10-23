import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { Eye, Heart, Sparkles } from "lucide-react";
import { GetProductRecommendations } from "@/apis/product.api";
import { GetPostRecommendations } from "@/apis/post.api";

// Chuẩn hoá 1 item gợi ý về cùng 1 dạng để render.
// BE có thể trả DTO phẳng hoặc dạng { item, score } — hàm này xử lý cả hai,
// và chịu được các tên field khác nhau (id/productId/postId/itemId,
// title/name, thumnailUrl...).
function chuanHoaItem(item, type) {
  const goc = item?.item ?? item?.product ?? item?.post ?? item ?? {};
  const diem = item?.score ?? item?.doTuongDong ?? goc.score ?? goc.doTuongDong;

  if (type === "product") {
    const id = goc.id ?? goc.productId ?? goc.itemId;
    return {
      id,
      link: `/products/${id}`,
      ten: goc.name ?? goc.title ?? "",
      anh:
        goc.thumnailUrl ??
        goc.thumbnailUrl ??
        goc.images?.[0] ??
        "/placeholder.png",
      phu: goc.brand ?? "",
      gia: goc.price,
      diem,
    };
  }

  const id = goc.id ?? goc.postId ?? goc.itemId;
  return {
    id,
    link: `/post/${id}`,
    ten: goc.title ?? "",
    anh: goc.thumbnailUrl ?? goc.thumnailUrl ?? "/placeholder.png",
    phu: goc.authorName ?? "",
    ngay: goc.publicDate,
    luotXem: goc.viewCount,
    luotThich: goc.likeCount,
    diem,
  };
}

// Khung chờ giữ chỗ trong lúc tải gợi ý
const SkeletonCard = () => (
  <div className="w-[220px] shrink-0 overflow-hidden rounded-xl border bg-card">
    <div className="aspect-[4/3] w-full animate-pulse bg-muted" />
    <div className="space-y-2 p-3">
      <div className="h-3.5 animate-pulse rounded bg-muted" />
      <div className="h-3.5 w-2/3 animate-pulse rounded bg-muted" />
      <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
    </div>
  </div>
);

export default function Recommendations({
  type = "product",
  id,
  title,
  limit = 10,
}) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const donDepRef = useRef(null);

  // Lấy dữ liệu gợi ý mỗi khi đổi sản phẩm / bài viết đang xem
  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    let conSong = true;
    setLoading(true);
    const layDuLieu =
      type === "product" ? GetProductRecommendations : GetPostRecommendations;
    layDuLieu(id, limit)
      .then((res) => {
        const data = res.data?.data ?? res.data;
        const danhSach = Array.isArray(data)
          ? data
          : (data?.items ?? data?.recommendations ?? []);
        if (conSong) {
          setItems(
            danhSach.map((it) => chuanHoaItem(it, type)).filter((it) => it.id),
          );
        }
      })
      .catch(() => conSong && setItems([]))
      .finally(() => conSong && setLoading(false));
    return () => {
      conSong = false;
    };
  }, [type, id, limit]);

  // Chỉ cuộn bằng con lăn chuột giữa: lăn xuống -> list chạy sang phải,
  // lăn lên -> sang trái; chạm mép list thì nhả ra cho trang cuộn tiếp.
  // Gắn bằng callback ref (node mount là gắn ngay) + listener native
  // với passive: false thì mới preventDefault chặn cuộn trang được.
  // LƯU Ý: list này KHÔNG được dùng snap-x/snap-start — điểm snap của
  // card sẽ hút scrollLeft về vị trí cũ sau mỗi bước lăn nhỏ.
  const datRefList = useCallback((el) => {
    if (donDepRef.current) {
      donDepRef.current();
      donDepRef.current = null;
    }
    if (!el) return;

    const xuLyCuon = (e) => {
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
      if (el.scrollWidth <= el.clientWidth) return;
      // Firefox báo delta theo dòng (deltaMode = 1) -> đổi sang pixel
      const buoc = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaY;
      const toiDa = el.scrollWidth - el.clientWidth;
      const dangO = el.scrollLeft;
      const muonSangPhai = buoc > 0;
      if ((muonSangPhai && dangO >= toiDa - 1) || (!muonSangPhai && dangO <= 0))
        return;
      el.scrollLeft += buoc;
      e.preventDefault();
    };

    el.addEventListener("wheel", xuLyCuon, { passive: false });
    donDepRef.current = () => el.removeEventListener("wheel", xuLyCuon);
  }, []);

  const formatPrice = (price) =>
    price == null
      ? null
      : new Intl.NumberFormat("vi-VN", {
          style: "currency",
          currency: "VND",
        }).format(price);

  const formatDate = (dateStr) =>
    dateStr
      ? new Date(dateStr).toLocaleDateString("vi-VN", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        })
      : "";

  const tieuDe =
    title ?? (type === "product" ? "Sản phẩm tương tự" : "Bài viết liên quan");

  return (
    <section className="mt-12">
      <h2 className="text-xl font-semibold mb-4">{tieuDe}</h2>

      {loading ? (
        // Đang tải: hiện khung chờ
        <div className="flex gap-4 overflow-hidden pb-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : items.length === 0 ? (
        // Không có gợi ý: vẫn hiện khung kèm thông báo
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed px-4 py-10 text-center">
          <Sparkles className="h-6 w-6 text-muted-foreground" />
          <p className="text-sm font-medium">
            {type === "product"
              ? "Chưa có sản phẩm tương tự nào"
              : "Chưa có bài viết liên quan nào"}
          </p>
          <p className="max-w-md text-xs text-muted-foreground">
            Gợi ý cần thêm dữ liệu cùng chủ đề — khi có thêm{" "}
            {type === "product" ? "sản phẩm" : "bài viết"} cùng danh mục, mục
            này sẽ tự có nội dung.
          </p>
        </div>
      ) : (
        <div
          ref={datRefList}
          className="flex gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        >
          {items.map((sp) => (
            <Link
              key={sp.id}
              to={sp.link}
              className="group w-[220px] shrink-0 overflow-hidden rounded-xl border bg-card transition-shadow hover:shadow-md"
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
                <img
                  src={sp.anh}
                  alt={sp.ten}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                {/* {sp.diem != null && (
                  <span className="absolute left-2 top-2 rounded-full bg-black/60 px-2 py-0.5 text-[11px] font-medium text-white">
                    {Math.round(sp.diem <= 1 ? sp.diem * 100 : sp.diem)}% tương
                    đồng
                  </span>
                )} */}
              </div>
              <div className="p-3">
                <h3 className="line-clamp-2 min-h-[2.5rem] text-sm font-medium leading-snug">
                  {sp.ten}
                </h3>
                {type === "product" ? (
                  <>
                    {sp.phu && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        {sp.phu}
                      </p>
                    )}
                    {sp.gia != null && (
                      <p className="mt-1 text-sm font-semibold text-primary">
                        {formatPrice(sp.gia)}
                      </p>
                    )}
                  </>
                ) : (
                  <>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {sp.phu}
                      {sp.ngay ? ` · ${formatDate(sp.ngay)}` : ""}
                    </p>
                    <div className="mt-1.5 flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Eye className="h-3.5 w-3.5" /> {sp.luotXem ?? 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart className="h-3.5 w-3.5" /> {sp.luotThich ?? 0}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
