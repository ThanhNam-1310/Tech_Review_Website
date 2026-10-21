
import {
  LayoutDashboard,
  FileText,
  Package,
  FolderTree,
  Users,
  ShieldCheck,
  MessageSquare,
  BarChart3,
  Settings,
  Tags,
  List,
  PlusCircle,
  Eye,
  UserCog,
  KeyRound,
  Star,
  Bookmark,
} from "lucide-react";

export const ADMIN_MENU = [
  {
    label: "Tổng quan",
    path: "/admin",
    icon: LayoutDashboard,
  },
  {
    label: "Quản lý bài viết",
    path: "/admin/posts",
    icon: FileText,
  },
  {
    label: "Quản lý sản phẩm",
    icon: Package,
    path: "/admin/products",
    children: [
      {
        label: "Danh sách sản phẩm",
        path: "/admin/products",
        icon: List,
      },
      {
        label: "Thông số kỹ thuật",
        path: "/admin/specifications",
        icon: Settings,
      },
    ],
  },
  {
    label: "Quản lý danh mục",
    path: "/admin/categories",
    icon: FolderTree,
  },
  {
    label: "Quản lý người dùng",
    icon: Users,
    path: "/admin/users",
    children: [
      {
        label: "Danh sách người dùng",
        path: "/admin/users",
        path: "/admin/users",
        icon: List,
      },
      {
        label: "Phân quyền người dùng",
        path: "/admin/users/roles",
        icon: UserCog,
      },
    ],
  },
  {
    label: "Quản lý vai trò & quyền",
    icon: ShieldCheck,
    children: [
      {
        label: "Danh sách vai trò",
        path: "/admin/roles",
        icon: Users,
      },
      {
        label: "Danh sách quyền",
        path: "/admin/permissions",
        icon: KeyRound,
      },
    ],
  },
  {
    label: "Cài đặt",
    icon: Settings,
    children: [
      {
        label: "Cài đặt chung",
        path: "/admin/settings",
        icon: Settings,
      },
    ],
  },
];