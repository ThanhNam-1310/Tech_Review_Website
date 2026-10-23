import { createBrowserRouter } from "react-router-dom";
import HomePage from "@/pages/HomePage";
import ProductDetail from "@/pages/ProductDetail";
import PostReviewPage from "@/pages/PostReviewPage";
import PostDetail from "@/pages/PostDetail";
import ProductReviewPage from "@/pages/ProductReviewPage";
import AdminHomePage from "@/pages/admin/AdminHomePage";
import AuthPage from "@/pages/AuthPage";
import ProfilePage from "@/pages/ProfilePage";
import AdminDashboardPage from "@/pages/admin/AdminDashboardPage";
import AdminCategoriesPage from "@/pages/admin/AdminCategoriesPage";
import AdminUsersPage from "@/pages/admin/AdminUsersPage";
import AdminProductsPage from "@/pages/admin/AdminProductsPage";
import AdminRolesUsersPage from "@/pages/admin/AdminRolesUsersPage";
import CreateProductForm from "@/components/forms/CreateProductForm";
import AdminSpecificationPage from "@/pages/admin/AdminSpecificationPage";
import AdminPostsPage from "@/pages/admin/AdminPostsPage";
import PostForm from "@/components/forms/CreatePostForm";
import MyPostsPage from "@/pages/MyPostsPage";
import MainLayout from "@/layouts/MainLayout";
import MyProductsPage from "@/pages/MyProductsPage";
import AdminPermissionsPage from "@/pages/admin/AdminPermissionsPage";
import AdminLoginPage from "@/pages/admin/AdminLoginPage";
import RequireAdmin from "@/components/auth/RequireAdmin";

const router = createBrowserRouter([
  // ===== Public — dùng MainLayout (Header + Outlet) =====
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: "post",
        element: <PostReviewPage />,
      },
      {
        path: "post/new",
        element: <PostForm />,
      },
      {
        path: "post/edit/:id",
        element: <PostForm />,
      },
      {
        path: "post/:id",
        element: <PostDetail />,
      },
      {
        path: "my-posts",
        element: <MyPostsPage />,
      },
      {
        path: "my-products",
        element: <MyProductsPage />,
      },
      {
        path: "products",
        element: <ProductReviewPage />,
      },
      {
        path: "products/new",
        element: <CreateProductForm />,
      },
      {
        path: "products/edit/:id",
        element: <CreateProductForm />,
      },
      {
        path: "products/:id",
        element: <ProductDetail />,
      },
      {
        path: "profile",
        element: <ProfilePage />,
      },
      {
        path: "profile/:id",
        element: <ProfilePage />,
      },
    ],
  },

  // ===== Auth — không dùng layout =====
  {
    path: "/login",
    element: <AuthPage />,
  },
  {
    path: "/register",
    element: <AuthPage />,
  },
  {
    path: "/admin/login",
    element: <AdminLoginPage />,
  },

  // ===== Admin — layout riêng, bọc guard chỉ cho role admin =====
  {
    path: "/admin",
    element: (
      <RequireAdmin>
        <AdminHomePage />
      </RequireAdmin>
    ),
    children: [
      {
        index: true,
        element: <AdminDashboardPage />,
      },
      {
        path: "posts",
        element: <AdminPostsPage />,
      },
      {
        path: "posts/edit/:id",
        element: <PostForm />,
      },
      {
        path: "categories",
        element: <AdminCategoriesPage />,
      },
      {
        path: "products",
        element: <AdminProductsPage />,
      },
      {
        path: "specifications",
        element: <AdminSpecificationPage />,
      },
      {
        path: "users",
        element: <AdminUsersPage />,
      },
      {
        path: "roles",
        element: <AdminRolesUsersPage />,
      },
      {
        path: "permissions",
        element: <AdminPermissionsPage />,
      },
    ],
  },
]);

export default router;
