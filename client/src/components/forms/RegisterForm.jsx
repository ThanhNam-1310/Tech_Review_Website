import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { LockKeyhole, User, Mail, Eye, EyeClosed } from "lucide-react";
import { register } from "@/apis/auth.api";
import { toast } from "sonner";

const RegisterForm = ({ onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    userName: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [passwordShow, setPasswordShow] = useState(false);
  const [confirmPasswordShow, setConfirmPasswordShow] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleTogglePassword = () => {
    setPasswordShow(!passwordShow);
  };

  const handleToggleConfirmPassword = () => {
    setConfirmPasswordShow(!confirmPasswordShow);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (formData.password !== formData.confirmPassword) {
      const errorMessage = "Mật khẩu xác nhận không khớp.";

      setError(errorMessage);

      toast.error(errorMessage, {
        duration: 5000,
      });

      return;
    }

    setLoading(true);

    try {
      await register({
        fullName: formData.fullName,
        email: formData.email,
        userName: formData.userName,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      });

      toast.success("Đăng ký thành công!", {
        duration: 3000,
      });

      // Sau khi đăng ký thành công chuyển về form đăng nhập
      onSwitchToLogin();
    } catch (err) {
      const errorMessage =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Đăng ký thất bại. Vui lòng thử lại.";

      toast.error(errorMessage, {
        duration: 5000,
      });

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full overflow-hidden border-0 shadow-none sm:rounded-2xl sm:border sm:border-orange-100 sm:bg-gradient-to-b sm:from-orange-50/70 sm:via-white sm:to-white sm:shadow-lg sm:shadow-orange-500/10">
      <div className="h-1.5 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-400" />

      <CardHeader className="space-y-1 px-0 pt-6 sm:px-6">
        <CardTitle className="mb-6 mt-3 bg-gradient-to-r from-orange-600 to-amber-500 bg-clip-text text-center text-2xl font-bold text-transparent">
          Đăng ký
        </CardTitle>

        <CardDescription className="mb-3 text-center text-zinc-500">
          Đã có tài khoản?{" "}
          <a
            href="/login"
            onClick={(e) => {
              e.preventDefault();
              onSwitchToLogin();
            }}
            className="ml-5 font-medium text-orange-600 underline-offset-4 hover:text-orange-700 hover:underline"
          >
            Đăng nhập ngay
          </a>
        </CardDescription>
      </CardHeader>

      <CardContent className="px-0 sm:px-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Full Name */}
          <div className="space-y-2">
            <Label htmlFor="fullName" className="text-sm font-medium text-zinc-700">
              Họ và tên
            </Label>

            <div className="relative">
              <User className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-orange-500" />

              <Input
                id="fullName"
                name="fullName"
                type="text"
                placeholder="Nhập họ và tên của bạn."
                required
                value={formData.fullName}
                onChange={handleChange}
                disabled={loading}
                className="h-11 rounded-xl border-orange-100 bg-white pl-10 focus-visible:border-orange-300 focus-visible:ring-orange-400"
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium text-zinc-700">
              Email
            </Label>

            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-orange-500" />

              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Nhập email của bạn."
                required
                value={formData.email}
                onChange={handleChange}
                disabled={loading}
                className="h-11 rounded-xl border-orange-100 bg-white pl-10 focus-visible:border-orange-300 focus-visible:ring-orange-400"
              />
            </div>
          </div>

          {/* UserName */}
          <div className="space-y-2">
            <Label htmlFor="userName" className="text-sm font-medium text-zinc-700">
              Tên đăng nhập
            </Label>

            <div className="relative">
              <User className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-orange-500" />

              <Input
                id="userName"
                name="userName"
                type="text"
                placeholder="Nhập tên tài khoản của bạn."
                required
                value={formData.userName}
                onChange={handleChange}
                disabled={loading}
                className="h-11 rounded-xl border-orange-100 bg-white pl-10 focus-visible:border-orange-300 focus-visible:ring-orange-400"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium text-zinc-700">
              Mật khẩu
            </Label>

            <div className="relative">
              <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-orange-500" />

              <Input
                id="password"
                name="password"
                type={passwordShow ? "text" : "password"}
                placeholder="Nhập mật khẩu"
                required
                value={formData.password}
                onChange={handleChange}
                disabled={loading}
                className="h-11 rounded-xl border-orange-100 bg-white pl-10 pr-10 focus-visible:border-orange-300 focus-visible:ring-orange-400"
              />

              <button
                type="button"
                onClick={handleTogglePassword}
                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer rounded-full p-1 text-zinc-400 transition-colors hover:bg-orange-50 hover:text-orange-600"
              >
                {passwordShow ? (
                  <EyeClosed className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-sm font-medium text-zinc-700">
              Xác nhận mật khẩu
            </Label>

            <div className="relative">
              <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-orange-500" />

              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={confirmPasswordShow ? "text" : "password"}
                placeholder="Nhập lại mật khẩu"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                disabled={loading}
                className="h-11 rounded-xl border-orange-100 bg-white pl-10 pr-10 focus-visible:border-orange-300 focus-visible:ring-orange-400"
              />

              <button
                type="button"
                onClick={handleToggleConfirmPassword}
                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer rounded-full p-1 text-zinc-400 transition-colors hover:bg-orange-50 hover:text-orange-600"
              >
                {confirmPasswordShow ? (
                  <EyeClosed className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="rounded-xl border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}

          {/* Submit */}
          <Button
            type="submit"
            className="h-11 w-full rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 font-semibold text-white shadow-md shadow-orange-500/25 hover:from-orange-600 hover:to-amber-600"
            disabled={loading}
          >
            {loading ? "Đang đăng ký..." : "Đăng ký"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default RegisterForm;
