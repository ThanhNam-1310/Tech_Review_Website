import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { LockKeyhole, User, Eye, EyeClosed } from "lucide-react";
import { login } from "@/apis/auth.api";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const LoginForm = ({ onSwitchToRegister }) => {
  const [formData, setFormData] = useState({
    userName: "",
    password: "",
    remember: false,
  });

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [passwordShow, setPasswordShow] = useState(false);

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

  const handleCheckboxChange = (checked) => {
    setFormData((prev) => ({
      ...prev,
      remember: checked,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      await login({
        userName: formData.userName,
        password: formData.password,
      });

      toast.success("Đăng nhập thành công!", {
        duration: 3000,
      });

      navigate("/");
    } catch (err) {
      const errorMessage =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Đăng nhập thất bại. Vui lòng thử lại.";

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
          Đăng nhập
        </CardTitle>

        <CardDescription className="text-center mb-3">
          Chưa có tài khoản?{" "}
          <a
            href="/register"
            onClick={(e) => {
              e.preventDefault();
              navigate("/register");
            }}
            className="ml-5 font-medium text-primary underline-offset-4 hover:underline"
          >
            Đăng ký ngay
          </a>
        </CardDescription>
      </CardHeader>

      <CardContent className="px-0 sm:px-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* UserName */}
          <div className="space-y-4">
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
          <div className="space-y-4 mt-8">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="pl-7">
                Mật khẩu
              </Label>
            </div>

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

          <div className="flex justify-between items-center mt-10">
            {/* Remember me */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember"
                className="cursor-pointer"
                checked={formData.remember}
                onCheckedChange={handleCheckboxChange}
                disabled={loading}
              />

              <Label
                htmlFor="remember"
                className="text-sm cursor-pointer font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Ghi nhớ đăng nhập
              </Label>
            </div>

            <a
              href="/forgot-password"
              className="text-sm font-medium text-primary underline-offset-4 hover:underline"
            >
              Quên mật khẩu?
            </a>
          </div>

          {/* Error */}
          {error && (
            <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}

          {/* Submit */}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default LoginForm;
