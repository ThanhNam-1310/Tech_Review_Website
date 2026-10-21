// src/pages/admin/AdminDashboardPage.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FileText,
  Package,
  Users,
  LayoutGrid,
  Eye,
  Heart,
  Star,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { GetAllPost } from "@/apis/post.api";
import { GetAllProduct } from "@/apis/product.api";
import { GetAllCategories } from "@/apis/category.api";
import {
  GetAllUserNormals,
  GetAllUserExperts,
  GetAllUserAdmins,
} from "@/apis/user.api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Đếm tổng số bản ghi: ưu tiên totalCount trong envelope, không có thì đếm mảng
const countFrom = (res) => {
  const data = res?.data ?? {};
  if (typeof data.totalCount === "number") return data.totalCount;
  const items = data.items ?? data ?? [];
  return Array.isArray(items) ? items.length : 0;
};

const itemsFrom = (res) => {
  const data = res?.data ?? {};
  const items = data.items ?? data ?? [];
  return Array.isArray(items) ? items : [];
};

// Đếm cả danh mục con trong cây
const countNodes = (nodes) =>
  (nodes || []).reduce(
    (sum, n) => sum + 1 + countNodes(n.children ?? n.Children ?? []),
    0,
  );

const normPost = (p) => ({
  id: p.postId ?? p.PostId ?? p.id ?? p.Id,
  title: p.title ?? p.Title ?? "",
  thumbnail: p.thumbnailUrl ?? p.ThumbnailUrl ?? "",
  author: p.authorName ?? p.AuthorName ?? "",
  date: p.publicDate ?? p.PublicDate ?? "",
  likes: p.likeCount ?? p.LikeCount ?? 0,
  views: p.viewCount ?? p.ViewCount ?? 0,
});

const normProduct = (p) => ({
  id: p.id ?? p.Id,
  name: p.name ?? p.Name ?? "",
  brand: p.brand ?? p.Brand ?? "",
  price: p.price ?? p.Price ?? null,
  thumnailUrl: p.thumnailUrl ?? p.ThumnailUrl ?? p.thumbnailUrl ?? "",
});

const formatDate = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  return isNaN(d) ? "" : d.toLocaleDateString("vi-VN");
};

const formatPrice = (price) =>
  price == null
    ? "Liên hệ"
    : new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(Number(price));

const StatCard = ({ icon: Icon, label, value, to, chipClass }) => (
  <Link to={to} className="group">
    <Card className="h-full shadow-sm transition-shadow group-hover:shadow-md">
      <CardContent className="flex items-center gap-4 p-5">
        <span
          className={`flex size-12 shrink-0 items-center justify-center rounded-2xl ${chipClass}`}
        >
          <Icon className="size-6" />
        </span>
        <div className="min-w-0">
          <p className="text-2xl font-bold leading-tight">{value}</p>
          <p className="truncate text-sm text-muted-foreground">{label}</p>
        </div>
        <ArrowRight className="ml-auto size-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
      </CardContent>
    </Card>
  </Link>
);

const ListSkeleton = ({ rows = 3 }) => (
  <div className="space-y-3">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex items-center gap-3">
        <div className="h-12 w-16 shrink-0 animate-pulse rounded bg-muted" />
        <div className="flex-1 space-y-2">
          <div className="h-3.5 w-3/4 animate-pulse rounded bg-muted" />
          <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
        </div>
      </div>
    ))}
  </div>
);

