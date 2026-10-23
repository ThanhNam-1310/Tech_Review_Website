import React, { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  User,
  Mail,
  AtSign,
  Shield,
  Pencil,
  FileText,
  Eye,
  Package,
  Heart,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { getMe } from "@/apis/auth.api";
import { GetDetailUser } from "@/apis/user.api";
import { GetMyPosts, GetPostsByAuthor } from "@/apis/post.api";
import { GetMyProducts, GetProductsByUser } from "@/apis/product.api";
import EditProfileDialog from "@/components/profile/EditProfileDialog";

const ROLE_LABELS = {
  admin: "Quản trị viên",
  expert: "Chuyên gia",
  user: "Người dùng thường",
};
const ROLE_BADGE_CLASSES = {
  admin: "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400",
  expert:
    "bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-400",
  user: "bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-400",
};

const initials = (name) =>
  (name || "?")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
const fmtNum = (n) => Number(n ?? 0).toLocaleString("vi-VN");
const fmtDate = (d) =>
  d
    ? new Date(d).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : "";
const fmtPrice = (p) =>
  p == null
    ? "—"
    : new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(Number(p));

// Chuẩn hoá DTO của BE (chịu cả PascalCase)
const chuanHoaUser = (u) => ({
  id: u.id ?? u.Id,
  fullName: u.fullName ?? u.FullName ?? "",
  userName: u.userName ?? u.UserName ?? "",
  email: u.email ?? u.Email ?? "",
  avatarUrl: u.avatarUrl ?? u.AvatarUrl ?? "",
  roleName: u.roleName ?? u.RoleName ?? "",
});
const chuanHoaBaiViet = (p) => ({
  id: p.postId ?? p.id ?? p.Id,
  title: p.title ?? p.Title ?? "",
  thumbnailUrl: p.thumbnailUrl ?? p.thumnailUrl ?? "",
  publicDate: p.publicDate ?? p.PublicDate,
  viewCount: p.viewCount ?? p.ViewCount ?? 0,
  likeCount: p.likeCount ?? p.LikeCount ?? 0,
  isPrivate:
    p.visibility === "PostPrivate" || p.visibility === 2 || p.Visibility === 2,
});
const chuanHoaSanPham = (p) => ({
  id: p.id ?? p.productId ?? p.Id,
  name: p.name ?? p.Name ?? "",
  brand: p.brand ?? p.Brand ?? "",
  price: p.price ?? p.Price ?? null,
  thumnailUrl: p.thumnailUrl ?? p.thumbnailUrl ?? p.ThumnailUrl ?? "",
});

// 1 ô thông tin chỉ đọc (icon + nhãn + giá trị)
const OThongTin = ({ icon: Icon, label, value }) => (
  <div className="grid gap-2">
    <Label>{label}</Label>
    <div className="relative">
      <Icon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input value={value ?? ""} readOnly className="bg-muted/40 pl-9" />
    </div>
  </div>
);

// Card thống kê nhỏ
const StatCard = ({ icon: Icon, label, value, chipClassName }) => (
  <Card>
    <CardContent className="flex items-center gap-4 py-5">
      <div
        className={cn(
          "flex size-11 shrink-0 items-center justify-center rounded-xl",
          chipClassName,
        )}
      >
        <Icon className="size-5" />
      </div>
      <div className="min-w-0">
        <p className="truncate text-2xl font-bold leading-none">
          {fmtNum(value)}
        </p>
        <p className="mt-1.5 text-sm text-muted-foreground">{label}</p>
      </div>
    </CardContent>
  </Card>
);

// Khung card danh sách dùng chung (bài viết & sản phẩm)
const DanhSachCard = ({
  title,
  linkAll,
  loading,
  items,
  emptyText,
  children,
}) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
      <CardTitle className="text-base">{title}</CardTitle>
      {linkAll && (
        <Link
          to={linkAll}
          className="inline-flex items-center gap-1 text-sm font-medium text-orange-600 hover:underline dark:text-orange-400"
        >
          Xem tất cả
          <ArrowRight className="h-4 w-4" />
        </Link>
      )}
    </CardHeader>
    <CardContent>
      {loading ? (
        <p className="py-4 text-center text-sm text-muted-foreground">
          Đang tải...
        </p>
      ) : items.length === 0 ? (
        <div className="rounded-lg border border-dashed py-6 text-center text-sm text-muted-foreground">
          {emptyText}
        </div>
      ) : (
        <div className="divide-y">{children}</div>
      )}
    </CardContent>
  </Card>
);

