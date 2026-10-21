import { useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { LayoutDashboard, LogOut, Menu } from "lucide-react";
import { getMe, logout } from "@/apis/auth.api";

const NAV_ITEMS = [
  { label: "Bài viết", to: "/post" },
  { label: "Sản phẩm", to: "/products" },
];

const navClass = ({ isActive }) =>
  `text-sm font-medium transition-colors hover:text-primary ${
    isActive ? "text-primary" : "text-muted-foreground"
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
          className="text-sm font-medium transition-colors hover:text-primary"
        >
          Xin chào, {displayName}
        </Link>
        {isAdmin ? (
          // Admin: thay Đăng xuất bằng nút quay lại trang quản trị
          <Button size="sm" asChild>
            <Link to="/admin" onClick={onNavigate}>
              <LayoutDashboard className="mr-1 h-4 w-4" />
              Quay lại Dashboard
            </Link>
          </Button>
        ) : (
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="mr-1 h-4 w-4" />
            Đăng xuất
          </Button>
        )}
      </div>
    ) : (
      <div className="flex items-center gap-2">
        <Button size="sm" asChild>
          <Link to="/login" onClick={onNavigate}>
            Đăng nhập
          </Link>
        </Button>
      </div>
    );

  return (
    <header className="sticky top-0 z-50 border-b bg-background">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link to="/" className="text-lg font-bold">
          TechReview
        </Link>

        {/* Desktop */}
        <nav className="hidden items-center gap-6 md:flex">{navLinks()}</nav>
        <div className="hidden md:block">{authArea()}</div>

        {/* Mobile */}
        <div className="md:hidden">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
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