const ROLE_ROWS = [
  { key: "users", label: "Người dùng thường", bar: "bg-sky-500" },
  { key: "experts", label: "Chuyên gia", bar: "bg-violet-500" },
  { key: "admins", label: "Quản trị viên", bar: "bg-rose-500" },
];

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState({
    posts: 0,
    products: 0,
    categories: 0,
    users: 0,
    experts: 0,
    admins: 0,
  });
  const [latestPosts, setLatestPosts] = useState([]);
  const [latestProducts, setLatestProducts] = useState([]);
  const [hero, setHero] = useState(null);

  useEffect(() => {
    (async () => {
      const [
        postRes,
        productRes,
        catRes,
        normalRes,
        expertRes,
        adminRes,
        heroRes,
      ] = await Promise.allSettled([
        GetAllPost({ pageNumber: 1, pageSize: 5 }),
        GetAllProduct({ pageNumber: 1, pageSize: 5 }),
        GetAllCategories(),
        GetAllUserNormals(),
        GetAllUserExperts(),
        GetAllUserAdmins(),
        GetAllPost({ highlight: true, pageSize: 1 }),
      ]);

      if (postRes.status === "fulfilled") {
        setLatestPosts(itemsFrom(postRes.value).map(normPost));
      }
      if (productRes.status === "fulfilled") {
        setLatestProducts(itemsFrom(productRes.value).map(normProduct));
      }
      const heroItem =
        heroRes.status === "fulfilled"
          ? itemsFrom(heroRes.value)[0]
          : undefined;
      setHero(heroItem ? normPost(heroItem) : null);

      setCounts({
        posts: postRes.status === "fulfilled" ? countFrom(postRes.value) : 0,
        products:
          productRes.status === "fulfilled" ? countFrom(productRes.value) : 0,
        categories:
          catRes.status === "fulfilled"
            ? countNodes(itemsFrom(catRes.value))
            : 0,
        users:
          normalRes.status === "fulfilled" ? countFrom(normalRes.value) : 0,
        experts:
          expertRes.status === "fulfilled" ? countFrom(expertRes.value) : 0,
        admins: adminRes.status === "fulfilled" ? countFrom(adminRes.value) : 0,
      });
      setLoading(false);
    })();
  }, []);

  const totalUsers = counts.users + counts.experts + counts.admins;
  const today = new Date().toLocaleDateString("vi-VN", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Tổng quan hệ thống</h1>
        <p className="mt-1 text-sm capitalize text-muted-foreground">{today}</p>
      </div>

      {/* ===== Thẻ thống kê ===== */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={FileText}
          label="Tổng bài viết"
          value={loading ? "…" : counts.posts}
          to="/admin/posts"
          chipClass="bg-orange-100 text-orange-600 dark:bg-orange-950/40"
        />
        <StatCard
          icon={Package}
          label="Tổng sản phẩm"
          value={loading ? "…" : counts.products}
          to="/admin/products"
          chipClass="bg-sky-100 text-sky-600 dark:bg-sky-950/40"
        />
        <StatCard
          icon={Users}
          label="Tổng tài khoản"
          value={loading ? "…" : totalUsers}
          to="/admin/users"
          chipClass="bg-violet-100 text-violet-600 dark:bg-violet-950/40"
        />
        <StatCard
          icon={LayoutGrid}
          label="Tổng danh mục"
          value={loading ? "…" : counts.categories}
          to="/admin/categories"
          chipClass="bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40"
        />
      </div>

      {/* ===== Bài viết + sản phẩm mới nhất ===== */}
      <div className="grid items-start gap-4 xl:grid-cols-5">
        <Card className="shadow-sm xl:col-span-3">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base">Bài viết mới nhất</CardTitle>
            <Link
              to="/admin/posts"
              className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              Xem tất cả <ArrowRight className="size-3.5" />
            </Link>
          </CardHeader>
          <CardContent>
            {loading ? (
              <ListSkeleton rows={4} />
            ) : latestPosts.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                Chưa có bài viết nào.
              </p>
            ) : (
              <div className="divide-y">
                {latestPosts.map((p) => (
                  <div key={p.id} className="flex items-center gap-3 py-3">
                    {p.thumbnail ? (
                      <img
                        src={p.thumbnail}
                        alt=""
                        className="h-12 w-16 shrink-0 rounded border object-cover"
                      />
                    ) : (
                      <div className="h-12 w-16 shrink-0 rounded border bg-muted" />
                    )}
                    <div className="min-w-0 flex-1">
                      <Link
                        to={`/post/${p.id}`}
                        className="block truncate text-sm font-medium hover:underline"
                      >
                        {p.title}
                      </Link>
                      <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                        <span>{p.author || "—"}</span>
                        <span>{formatDate(p.date)}</span>
                        <span className="flex items-center gap-1">
                          <Eye className="size-3" /> {p.views}
                        </span>
                        <span className="flex items-center gap-1">
                          <Heart className="size-3" /> {p.likes}
                        </span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm xl:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base">Sản phẩm mới nhất</CardTitle>
            <Link
              to="/admin/products"
              className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              Xem tất cả <ArrowRight className="size-3.5" />
            </Link>
          </CardHeader>
          <CardContent>
            {loading ? (
              <ListSkeleton rows={4} />
            ) : latestProducts.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                Chưa có sản phẩm nào.
              </p>
            ) : (
              <div className="divide-y">
                {latestProducts.map((p) => (
                  <div key={p.id} className="flex items-center gap-3 py-3">
                    {p.thumnailUrl ? (
                      <img
                        src={p.thumnailUrl}
                        alt=""
                        className="size-12 shrink-0 rounded border object-cover"
                      />
                    ) : (
                      <div className="size-12 shrink-0 rounded border bg-muted" />
                    )}
                    <div className="min-w-0 flex-1">
                      <Link
                        to={`/products/${p.id}`}
                        className="block truncate text-sm font-medium hover:underline"
                      >
                        {p.name}
                      </Link>
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">
                        {p.brand || "—"}
                      </p>
                    </div>
                    <span className="shrink-0 text-sm font-semibold text-primary">
                      {formatPrice(p.price)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ===== Tài khoản theo vai trò + Hero hiện tại ===== */}
      <div className="grid items-start gap-4 xl:grid-cols-5">
        <Card className="shadow-sm xl:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Tài khoản theo vai trò</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {ROLE_ROWS.map((row) => {
              const count = counts[row.key];
              const pct = totalUsers
                ? Math.round((count / totalUsers) * 100)
                : 0;
              return (
                <div key={row.key}>
                  <div className="mb-1.5 flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <span className={`size-2 rounded-full ${row.bar}`} />
                      {row.label}
                    </span>
                    <span className="font-semibold">
                      {loading ? "…" : count}
                      <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                        {pct}%
                      </span>
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className={`h-full rounded-full transition-all ${row.bar}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
            <Link
              to="/admin/users"
              className="flex items-center gap-1 pt-1 text-sm font-medium text-primary hover:underline"
            >
              Quản lý tài khoản <ArrowRight className="size-3.5" />
            </Link>
          </CardContent>
        </Card>

        <Card className="shadow-sm xl:col-span-3">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Star className="size-4 text-yellow-500" />
              Bài viết chủ đề (Hero) hiện tại
            </CardTitle>
            <Link
              to="/admin/posts"
              className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              Thay đổi <ArrowRight className="size-3.5" />
            </Link>
          </CardHeader>
          <CardContent>
            {loading ? (
              <ListSkeleton rows={1} />
            ) : hero ? (
              <div className="flex items-center gap-4">
                {hero.thumbnail ? (
                  <img
                    src={hero.thumbnail}
                    alt=""
                    className="h-20 w-32 shrink-0 rounded-lg border object-cover"
                  />
                ) : (
                  <div className="h-20 w-32 shrink-0 rounded-lg border bg-muted" />
                )}
                <div className="min-w-0">
                  <Link
                    to={`/post/${hero.id}`}
                    className="text-base font-semibold hover:underline"
                  >
                    {hero.title}
                  </Link>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {hero.author || "—"} • {formatDate(hero.date)}
                  </p>
                  <Badge className="mt-2">Đang hiển thị ở trang chủ</Badge>
                </div>
              </div>
            ) : (
              <p className="py-4 text-sm text-muted-foreground">
                Chưa có bài viết chủ đề. Vào trang Bài viết để chọn 1 bài làm
                hero.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {loading && (
        <p className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" /> Đang tải dữ liệu tổng
          quan...
        </p>
      )}
    </div>
  );
}
