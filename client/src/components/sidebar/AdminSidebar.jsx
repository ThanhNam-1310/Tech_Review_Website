import { useEffect, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { ChevronDown, Loader2, LogOut, Settings2 } from "lucide-react";
import { toast } from "sonner";

import { ADMIN_MENU } from "@/utils/constants/adminMenu";
import { logout } from "@/apis/auth.api";

import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarFooter,
} from "@/components/ui/sidebar";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

// Style chung cho mọi nút menu: chiều cao đều nhau, icon xám → cam khi active/hover
const menuBtnClass =
  "h-9 gap-3 rounded-lg px-3 transition-colors [&_svg]:shrink-0 [&_svg]:text-muted-foreground hover:bg-orange-50 hover:text-orange-700 hover:[&_svg]:text-orange-600 data-[active=true]:bg-orange-100 data-[active=true]:font-semibold data-[active=true]:text-orange-700 data-[active=true]:[&_svg]:text-orange-600 dark:hover:bg-orange-950/20 dark:data-[active=true]:bg-orange-950/40 dark:data-[active=true]:text-orange-400";

const subBtnClass =
  "h-8 gap-2.5 rounded-md transition-colors [&_svg]:shrink-0 [&_svg]:text-muted-foreground hover:bg-orange-50 hover:text-orange-700 hover:[&_svg]:text-orange-600 data-[active=true]:bg-orange-100 data-[active=true]:font-medium data-[active=true]:text-orange-700 data-[active=true]:[&_svg]:text-orange-600 dark:hover:bg-orange-950/20 dark:data-[active=true]:bg-orange-950/40 dark:data-[active=true]:text-orange-400";

const AdminSidebar = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [openMenus, setOpenMenus] = useState({});
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    const activeMenus = {};

    ADMIN_MENU.forEach((item) => {
      if (
        item.children?.some(
          (child) =>
            pathname === child.path || pathname.startsWith(`${child.path}/`),
        )
      ) {
        activeMenus[item.label] = true;
      }
    });

    setOpenMenus((prev) => ({ ...prev, ...activeMenus }));
  }, [pathname]);

  const toggleMenu = (label, open) => {
    setOpenMenus((prev) => ({
      ...prev,
      [label]: open,
    }));
  };

  const handleLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await logout();
      toast.success("Đã đăng xuất");
    } catch {
      // API lỗi (vd token đã hết hạn) thì vẫn rời khỏi khu vực admin
    } finally {
      navigate("/admin/login", { replace: true });
    }
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border/60 px-3 pb-4 pt-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" tooltip="Tech Review Admin" asChild>
              <NavLink to="/admin">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-sm">
                  <Settings2 className="size-4" />
                </div>

                <div className="flex min-w-0 flex-col gap-0.5 leading-none">
                  <span className="truncate font-semibold tracking-tight">
                    Tech Review
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Administration
                  </span>
                </div>
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="px-3 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/70">
            Quản lý hệ thống
          </SidebarGroupLabel>

          <SidebarMenu className="gap-1">
            {ADMIN_MENU.map((item) => {
              const Icon = item.icon;

              if (!item.children?.length) {
                return (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton
                      asChild
                      tooltip={item.label}
                      className={menuBtnClass}
                      isActive={
                        pathname === item.path ||
                        (item.path !== "/admin" &&
                          pathname.startsWith(`${item.path}/`))
                      }
                    >
                      <NavLink to={item.path}>
                        <Icon />
                        <span className="flex-1 truncate">{item.label}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              }

              const isOpen = !!openMenus[item.label];

              const hasActiveChild = item.children.some(
                (child) =>
                  pathname === child.path ||
                  pathname.startsWith(`${child.path}/`),
              );

              return (
                <Collapsible
                  key={item.label}
                  open={isOpen}
                  onOpenChange={(open) => toggleMenu(item.label, open)}
                  asChild
                >
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton
                        tooltip={item.label}
                        className={`${menuBtnClass} ${
                          hasActiveChild
                            ? "font-semibold text-orange-700 [&_svg]:text-orange-600 dark:text-orange-400"
                            : ""
                        }`}
                      >
                        <Icon />
                        <span className="flex-1 truncate">{item.label}</span>
                        <ChevronDown
                          className={`size-4 shrink-0 text-muted-foreground transition-transform duration-200 ${
                            isOpen ? "rotate-180" : ""
                          }`}
                        />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>

                    <CollapsibleContent>
                      <SidebarMenuSub className="ml-5 gap-0.5 border-l border-orange-200/70 py-1.5 pl-3 dark:border-orange-900/50">
                        {item.children.map((child) => {
                          const ChildIcon = child.icon;

                          return (
                            <SidebarMenuSubItem key={child.path}>
                              <SidebarMenuSubButton
                                asChild
                                className={subBtnClass}
                                isActive={pathname === child.path}
                              >
                                <NavLink to={child.path}>
                                  <ChildIcon />
                                  <span className="flex-1 truncate">
                                    {child.label}
                                  </span>
                                </NavLink>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          );
                        })}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border/60 pt-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Đăng xuất"
              onClick={handleLogout}
              disabled={loggingOut}
              className="h-9 gap-3 rounded-lg px-3 transition-colors [&_svg]:shrink-0 [&_svg]:text-muted-foreground hover:bg-rose-50 hover:text-rose-600 hover:[&_svg]:text-rose-600 dark:hover:bg-rose-950/30"
            >
              {loggingOut ? <Loader2 className="animate-spin" /> : <LogOut />}
              <span className="flex-1 truncate">
                {loggingOut ? "Đang đăng xuất..." : "Đăng xuất"}
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AdminSidebar;
