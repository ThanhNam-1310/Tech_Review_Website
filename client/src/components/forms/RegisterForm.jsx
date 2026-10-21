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
    <Card className="w-full border-0 shadow-none sm:border sm:shadow-sm">
      <CardHeader className="space-y-1 px-0 sm:px-6">
        <CardTitle className="text-2xl font-bold text-center mt-3 mb-6">
          Đăng ký
        </CardTitle>

        <CardDescription className="text-center mb-3">
          Đã có tài khoản?{" "}
          <a
            href="/login"
            onClick={(e) => {
              e.preventDefault();
              onSwitchToLogin();
            }}
            className="ml-5 font-medium text-primary underline-offset-4 hover:underline"
          >
            Đăng nhập ngay
          </a>
        </CardDescription>
      </CardHeader>

      <CardContent className="px-0 sm:px-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div className="space-y-4">
            <Label htmlFor="fullName" className="pl-7">
              Họ và tên
            </Label>

            <div className="flex gap-3 items-center">
              <User className="w-5 h-5" />

              <Input
                id="fullName"
                name="fullName"
                type="text"
                placeholder="Nhập họ và tên của bạn."
                required
                value={formData.fullName}
                onChange={handleChange}
                disabled={loading}
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-4 mt-6">
            <Label htmlFor="email" className="pl-7">
              Email
            </Label>

            <div className="flex gap-3 items-center">
              <Mail className="w-5 h-5" />

              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Nhập email của bạn."
                required
                value={formData.email}
                onChange={handleChange}
                disabled={loading}
              />
            </div>
          </div>

          {/* UserName */}
          <div className="space-y-4 mt-6">
            <Label htmlFor="userName" className="pl-7">
              Tên đăng nhập
            </Label>

            <div className="flex gap-3 items-center">
              <User className="w-5 h-5" />

              <Input
                id="userName"
                name="userName"
                type="text"
                placeholder="Nhập tên tài khoản của bạn."
                required
                value={formData.userName}
                onChange={handleChange}
                disabled={loading}
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-4 mt-6">
            <Label htmlFor="password" className="pl-7">
              Mật khẩu
            </Label>

            <div className="relative">
              <div className="flex gap-3 items-center">
                <LockKeyhole className="w-5 h-5" />

                <Input
                  id="password"
                  name="password"
                  type={passwordShow ? "text" : "password"}
                  placeholder="Nhập mật khẩu"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>

              <button
                type="button"
                onClick={handleTogglePassword}
                className="absolute cursor-pointer right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 rounded-full transition-colors"
              >
                {passwordShow ? (
                  <EyeClosed className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="space-y-4 mt-6">
            <Label htmlFor="confirmPassword" className="pl-7">
              Xác nhận mật khẩu
            </Label>

            <div className="relative">
              <div className="flex gap-3 items-center">
                <LockKeyhole className="w-5 h-5" />

                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={confirmPasswordShow ? "text" : "password"}
                  placeholder="Nhập lại mật khẩu"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>

              <button
                type="button"
                onClick={handleToggleConfirmPassword}
                className="absolute cursor-pointer right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 rounded-full transition-colors"
              >
                {confirmPasswordShow ? (
                  <EyeClosed className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}

          {/* Submit */}
          <Button type="submit" className="w-full mt-6" disabled={loading}>
            {loading ? "Đang đăng ký..." : "Đăng ký"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default RegisterForm;
