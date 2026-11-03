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
    <Card className="w-full overflow-hidden border-0 shadow-none sm:rounded-2xl sm:border sm:border-orange-100 sm:bg-gradient-to-b sm:from-orange-50/70 sm:via-white sm:to-white sm:shadow-lg sm:shadow-orange-500/10">
      <div className="h-1.5 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-400" />

      <CardHeader className="space-y-1 px-0 pt-6 sm:px-6">
        <CardTitle className="mb-6 mt-3 bg-gradient-to-r from-orange-600 to-amber-500 bg-clip-text text-center text-2xl font-bold text-transparent">
          Đăng nhập
        </CardTitle>

        <CardDescription className="mb-3 text-center text-zinc-500">
          Chưa có tài khoản?{" "}
          <a
            href="/register"
            onClick={(e) => {
              e.preventDefault();
              navigate("/register");
            }}
            className="ml-5 font-medium text-orange-600 underline-offset-4 hover:text-orange-700 hover:underline"
          >
            Đăng ký ngay
          </a>
        </CardDescription>
      </CardHeader>

      <CardContent className="px-0 sm:px-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* UserName */}
          <div className="space-y-2">
            <Label
              htmlFor="userName"
              className="text-sm font-medium text-zinc-700"
            >
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
            <div className="flex items-center justify-between">
              <Label
                htmlFor="password"
                className="text-sm font-medium text-zinc-700"
              >
                Mật khẩu
              </Label>
            </div>

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

          <div className="flex items-center justify-between">
            {/* Remember me */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember"
                className="cursor-pointer border-orange-300 data-[state=checked]:border-orange-500 data-[state=checked]:bg-orange-500"
                checked={formData.remember}
                onCheckedChange={handleCheckboxChange}
                disabled={loading}
              />

              <Label
                htmlFor="remember"
                className="cursor-pointer text-sm font-medium leading-none text-zinc-700 peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Ghi nhớ đăng nhập
              </Label>
            </div>

            <a
              href="/forgot-password"
              className="text-sm font-medium text-orange-600 underline-offset-4 hover:text-orange-700 hover:underline"
            >
              Quên mật khẩu?
            </a>
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
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default LoginForm;
