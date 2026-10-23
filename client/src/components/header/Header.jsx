import { useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Cpu, LayoutDashboard, LogOut, Menu } from "lucide-react";
import { getMe, logout } from "@/apis/auth.api";

const NAV_ITEMS = [
  { label: "Bài viết", to: "/post" },
  { label: "Sản phẩm", to: "/products" },
];

const navClass = ({ isActive }) =>
  `rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
    isActive
      ? "bg-orange-500 font-semibold text-white shadow-md shadow-orange-500/25"
      : "text-zinc-600 hover:bg-white/70 hover:text-orange-600"
  }`;

const initials = (name) =>
  (name || "?")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

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
  const avatarUrl = user?.avatarUrl ?? user?.AvatarUrl ?? "";
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
      <div className="flex items-center gap-8">
        <Link
          to="/profile"
          onClick={onNavigate}
          className="flex items-center gap-2 text-sm font-medium text-zinc-600 transition-colors hover:text-orange-600 group"
        >
          <Avatar className="size-8 ring-2 ring-orange-200">
            <AvatarImage src={avatarUrl || undefined} alt={displayName} />
            <AvatarFallback className="bg-orange-100 text-xs font-semibold text-orange-700">
              {initials(displayName)}
            </AvatarFallback>
          </Avatar>
          <span>
            Xin chào,{" "}
            <span className="font-semibold text-orange-600 group-hover:text-black">
              {displayName}
            </span>
          </span>
        </Link>
        {isAdmin ? (
          // Admin: thay Đăng xuất bằng nút quay lại trang quản trị
          <Button
            size="sm"
            asChild
            className="bg-orange-500 text-white shadow-sm shadow-orange-500/25 hover:bg-orange-600"
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
            className="border border-orange-300 text-zinc-700 hover:border-orange-400 hover:bg-white/70 hover:text-orange-600"
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
          className="bg-orange-500 text-white shadow-sm shadow-orange-500/25 hover:bg-orange-600"
        >
          <Link to="/login" onClick={onNavigate}>
            Đăng nhập
          </Link>
        </Button>
      </div>
    );

  return (
    <header className="sticky top-0 z-50 border-b border-orange-100 bg-gradient-to-r from-amber-50 via-orange-50 to-orange-100 text-zinc-800 shadow-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/25">
            <Cpu className="size-5" />
          </span>
          <span className="text-lg font-bold text-zinc-900">
            Tech<span className="text-orange-500">Review</span>
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
                className="text-zinc-700 hover:bg-white/70 hover:text-orange-600"
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
