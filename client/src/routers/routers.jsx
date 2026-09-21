import { createBrowserRouter } from "react-router-dom";
import HomePage from "@/pages/HomePage";
import ProductDetail from "@/pages/ProductDetail";

const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
  },
  {
    path: "products/:id",
    element: <ProductDetail />,
  },
]);

export default router;
