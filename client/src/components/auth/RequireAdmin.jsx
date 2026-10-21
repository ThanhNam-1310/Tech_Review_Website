import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { getMe } from "@/apis/auth.api";

// Bọc nhánh /admin: chỉ tài khoản role admin mới vào được
export default function RequireAdmin({ children }) {
  const location = useLocation();
  // "checking" | "admin" | "guest" | "forbidden"
  const [status, setStatus] = useState("checking");

  useEffect(() => {
    let cancelled = false;
    getMe()
      .then((res) => {
        if (cancelled) return;
        const role = (
          res.data?.roleName ??
          res.data?.RoleName ??
          ""
        ).toLowerCase();
        setStatus(role === "admin" ? "admin" : "forbidden");
      })
      .catch(() => {
        if (!cancelled) setStatus("guest");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (status === "checking") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-background">
        <Loader2 className="size-8 animate-spin text-orange-500" />
        <p className="text-sm text-muted-foreground">
          Đang kiểm tra quyền truy cập...
        </p>
      </div>
    );
  }

  if (status === "guest") {
    // Chưa đăng nhập → về trang login admin, nhớ trang đích để quay lại
    return (
      <Navigate
        to="/admin/login"
        replace
        state={{ from: location.pathname + location.search }}
      />
    );
  }

  if (status === "forbidden") {
    // Đã đăng nhập nhưng không phải admin → về trang chủ
    return <Navigate to="/" replace />;
  }

  return children;
}
