// CompareProductsDialog.jsx
import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Search, X } from "lucide-react";
import { GetAllProduct, GetDetailProductById } from "@/apis/product.api";

const formatPrice = (price) => {
  if (price == null) return "Liên hệ";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
};

const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const idOf = (p) => p?.id ?? p?.Id ?? p?.productId ?? p?.ProductId;
const thumbOf = (p) =>
  p?.thumbnailUrl ?? p?.thumnailUrl ?? p?.images?.[0] ?? "/placeholder.png";
const specNameOf = (s) => s.label || s.name || s.key || "";

const ProductHead = ({ product }) => (
  <div className="flex h-full min-w-0 flex-col items-center gap-3 rounded-2xl border bg-card p-6 text-center shadow-sm">
    <div className="flex aspect-[4/3] w-full max-w-[360px] items-center justify-center overflow-hidden rounded-xl bg-muted">
      <img
        src={thumbOf(product)}
        alt={product.name}
        className="h-full w-full object-contain p-3"
      />
    </div>
    {product.brand && (
      <Badge variant="secondary" className="w-fit">
        {product.brand}
      </Badge>
    )}
    <h3 className="text-xl font-semibold leading-snug">{product.name}</h3>
    <p className="mt-auto text-2xl font-bold text-primary">
      {formatPrice(product.price)}
    </p>
  </div>
);