// 1 dòng bài viết
const DongBaiViet = ({ p }) => (
  <Link
    to={`/post/${p.id}`}
    className="flex items-center gap-3 py-3 transition-colors first:pt-0 last:pb-0 hover:bg-muted/40"
  >
    {p.thumbnailUrl ? (
      <img
        src={p.thumbnailUrl}
        alt={p.title}
        className="size-14 shrink-0 rounded-lg object-cover"
      />
    ) : (
      <div className="size-14 shrink-0 rounded-lg bg-muted" />
    )}
    <div className="min-w-0">
      <p className="line-clamp-2 text-sm font-medium leading-snug">{p.title}</p>
      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
        {p.publicDate && <span>{fmtDate(p.publicDate)}</span>}
        <span className="inline-flex items-center gap-1">
          <Eye className="h-3.5 w-3.5" />
          {fmtNum(p.viewCount)}
        </span>
        <span className="inline-flex items-center gap-1">
          <Heart className="h-3.5 w-3.5" />
          {fmtNum(p.likeCount)}
        </span>
        {p.isPrivate && (
          <span className="rounded-full bg-zinc-200 px-2 py-px font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
            Riêng tư
          </span>
        )}
      </div>
    </div>
  </Link>
);

// 1 dòng sản phẩm
const DongSanPham = ({ p }) => (
  <Link
    to={`/products/${p.id}`}
    className="flex items-center gap-3 py-3 transition-colors first:pt-0 last:pb-0 hover:bg-muted/40"
  >
    {p.thumnailUrl ? (
      <img
        src={p.thumnailUrl}
        alt={p.name}
        className="size-14 shrink-0 rounded-lg object-cover"
      />
    ) : (
      <div className="size-14 shrink-0 rounded-lg bg-muted" />
    )}
    <div className="min-w-0">
      <p className="line-clamp-2 text-sm font-medium leading-snug">{p.name}</p>
      <p className="mt-1 text-xs text-muted-foreground">{p.brand || "—"}</p>
      <p className="mt-0.5 text-sm font-semibold text-orange-600 dark:text-orange-400">
        {fmtPrice(p.price)}
      </p>
    </div>
  </Link>
);

