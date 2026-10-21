import React from "react";

import { useLocation, useNavigate } from "react-router-dom";

import AuthLayout from "@/layouts/auth-layout/AuthLayout";

import LoginForm from "@/components/forms/LoginForm";
import RegisterForm from "@/components/forms/RegisterForm";

const AuthPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const isRegister = location.pathname === "/register";

  return (
    <AuthLayout isRegister={isRegister}>
      {isRegister ? (
        <RegisterForm onSwitchToLogin={() => navigate("/login")} />
      ) : (
        <LoginForm onSwitchToRegister={() => navigate("/register")} />
      )}
    </AuthLayout>
  );
};

export default AuthPage;
