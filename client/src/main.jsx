import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter, RouterProvider } from "react-router-dom";
import router from "./routers/routers";
import { Toaster } from "./components/ui/sonner";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    {/* <BrowserRouter>
      <App />
    </BrowserRouter> */}
    <RouterProvider router={router} />
    <Toaster richColors position="top-right" />
  </StrictMode>,
);
