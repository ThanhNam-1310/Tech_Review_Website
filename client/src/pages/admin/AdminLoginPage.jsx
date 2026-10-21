// src/pages/admin/AdminLoginPage.jsx
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  Eye,
  EyeOff,
  Loader2,
  LockKeyhole,
  ShieldCheck,
  User,
} from "lucide-react";
import { login, getMe, logout } from "@/apis/auth.api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const location = useLocation();

  // Trang đích do RequireAdmin gửi kèm khi đá về đây; chỉ nhận path trong /admin
  const from = location.state?.from?.startsWith("/admin")
    ? location.state.from
    : "/admin";

  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Đã đăng nhập sẵn bằng tài khoản admin thì vào thẳng trang đích
  useEffect(() => {
    getMe()
      .then((res) => {
        const role = (
          res.data?.roleName ??
          res.data?.RoleName ??
          ""
        ).toLowerCase();
        if (role === "admin") navigate(from, { replace: true });
      })
      .catch(() => {});
  }, [navigate, from]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login({ userName: userName.trim(), password });

      // Chỉ cho tài khoản admin đi tiếp
      const meRes = await getMe();
      const me = meRes.data ?? {};
      const role = (me.roleName ?? me.RoleName ?? "").toLowerCase();
      if (role !== "admin") {
        await logout().catch(() => {});
        setError("Tài khoản này không có quyền truy cập trang quản trị.");
        toast.error("Tài khoản này không có quyền truy cập trang quản trị.");
        return;
      }

      toast.success("Đăng nhập thành công!");
      navigate(from, { replace: true });
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.detail ||
        "Đăng nhập thất bại. Vui lòng thử lại.";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-zinc-950 px-4 py-10">
      {/* Quầng sáng trang trí */}
      <div className="pointer-events-none absolute -left-32 -top-32 size-96 rounded-full bg-orange-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 size-96 rounded-full bg-amber-500/10 blur-3xl" />

      <Card className="relative w-full max-w-md shadow-2xl">
        <CardHeader className="space-y-3 text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-md">
            <ShieldCheck className="size-6" />
          </div>
          <CardTitle className="text-2xl font-bold">
            Đăng nhập quản trị
          </CardTitle>
          <CardDescription>
            Khu vực dành cho quản trị viên Tech Review.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="userName">Tên đăng nhập</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="userName"
                  placeholder="Nhập tên tài khoản quản trị"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  disabled={loading}
                  required
                  className="pl-9"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Mật khẩu</Label>
              <div className="relative">
                <LockKeyhole className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Nhập mật khẩu"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  required
                  className="pl-9 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 size-4 animate-spin" />}
              {loading ? "Đang đăng nhập..." : "Đăng nhập"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Không phải quản trị viên?{" "}
            <Link
              to="/"
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              Quay lại trang chủ
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
