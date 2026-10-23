import { useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Cpu, LayoutDashboard, LogOut, Menu } from "lucide-react";
import { getMe, logout } from "@/apis/auth.api";

const NAV_ITEMS = [
  { label: "Bài viết", to: "/post" },
  { label: "Sản phẩm", to: "/products" },
];

const navClass = ({ isActive }) =>
  `rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
    isActive
      ? "bg-white font-semibold text-orange-600 shadow-md"
      : "text-zinc-500 hover:bg-orange-50 hover:text-orange-600 md:text-white/85 md:hover:bg-white/15 md:hover:text-white"
  }`;

export default function Header() {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await getMe();
        if (!cancelled) setUser(res.data ?? null);
      } catch {
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setChecking(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch {}
    setUser(null);
    setMobileOpen(false);
    navigate("/");
  };

  const isLoggedIn = Boolean(user);
  const displayName = user?.fullName ?? user?.userName ?? user?.name ?? "";
  const roleName = (user?.roleName ?? user?.RoleName ?? "").toLowerCase();
  const isExpert = roleName === "expert";
  const isAdmin = roleName === "admin";

  const navLinks = (onNavigate) => (
    <>
      {NAV_ITEMS.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={navClass}
          onClick={onNavigate}
        >
          {item.label}
        </NavLink>
      ))}
      {isLoggedIn && (
        <NavLink to="/my-posts" className={navClass} onClick={onNavigate}>
          Bài viết của tôi
        </NavLink>
      )}
      {isExpert && (
        <NavLink to="/my-products" className={navClass} onClick={onNavigate}>
          Sản phẩm của tôi
        </NavLink>
      )}
    </>
  );

  const authArea = (onNavigate) =>
    checking ? null : isLoggedIn ? (
      <div className="flex items-center gap-2">
        <Link
          to="/profile"
          onClick={onNavigate}
          className="text-sm font-medium text-muted-foreground transition-colors hover:text-orange-600 md:text-white/85 md:hover:text-white"
        >
          Xin chào,{" "}
          <span className="font-semibold text-orange-600 md:text-white">
            {displayName}
          </span>
        </Link>
        {isAdmin ? (
          // Admin: thay Đăng xuất bằng nút quay lại trang quản trị
          <Button
            size="sm"
            asChild
            className="bg-white text-orange-600 shadow-sm ring-1 ring-orange-200 hover:bg-orange-50"
          >
            <Link to="/admin" onClick={onNavigate}>
              <LayoutDashboard className="mr-1 h-4 w-4" />
              Quay lại Dashboard
            </Link>
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="hover:bg-orange-50 hover:text-orange-600 md:text-white/90 md:hover:bg-white/15 md:hover:text-white"
          >
            <LogOut className="mr-1 h-4 w-4" />
            Đăng xuất
          </Button>
        )}
      </div>
    ) : (
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          asChild
          className="bg-white text-orange-600 shadow-sm ring-1 ring-orange-200 hover:bg-orange-50"
        >
          <Link to="/login" onClick={onNavigate}>
            Đăng nhập
          </Link>
        </Button>
      </div>
    );

  return (
    <header className="sticky top-0 z-50 bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 text-white shadow-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-lg bg-white text-orange-600 shadow-md">
            <Cpu className="size-5" />
          </span>
          <span className="text-lg font-bold text-white">
            Tech<span className="text-zinc-900">Review</span>
          </span>
        </Link>

        {/* Desktop */}
        <nav className="hidden items-center gap-2 md:flex">{navLinks()}</nav>
        <div className="hidden md:block">{authArea()}</div>

        {/* Mobile */}
        <div className="md:hidden">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/15 hover:text-white"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="flex flex-col gap-4">
              <nav className="flex flex-col gap-3">
                {navLinks(() => setMobileOpen(false))}
              </nav>
              <div className="border-t pt-4">
                {authArea(() => setMobileOpen(false))}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
