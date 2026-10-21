import Header from "@/components/header/Header";
import HomePage from "@/pages/HomePage";
import React from "react";
import { Outlet } from "react-router-dom";

const MainLayout = () => {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