export default function CompareProductsDialog({
  open,
  onOpenChange,
  productA,
}) {
  // Đối thủ so sánh (bản đầy đủ, đã qua GetDetailProductById)
  const [productB, setProductB] = useState(null);
  const [onlyDiff, setOnlyDiff] = useState(false);

  // Search sản phẩm
  const [keyword, setKeyword] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);
  const [loadingDetailId, setLoadingDetailId] = useState(null);
  const [error, setError] = useState("");

  // Mỗi lần mở dialog thì reset trạng thái chọn/search
  useEffect(() => {
    if (open) {
      setProductB(null);
      setOnlyDiff(false);
      setKeyword("");
      setResults([]);
      setSearched(false);
      setError("");
    }
  }, [open]);

  const handleSearch = async () => {
    const term = keyword.trim();
    if (!term) {
      setResults([]);
      setSearched(false);
      return;
    }
    setSearching(true);
    setSearched(true);
    setError("");
    try {
      const res = await GetAllProduct({
        search: term,
        pageNumber: 1,
        pageSize: 10,
      });
      const data = res.data ?? {};
      const items = data.items ?? data ?? [];
      // Không cho so sánh sản phẩm với chính nó
      setResults(items.filter((p) => idOf(p) !== idOf(productA)));
    } catch (err) {
      console.error("Lỗi search product:", err);
      setResults([]);
      setError("Tìm kiếm thất bại, thử lại sau.");
    } finally {
      setSearching(false);
    }
  };

  // Chọn 1 kết quả → lấy bản đầy đủ (có specifications) rồi mới so sánh
  const handleSelect = async (item) => {
    const id = idOf(item);
    if (!id) return;
    setLoadingDetailId(id);
    setError("");
    try {
      const res = await GetDetailProductById(id);
      const detail = res.data?.data ?? res.data;
      if (!detail) throw new Error("Không lấy được chi tiết sản phẩm");
      setProductB(detail);
    } catch (err) {
      console.error("Lỗi load product detail:", err);
      setError("Không tải được chi tiết sản phẩm, thử lại sau.");
    } finally {
      setLoadingDetailId(null);
    }
  };

  // Gộp thông tin cơ bản + specifications thành từng dòng so sánh
  const { basicRows, specRows } = useMemo(() => {
    if (!productA || !productB) return { basicRows: [], specRows: [] };

    const withDiff = (r) => ({ ...r, diff: String(r.a) !== String(r.b) });

    const basic = [
      {
        label: "Thương hiệu",
        a: productA.brand || "—",
        b: productB.brand || "—",
      },
      {
        label: "Giá",
        a: formatPrice(productA.price),
        b: formatPrice(productB.price),
      },
      {
        label: "Ngày tạo",
        a: formatDate(productA.createdDate ?? productA.createdAt),
        b: formatDate(productB.createdDate ?? productB.createdAt),
      },
    ].map(withDiff);

    const mapA = new Map(
      (productA.specifications || []).map((s) => [
        specNameOf(s).toLowerCase(),
        { name: specNameOf(s), value: s.value },
      ]),
    );
    const mapB = new Map(
      (productB.specifications || []).map((s) => [
        specNameOf(s).toLowerCase(),
        { name: specNameOf(s), value: s.value },
      ]),
    );

    const keys = [...new Set([...mapA.keys(), ...mapB.keys()])];
    const specs = keys
      .map((k) => ({
        label: mapA.get(k)?.name || mapB.get(k)?.name,
        a: mapA.get(k)?.value ?? "—",
        b: mapB.get(k)?.value ?? "—",
      }))
      .map(withDiff);

    return { basicRows: basic, specRows: specs };
  }, [productA, productB]);

  const visibleBasic = onlyDiff ? basicRows.filter((r) => r.diff) : basicRows;
  const visibleSpecs = onlyDiff ? specRows.filter((r) => r.diff) : specRows;
  const diffCount = [...basicRows, ...specRows].filter((r) => r.diff).length;
  const nothingVisible = visibleBasic.length === 0 && visibleSpecs.length === 0;

  const ROW_GRID =
    "grid grid-cols-[120px_minmax(0,1fr)_minmax(0,1fr)] md:grid-cols-[240px_minmax(0,1fr)_minmax(0,1fr)] items-center";

  const renderRow = (row, i) => (
    <div
      key={i}
      className={`${ROW_GRID} px-5 py-3.5 text-[15px] border-t ${
        row.diff
          ? "bg-orange-50 dark:bg-orange-950/30"
          : i % 2 === 1
            ? "bg-muted/30"
            : ""
      }`}
    >
      <span className="text-muted-foreground">{row.label}</span>
      <span
        className={`text-center px-3 break-words ${row.diff ? "font-semibold" : ""}`}
      >
        {row.a}
      </span>
      <span
        className={`text-center px-3 break-words ${row.diff ? "font-semibold" : ""}`}
      >
        {row.b}
      </span>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[97vw] max-w-7xl sm:max-w-7xl max-h-[92vh] overflow-y-auto overflow-x-hidden p-6 md:p-10">
        <DialogHeader>
          <DialogTitle className="text-2xl">So sánh sản phẩm</DialogTitle>
          <DialogDescription>
            Đối chiếu thông tin cơ bản và thông số kỹ thuật giữa 2 sản phẩm.
          </DialogDescription>
        </DialogHeader>

        {!productA ? (
          <p className="text-sm text-muted-foreground py-10 text-center">
            Chưa có sản phẩm để so sánh.
          </p>
        ) : !productB ? (
          /* ===== Chưa chọn đối thủ: trái = sản phẩm đang xem, phải = search ===== */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 items-start">
            <div className="min-w-0">
              <p className="text-sm font-semibold mb-3">Sản phẩm đang xem</p>
              <ProductHead product={productA} />
            </div>

            <div className="min-w-0 rounded-2xl border bg-card p-6 shadow-sm">
              <p className="text-sm font-semibold mb-3">
                Chọn sản phẩm so sánh
              </p>

              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Nhập tên sản phẩm..."
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    className="pl-9 pr-9"
                  />
                  {keyword && (
                    <button
                      type="button"
                      onClick={() => {
                        setKeyword("");
                        setResults([]);
                        setSearched(false);
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <Button onClick={handleSearch} disabled={searching}>
                  {searching ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Tìm kiếm"
                  )}
                </Button>
              </div>

              {error && <p className="text-sm text-red-500 mt-3">{error}</p>}

              <div className="mt-3 space-y-2 max-h-[440px] overflow-y-auto pr-1">
                {!searching && !searched && (
                  <p className="text-sm text-muted-foreground py-6 text-center">
                    Nhập tên sản phẩm để tìm đối thủ so sánh.
                  </p>
                )}

                {!searching && searched && results.length === 0 && !error && (
                  <p className="text-sm text-muted-foreground py-6 text-center">
                    Không tìm thấy sản phẩm nào.
                  </p>
                )}

                {results.map((p) => (
                  <button
                    key={idOf(p)}
                    type="button"
                    onClick={() => handleSelect(p)}
                    disabled={loadingDetailId !== null}
                    className="w-full flex items-center gap-3 rounded-xl border p-2.5 text-left transition hover:bg-muted/50 hover:shadow-sm disabled:opacity-60"
                  >
                    <img
                      src={thumbOf(p)}
                      alt=""
                      className="w-14 h-14 rounded-lg border object-cover shrink-0"
                    />
                    <span className="flex-1 min-w-0">
                      <span className="block text-sm font-medium truncate">
                        {p.name ?? p.Name}
                      </span>
                      <span className="block text-xs text-muted-foreground">
                        {p.brand ?? p.Brand ?? ""}
                      </span>
                      <span className="block text-xs font-medium text-primary">
                        {formatPrice(p.price ?? p.Price)}
                      </span>
                    </span>
                    {loadingDetailId === idOf(p) && (
                      <Loader2 className="h-4 w-4 animate-spin shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* ===== Đã chọn đủ 2 sản phẩm: bảng so sánh ===== */
          <div className="space-y-6">
            <div className="relative">
              <div className="grid grid-cols-2 gap-4 md:gap-8 items-stretch">
                <ProductHead product={productA} />
                <div className="flex min-w-0 flex-col gap-2">
                  <ProductHead product={productB} />
                </div>
              </div>
              <div className="absolute left-1/2 top-32 hidden -translate-x-1/2 md:flex h-12 w-12 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground shadow-md ring-4 ring-background">
                VS
              </div>
              <div className="mt-4 text-center">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setProductB(null)}
                >
                  <X className="mr-1 h-3 w-3" />
                  Đổi sản phẩm so sánh
                </Button>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-muted/50 px-4 py-3">
              <p className="text-sm text-muted-foreground">
                Có{" "}
                <span className="font-semibold text-foreground">
                  {diffCount}
                </span>{" "}
                điểm khác nhau
                <span className="ml-2 inline-block h-3 w-3 rounded-sm bg-orange-100 border border-orange-200 align-middle" />{" "}
                = dòng khác nhau
              </p>
              <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={onlyDiff}
                  onChange={(e) => setOnlyDiff(e.target.checked)}
                  className="h-4 w-4 accent-orange-600"
                />
                Chỉ hiện điểm khác nhau
              </label>
            </div>

            <div className="rounded-2xl border overflow-hidden shadow-sm">
              <div
                className={`${ROW_GRID} bg-muted px-5 py-3.5 text-[15px] font-semibold sticky top-0 z-10`}
              >
                <span>Tiêu chí</span>
                <span className="text-center truncate px-3">
                  {productA.name}
                </span>
                <span className="text-center truncate px-3">
                  {productB.name}
                </span>
              </div>

              {nothingVisible ? (
                <p className="text-sm text-muted-foreground py-8 text-center">
                  2 sản phẩm giống hệt nhau ở mọi tiêu chí.
                </p>
              ) : (
                <>
                  {visibleBasic.map(renderRow)}

                  {(visibleSpecs.length > 0 || !onlyDiff) && (
                    <div className="border-t bg-muted/40 px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Thông số kỹ thuật
                    </div>
                  )}
                  {visibleSpecs.length > 0
                    ? visibleSpecs.map(renderRow)
                    : !onlyDiff && (
                        <p className="border-t px-5 py-4 text-center text-sm text-muted-foreground">
                          Chưa có thông số kỹ thuật để so sánh.
                        </p>
                      )}
                </>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
