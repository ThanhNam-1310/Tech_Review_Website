import React, { useEffect, useState } from "react";
import { Link, Outlet } from "react-router-dom";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import AdminSidebar from "@/components/sidebar/AdminSidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Clock, Home } from "lucide-react";
import { getMe } from "@/apis/auth.api";

// Lời chào theo buổi trong ngày
const greetingByHour = (h) => {
  if (h >= 5 && h < 11) return "Chào buổi sáng";
  if (h >= 11 && h < 13) return "Chào buổi trưa";
  if (h >= 13 && h < 18) return "Chào buổi chiều";
  return "Chào buổi tối";
};

// Đồng hồ thời gian thực, cập nhật mỗi giây
const useNow = () => {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return now;
};

const initials = (name) =>
  (name || "?")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

const AdminLayout = () => {
  const now = useNow();
  const [admin, setAdmin] = useState(null);

  useEffect(() => {
    getMe()
      .then((res) => setAdmin(res.data ?? null))
      .catch(() => {});
  }, []);

  const fullName = admin?.fullName ?? admin?.FullName ?? "";
  const userName = admin?.userName ?? admin?.UserName ?? "";
  const avatarUrl = admin?.avatarUrl ?? admin?.AvatarUrl ?? "";
  const displayName = fullName || userName || "Admin";

  const dateText = now.toLocaleDateString("vi-VN", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  const dateLabel = dateText.charAt(0).toUpperCase() + dateText.slice(1);
  const timeText = now.toLocaleTimeString("vi-VN", { hour12: false });

  return (
    <TooltipProvider>
      <SidebarProvider>
        <AdminSidebar />

        <SidebarInset>
          <header className="sticky top-0 z-40 flex h-16 items-center gap-3 border-b bg-background/85 px-4 backdrop-blur md:px-6">
            {/* ===== Bên trái: nút sidebar + tiêu đề trang ===== */}
            <SidebarTrigger className="-ml-1 shrink-0" />
            <div className="h-8 w-px shrink-0 bg-border" />
            <div className="min-w-0 leading-tight">
              <p className="truncate text-sm font-semibold md:text-base">
                Trang dành cho quản trị viên
              </p>
              <p className="hidden text-xs capitalize text-muted-foreground sm:block">
                {dateLabel}
              </p>
            </div>

            {/* ===== Bên phải: xin chào + đồng hồ + về trang chủ + admin ===== */}
            <div className="ml-auto flex shrink-0 items-center gap-2 md:gap-3">
              <p className="hidden whitespace-nowrap text-sm font-medium lg:block">
                {greetingByHour(now.getHours())},{" "}
                <span className="font-semibold text-orange-600 dark:text-orange-400">
                  {displayName}
                </span>
              </p>

              {/* Đồng hồ thời gian thực */}
              <div className="hidden items-center gap-2 rounded-full border bg-muted/40 px-3.5 py-1.5 md:flex">
                <span className="relative flex size-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                  <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
                </span>
                <Clock className="size-4 text-orange-500" />
                <span className="text-sm font-semibold tabular-nums">
                  {timeText}
                </span>
              </div>

              <Button variant="outline" size="sm" asChild className="shrink-0">
                <Link to="/">
                  <Home className="size-4" />
                  <span className="hidden sm:inline">Về trang chủ</span>
                </Link>
              </Button>

              <div className="hidden h-8 w-px bg-border sm:block" />

              {/* Thông tin admin */}
              <div className="flex items-center gap-2.5">
                <Avatar className="size-9 ring-2 ring-orange-100 dark:ring-orange-950">
                  <AvatarImage src={avatarUrl || undefined} alt={displayName} />
                  <AvatarFallback className="bg-orange-100 text-xs font-semibold text-orange-700 dark:bg-orange-950 dark:text-orange-400">
                    {initials(displayName)}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden leading-tight xl:block">
                  <p className="max-w-[160px] truncate text-sm font-semibold">
                    {displayName}
                  </p>
                  <p className="text-xs text-muted-foreground">Quản trị viên</p>
                </div>
              </div>
            </div>
          </header>

          <main className="flex-1 bg-muted/30 p-4 md:p-6">
            <Outlet />
          </main>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
};

export default AdminLayout;