const Profile = () => {
  const { id: routeId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [profile, setProfile] = useState(null);
  const [meId, setMeId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loi, setLoi] = useState("");
  const [moSua, setMoSua] = useState(false);
  const [dangTaiDanhSach, setDangTaiDanhSach] = useState(true);
  const [danhSach, setDanhSach] = useState({
    bai: [],
    tongBai: 0,
    luotXem: 0,
    sanPham: [],
    tongSanPham: 0,
  });

  // Tải hồ sơ: getMe để biết id của mình (check quyền sửa),
  // xem ai thì GetDetailUser(id người đó)
  const taiHoSo = useCallback(
    async (lanDau = false) => {
      if (lanDau) setLoading(true);
      try {
        let idCuaToi = null;
        try {
          const meRes = await getMe();
          idCuaToi = meRes.data?.id ?? meRes.data?.Id ?? null;
        } catch {
          /* chưa rõ tài khoản của mình -> chế độ chỉ xem */
        }
        setMeId(idCuaToi);

        const idCanXem = routeId ?? idCuaToi;
        if (!idCanXem) throw new Error("Không xác định được tài khoản.");

        const res = await GetDetailUser(idCanXem);
        setProfile(chuanHoaUser(res.data ?? {}));
        setLoi("");
      } catch {
        if (lanDau) {
          const thongBao = routeId
            ? "Không tìm thấy người dùng này."
            : "Không thể tải thông tin tài khoản.";
          setLoi(thongBao);
          toast.error(thongBao);
        }
      } finally {
        if (lanDau) setLoading(false);
      }
    },
    [routeId],
  );

  useEffect(() => {
    taiHoSo(true);
  }, [taiHoSo]);

  // Có phải hồ sơ của chính tài khoản đang đăng nhập không?
  const authId = user?.id ?? user?.Id ?? null;
  const laCuaToi =
    !!profile &&
    (!routeId || profile.id?.toLowerCase() === (authId ?? meId)?.toLowerCase());

  // Bài viết + sản phẩm của người đang xem: của mình thì dùng
  // post/my + product/my, của người khác thì dùng endpoint theo tác giả
  useEffect(() => {
    if (!profile) return;
    let song = true;
    setDangTaiDanhSach(true);

    (async () => {
      const [postRes, productRes] = await Promise.allSettled([
        laCuaToi
          ? GetMyPosts({ pageNumber: 1, pageSize: 100 })
          : GetPostsByAuthor(profile.id, { pageNumber: 1, pageSize: 100 }),
        laCuaToi
          ? GetMyProducts({ pageNumber: 1, pageSize: 100 })
          : GetProductsByUser(profile.id, { pageNumber: 1, pageSize: 100 }),
      ]);
      if (!song) return;

      const bai =
        postRes.status === "fulfilled"
          ? (postRes.value.data?.items ?? []).map(chuanHoaBaiViet)
          : [];
      const sp =
        productRes.status === "fulfilled"
          ? (productRes.value.data?.items ?? []).map(chuanHoaSanPham)
          : [];

      setDanhSach({
        bai,
        tongBai:
          postRes.status === "fulfilled"
            ? (postRes.value.data?.totalCount ?? bai.length)
            : 0,
        luotXem: bai.reduce((t, p) => t + p.viewCount, 0),
        sanPham: sp,
        tongSanPham:
          productRes.status === "fulfilled"
            ? (productRes.value.data?.totalCount ?? sp.length)
            : 0,
      });
      setDangTaiDanhSach(false);
    })();

    return () => {
      song = false;
    };
  }, [profile, laCuaToi]);

  if (loading || loi || !profile) {
    return (
      <div className="mx-auto w-full max-w-4xl">
        <Card>
          <CardContent className="space-y-4 py-10 text-center">
            <p
              className={cn(
                "text-sm",
                loi ? "text-destructive" : "text-muted-foreground",
              )}
            >
              {loading
                ? "Đang tải thông tin tài khoản..."
                : loi || "Không thể tải thông tin tài khoản."}
            </p>
            {loi && routeId && (
              <Button variant="outline" onClick={() => navigate(-1)}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Quay lại
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  const roleKey = profile.roleName?.toLowerCase();
  const roleLabel = ROLE_LABELS[roleKey] ?? profile.roleName;

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      {!laCuaToi && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="-ml-2"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Quay lại
        </Button>
      )}

      {/* ===== Thông tin cá nhân ===== */}
      <Card className="relative overflow-hidden">
        <div className="h-24 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600" />
        {laCuaToi && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setMoSua(true)}
            className="absolute right-4 top-4 bg-background/90 backdrop-blur hover:bg-background"
          >
            <Pencil className="mr-2 h-4 w-4" />
            Chỉnh sửa
          </Button>
        )}

        <div className="-mt-12 flex flex-col items-center px-6">
          <Avatar className="h-24 w-24 ring-4 ring-card">
            <AvatarImage
              src={profile.avatarUrl || undefined}
              alt={profile.fullName}
            />
            <AvatarFallback className="bg-orange-100 text-2xl font-semibold text-orange-700 dark:bg-orange-950 dark:text-orange-400">
              {initials(profile.fullName)}
            </AvatarFallback>
          </Avatar>
          <h2 className="mt-3 text-xl font-semibold">{profile.fullName}</h2>
          <div className="mt-1.5 flex flex-wrap items-center justify-center gap-2">
            <span className="text-sm text-muted-foreground">
              @{profile.userName}
            </span>
            {roleLabel && (
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold",
                  ROLE_BADGE_CLASSES[roleKey] ??
                    "bg-muted text-muted-foreground",
                )}
              >
                <Shield className="h-3 w-3" />
                {roleLabel}
              </span>
            )}
          </div>
        </div>

        <CardContent className="grid gap-6 pt-8 sm:grid-cols-2">
          <OThongTin icon={User} label="Họ và tên" value={profile.fullName} />
          <OThongTin
            icon={AtSign}
            label="Tên đăng nhập"
            value={profile.userName}
          />
          <OThongTin icon={Mail} label="Email" value={profile.email} />
          <OThongTin icon={Shield} label="Vai trò" value={roleLabel} />
        </CardContent>
      </Card>

      {/* ===== Thống kê ===== */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          icon={FileText}
          label="Bài viết đã đăng"
          value={danhSach.tongBai}
          chipClassName="bg-orange-100 text-orange-600 dark:bg-orange-950 dark:text-orange-400"
        />
        <StatCard
          icon={Eye}
          label="Tổng lượt xem bài viết"
          value={danhSach.luotXem}
          chipClassName="bg-sky-100 text-sky-600 dark:bg-sky-950 dark:text-sky-400"
        />
        <StatCard
          icon={Package}
          label="Sản phẩm đã tạo"
          value={danhSach.tongSanPham}
          chipClassName="bg-violet-100 text-violet-600 dark:bg-violet-950 dark:text-violet-400"
        />
      </div>

      {/* ===== Bài viết + sản phẩm (bấm vào là sang detail) ===== */}
      <div className="grid items-start gap-6 lg:grid-cols-2">
        <DanhSachCard
          title={laCuaToi ? "Bài viết của tôi" : "Bài viết"}
          linkAll={laCuaToi ? "/my-posts" : null}
          loading={dangTaiDanhSach}
          items={danhSach.bai}
          emptyText="Chưa có bài viết nào."
        >
          {danhSach.bai.slice(0, 5).map((p) => (
            <DongBaiViet key={p.id} p={p} />
          ))}
        </DanhSachCard>

        <DanhSachCard
          title={laCuaToi ? "Sản phẩm của tôi" : "Sản phẩm"}
          linkAll={laCuaToi ? "/my-products" : null}
          loading={dangTaiDanhSach}
          items={danhSach.sanPham}
          emptyText="Chưa có sản phẩm nào."
        >
          {danhSach.sanPham.slice(0, 5).map((p) => (
            <DongSanPham key={p.id} p={p} />
          ))}
        </DanhSachCard>
      </div>

      {laCuaToi && (
        <EditProfileDialog
          open={moSua}
          onOpenChange={setMoSua}
          profile={profile}
          onSuccess={() => taiHoSo(false)}
        />
      )}
    </div>
  );
};

export default Profile;
