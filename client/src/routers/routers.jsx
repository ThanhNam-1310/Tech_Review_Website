import { createBrowserRouter } from "react-router-dom";
import HomePage from "@/pages/HomePage";
import ProductDetail from "@/pages/ProductDetail";
import PostReviewPage from "@/pages/PostReviewPage";
import PostDetail from "@/pages/PostDetail";
import ProductReviewPage from "@/pages/ProductReviewPage";
import AdminHomePage from "@/pages/admin/AdminHomePage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
  },
  {
    path: "products",
    element: <ProductReviewPage />,
  },
  {
    path: "products/:id",
    element: <ProductDetail />,
  },
  {
    path: "post",
    element: <PostReviewPage />,
  },
  {
    path: "post/:id",
    element: <PostDetail />,
  },
  // Admin router
  {
    path: "admin",
    element: <AdminHomePage />,
  },
]);

export default router;
